import type { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { db, transaction } from '../../infra/db.js';
import { assert } from '../../shared/errors.js';
import { addDays, addPeriod } from '../../shared/dates.js';
import { checkLine } from '../catalog/service.js';
import { nextNumber } from '../../services/numbering.service.js';
import { queueMail } from '../../services/mail.service.js';
import * as schema from './schema.js';
export const detail = {
  lines: { include: { product: true, variant: true, tax: true } },
  plan: true,
  customer: true,
} satisfies Prisma.SubscriptionInclude;
export async function resolveLines(
  tx: Prisma.TransactionClient,
  lines: z.infer<typeof schema.line>[],
) {
  const output = [];
  for (const line of lines) {
    const { product, variant } = await checkLine(tx, line);
    output.push({
      productId: line.productId,
      variantId: line.variantId,
      quantity: line.quantity,
      taxId: line.taxId,
      unitPrice: line.unitPrice ?? product.salesPrice.add(variant?.extraPrice ?? 0).toFixed(2),
    });
  }
  return output;
}
export async function create(data: z.infer<typeof schema.create>) {
  return transaction(async (tx) => {
    const template = data.templateId
      ? await tx.quotationTemplate.findUniqueOrThrow({
          where: { id: data.templateId },
          include: { lines: true },
        })
      : null;
    assert(
      !template || !data.planId || template.planId === data.planId,
      400,
      'PLAN_MISMATCH',
      'Template and plan must match',
    );
    const plan = await tx.plan.findUniqueOrThrow({
      where: { id: data.planId ?? template!.planId },
    });
    assert(
      plan.isActive &&
        data.startDate >= plan.availableFrom &&
        (!plan.availableTo || data.startDate <= plan.availableTo),
      400,
      'PLAN_UNAVAILABLE',
      'Plan unavailable for selected start date',
    );
    const input = data.lines ?? template?.lines;
    assert(input?.length, 400, 'LINES_REQUIRED', 'Subscription requires product lines');
    const lines = await resolveLines(tx, input);
    assert(
      lines.reduce((s, l) => s + l.quantity, 0) >= plan.minQuantity,
      400,
      'MIN_QUANTITY',
      'Plan minimum quantity not met',
    );
    assert(
      data.validityDays || template,
      400,
      'VALIDITY_REQUIRED',
      'Provide validityDays when creating without a quotation template',
    );
    return tx.subscription.create({
      data: {
        number: await nextNumber(tx, 'SUB'),
        customerId: data.customerId,
        planId: plan.id,
        startDate: data.startDate,
        expiryDate: data.expiryDate,
        billingAnchorDay: data.startDate.getUTCDate(),
        dueDays: data.dueDays,
        paymentTerms: data.dueDays ? `Net ${data.dueDays}` : 'Immediate',
        validityDays: data.validityDays ?? template!.validityDays,
        lines: { create: lines },
      },
      include: detail,
    });
  });
}
export async function get(id: string, customerId?: string) {
  const sub = await db.subscription.findFirst({ where: { id, customerId }, include: detail });
  assert(sub, 404, 'NOT_FOUND', 'Subscription not found');
  return { ...sub, pastExpiry: sub.status === 'ACTIVE' && sub.expiryDate < new Date() };
}
export async function transition(
  id: string,
  action: (typeof schema.actions)[number],
  customerId?: string,
  now = new Date(),
) {
  const sub = await transaction(async (tx) => {
    const s = await tx.subscription.findFirst({ where: { id, customerId }, include: detail });
    assert(s, 404, 'NOT_FOUND', 'Subscription not found');
    const active = () =>
      assert(
        s.status === 'ACTIVE',
        409,
        'INVALID_TRANSITION',
        'Action requires an active subscription',
      );
    const data: Prisma.SubscriptionUpdateInput = {};
    switch (action) {
      case 'send-quote':
        assert(
          s.status === 'DRAFT',
          409,
          'INVALID_TRANSITION',
          'Only drafts can become quotations',
        );
        data.status = 'QUOTATION';
        data.quotationValidUntil = addDays(now, s.validityDays);
        break;
      case 'confirm':
        assert(
          s.status === 'QUOTATION',
          409,
          'INVALID_TRANSITION',
          'Only quotations can be confirmed',
        );
        assert(
          s.quotationValidUntil && s.quotationValidUntil >= now,
          409,
          'QUOTE_EXPIRED',
          'Quotation expired',
        );
        data.status = 'CONFIRMED';
        break;
      case 'activate':
        assert(
          s.status === 'CONFIRMED',
          409,
          'INVALID_TRANSITION',
          'Only confirmed subscriptions can be activated',
        );
        data.status = 'ACTIVE';
        data.nextBillingDate = s.startDate;
        break;
      case 'close':
        active();
        assert(s.plan.allowEarlyClose, 403, 'PLAN_RESTRICTION', 'Plan does not allow early close');
        data.status = 'CLOSED';
        data.nextBillingDate = null;
        break;
      case 'pause':
        active();
        assert(s.plan.allowPause, 403, 'PLAN_RESTRICTION', 'Plan does not allow pause');
        assert(!s.pausedAt, 409, 'ALREADY_PAUSED', 'Subscription already paused');
        data.pausedAt = now;
        break;
      case 'resume':
        active();
        assert(s.plan.allowPause, 403, 'PLAN_RESTRICTION', 'Plan does not allow resume');
        assert(s.pausedAt, 409, 'NOT_PAUSED', 'Subscription is not paused');
        data.pausedAt = null;
        data.billingAnchorDay = now.getUTCDate();
        data.nextBillingDate = addPeriod(now, s.plan.billingPeriod);
        break;
      case 'renew':
        active();
        assert(s.plan.allowRenew, 403, 'PLAN_RESTRICTION', 'Plan does not allow renewal');
        data.expiryDate = addPeriod(s.expiryDate, s.plan.billingPeriod);
        break;
    }
    const updated = await tx.subscription.update({ where: { id }, data, include: detail });
    if (action === 'send-quote')
      await queueMail(
        tx,
        s.customer.email,
        `Quotation ${s.number}`,
        `Quotation ${s.number} is valid until ${updated.quotationValidUntil!.toISOString()}.\n${s.lines.map((l) => `${l.product.name}: ${l.quantity} x ${l.unitPrice}`).join('\n')}`,
      );
    return updated;
  });
  return sub;
}
export async function editLines(id: string, lines: z.infer<typeof schema.line>[]) {
  return transaction(async (tx) => {
    const s = await tx.subscription.findUniqueOrThrow({ where: { id }, include: { plan: true } });
    assert(
      s.status === 'DRAFT' || s.status === 'ACTIVE',
      409,
      'LINES_LOCKED',
      'Lines can only be edited in Draft or Active',
    );
    assert(
      lines.reduce((sum, l) => sum + l.quantity, 0) >= s.plan.minQuantity,
      400,
      'MIN_QUANTITY',
      'Plan minimum quantity not met',
    );
    return tx.subscription.update({
      where: { id },
      data: { lines: { deleteMany: {}, create: await resolveLines(tx, lines) } },
      include: detail,
    });
  });
}
export async function changeAddon(
  id: string,
  customerId: string,
  data: z.infer<typeof schema.addon>,
) {
  return transaction(async (tx) => {
    const s = await tx.subscription.findFirst({
      where: { id, customerId },
      include: { lines: true, plan: true },
    });
    assert(s, 404, 'NOT_FOUND', 'Subscription not found');
    assert(
      s.status === 'ACTIVE',
      409,
      'INVALID_TRANSITION',
      'Add-ons require an active subscription',
    );
    const product = await tx.product.findUniqueOrThrow({ where: { id: data.productId } });
    assert(
      product.type.toLowerCase() === 'add-on',
      400,
      'NOT_ADDON',
      'Product must have type Add-on',
    );
    const matches = s.lines.filter(
      (l) => l.productId === data.productId && l.variantId === (data.variantId ?? null),
    );
    if (data.action === 'remove') {
      assert(matches.length, 404, 'NOT_FOUND', 'Add-on not found');
      assert(
        s.lines.filter((l) => !matches.includes(l)).reduce((n, l) => n + l.quantity, 0) >=
          s.plan.minQuantity,
        400,
        'MIN_QUANTITY',
        'Cannot remove below plan minimum',
      );
      await tx.subscriptionLine.deleteMany({ where: { id: { in: matches.map((l) => l.id) } } });
    } else {
      assert(!matches.length, 409, 'ALREADY_ADDED', 'Add-on is already enabled');
      assert(s.lines.length < 100, 400, 'LINE_LIMIT', 'Maximum 100 lines');
      const [line] = await resolveLines(tx, [data]);
      await tx.subscriptionLine.create({
        data: {
          subscriptionId: id,
          productId: line.productId,
          variantId: line.variantId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        },
      });
    }
    return tx.subscription.findUniqueOrThrow({ where: { id }, include: detail });
  });
}
