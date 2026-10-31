import { db, transaction } from '../infra/db.js';
import { env } from '../config/env.js';
import { assert } from '../shared/errors.js';
import { addDays, addPeriod } from '../shared/dates.js';
import { nextNumber } from './numbering.service.js';
import { priceInvoice } from './pricing.service.js';
export async function generateInvoiceForSubscription(subId: string, asOf: Date) {
  const basis = env.DISCOUNT_PERCENT_BASE;
  return transaction(async (tx) => {
    const sub = await tx.subscription.findUniqueOrThrow({
      where: { id: subId },
      include: {
        plan: true,
        customer: true,
        lines: { include: { product: true, variant: true, tax: true }, orderBy: { id: 'asc' } },
      },
    });
    if (sub.status !== 'ACTIVE') return { skipped: 'not active' };
    if (
      sub.plan.autoCloseOnEnd &&
      sub.expiryDate <= asOf &&
      (sub.pausedAt || !sub.nextBillingDate || sub.nextBillingDate >= sub.expiryDate)
    ) {
      await tx.subscription.update({
        where: { id: sub.id },
        data: { status: 'CLOSED', nextBillingDate: null },
      });
      return { skipped: 'plan ended' };
    }
    if (sub.pausedAt || !sub.nextBillingDate || sub.nextBillingDate > asOf)
      return { skipped: 'not due' };
    // Bill any outstanding pre-expiry periods before automatic closure, never skip them.
    if (sub.plan.autoCloseOnEnd && sub.nextBillingDate >= sub.expiryDate) {
      await tx.subscription.update({
        where: { id: sub.id },
        data: { status: 'CLOSED', nextBillingDate: null },
      });
      return { skipped: 'plan ended' };
    }
    const periodStart = sub.nextBillingDate;
    const periodEnd = addPeriod(periodStart, sub.plan.billingPeriod, sub.billingAnchorDay);
    const existing = await tx.invoice.findUnique({
      where: { subscriptionId_periodStart: { subscriptionId: sub.id, periodStart } },
    });
    if (existing) {
      await tx.subscription.update({ where: { id: sub.id }, data: { nextBillingDate: periodEnd } });
      return { skipped: 'already billed' };
    }
    const discounts = await tx.discount.findMany({
      where: { isActive: true, startDate: { lte: asOf }, endDate: { gte: asOf } },
      orderBy: { id: 'asc' },
    });
    const calc = priceInvoice(
      sub.lines.map((l) => ({
        productId: l.productId,
        description:
          l.product.name + (l.variant ? ` (${l.variant.attribute}: ${l.variant.value})` : ''),
        quantity: l.quantity,
        unitPrice: l.unitPrice.toFixed(2),
        taxRate: l.tax?.isActive ? l.tax.ratePercent.toFixed(2) : '0',
      })),
      discounts.map((d) => ({
        ...d,
        value: d.value.toString(),
        minPurchase: d.minPurchase?.toString(),
      })),
      asOf,
      basis,
    );
    const invoice = await tx.invoice.create({
      data: {
        ...calc.header,
        number: await nextNumber(tx, 'INV'),
        subscriptionId: sub.id,
        customerId: sub.customerId,
        customerName: sub.customer.name,
        customerEmail: sub.customer.email,
        customerAddress: sub.customer.address,
        currency: env.CURRENCY,
        periodStart,
        periodEnd,
        issueDate: asOf,
        dueDate: addDays(asOf, sub.dueDays),
        lines: { create: calc.lines },
        discounts: {
          create: calc.appliedDiscounts.map((d) => ({ discountId: d.id, amount: d.amount })),
        },
      },
    });
    for (const d of calc.appliedDiscounts) {
      const rule = discounts.find((x) => x.id === d.id)!;
      const result = await tx.discount.updateMany({
        where: { id: d.id, usedCount: { lt: rule.usageLimit } },
        data: { usedCount: { increment: 1 } },
      });
      assert(
        result.count === 1,
        409,
        'DISCOUNT_EXHAUSTED',
        'Discount usage exhausted concurrently; retry billing',
      );
    }
    await tx.subscription.update({ where: { id: sub.id }, data: { nextBillingDate: periodEnd } });
    return { created: invoice.id };
  });
}
export async function runBilling(asOf = new Date()) {
  await db.subscription.updateMany({
    where: {
      status: 'ACTIVE',
      plan: { autoCloseOnEnd: true },
      expiryDate: { lte: asOf },
      OR: [
        { pausedAt: { not: null } },
        { nextBillingDate: null },
        { nextBillingDate: { gte: db.subscription.fields.expiryDate } },
      ],
    },
    data: { status: 'CLOSED', nextBillingDate: null },
  });
  const result = {
    created: 0,
    skipped: 0,
    failed: 0,
    failures: [] as { subscriptionId: string; message: string }[],
  };
  let cursor: string | undefined;
  do {
    const subs = await db.subscription.findMany({
      where: { status: 'ACTIVE', pausedAt: null, nextBillingDate: { lte: asOf } },
      select: { id: true },
      orderBy: { id: 'asc' },
      take: 200,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    if (!subs.length) break;
    for (const s of subs) {
      try {
        const r = await generateInvoiceForSubscription(s.id, asOf);
        if ('created' in r) result.created++;
        else result.skipped++;
      } catch (error) {
        result.failed++;
        result.failures.push({
          subscriptionId: s.id,
          message: 'Billing failed; retry on next run',
        });
        console.error('Billing failed', s.id, error);
      }
    }
    cursor = subs.at(-1)!.id;
  } while (cursor);
  // One period per subscription per run: catch-up runs preserve every period and stay bounded.
  return result;
}
