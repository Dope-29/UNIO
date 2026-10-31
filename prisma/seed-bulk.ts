import 'dotenv/config';
import type { Prisma } from '@prisma/client';
import { db } from '../src/infra/db.js';
import { addDays, addPeriod, startOfDay } from '../src/shared/dates.js';
async function batch<T>(rows: T[], write: (rows: T[]) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += 1000) await write(rows.slice(i, i + 1000));
}
async function seed() {
  if (process.env.SEED_BULK_CONFIRM !== 'development-fixtures')
    throw new Error('Set SEED_BULK_CONFIRM=development-fixtures to insert the bulk demo dataset');
  const periods = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const;
  const today = startOfDay();
  await db.product.upsert({
    where: { id: 'bulk-product' },
    update: {},
    create: {
      id: 'bulk-product',
      name: 'Bulk demo product',
      type: 'Software',
      salesPrice: 100,
      costPrice: 20,
    },
  });
  for (const p of periods)
    await db.plan.upsert({
      where: { id: `bulk-${p}` },
      update: {},
      create: {
        id: `bulk-${p}`,
        name: `Bulk ${p}`,
        price: 100,
        billingPeriod: p,
        availableFrom: new Date('2020-01-01'),
        allowEarlyClose: true,
        allowRenew: true,
        allowPause: true,
      },
    });
  await batch(
    Array.from({ length: 200 }, (_, i) => ({
      id: `bulk-c-${i}`,
      name: `Demo customer ${i}`,
      email: `bulk-${i}@example.test`,
    })),
    (data) => db.customer.createMany({ data, skipDuplicates: true }),
  );
  const subs: Prisma.SubscriptionCreateManyInput[] = Array.from({ length: 5000 }, (_, i) => ({
    id: `bulk-s-${i}`,
    number: `DEMO-SUB-${i}`,
    customerId: `bulk-c-${i % 200}`,
    planId: `bulk-${periods[i % 4]}`,
    startDate: new Date('2022-01-01'),
    expiryDate: addDays(today, 365),
    billingAnchorDay: 1,
    validityDays: 15,
    dueDays: 0,
    paymentTerms: 'Immediate',
    status: 'ACTIVE',
    nextBillingDate: today,
  }));
  await batch(subs, (data) => db.subscription.createMany({ data, skipDuplicates: true }));
  await batch(
    subs.map((s, i) => ({
      id: `bulk-sl-${i}`,
      subscriptionId: s.id!,
      productId: 'bulk-product',
      quantity: 1,
      unitPrice: 100,
    })),
    (data) => db.subscriptionLine.createMany({ data, skipDuplicates: true }),
  );
  const invoices: Prisma.InvoiceCreateManyInput[] = [];
  const lines: Prisma.InvoiceLineCreateManyInput[] = [];
  const payments: Prisma.PaymentCreateManyInput[] = [];
  for (let i = 0; i < 15000; i++) {
    const subIndex = Math.floor(i / 3);
    const p = periods[subIndex % 4];
    let periodStart = new Date('2022-01-01');
    for (let j = 0; j < i % 3; j++) periodStart = addPeriod(periodStart, p, 1);
    const paid = i < 10000;
    const dueDate = addDays(today, i % 2 === 0 ? -30 : 15);
    const issueDate = addDays(dueDate, -15);
    const id = `bulk-i-${i}`;
    invoices.push({
      id,
      number: `DEMO-INV-${i}`,
      subscriptionId: `bulk-s-${subIndex}`,
      customerId: `bulk-c-${subIndex % 200}`,
      customerName: `Demo customer ${subIndex % 200}`,
      customerEmail: `bulk-${subIndex % 200}@example.test`,
      currency: 'INR',
      periodStart,
      periodEnd: addPeriod(periodStart, p, 1),
      issueDate,
      dueDate,
      status: paid ? 'PAID' : 'CONFIRMED',
      subtotal: 100,
      discountTotal: 0,
      taxTotal: 0,
      total: 100,
      amountPaid: paid ? 100 : 0,
    });
    lines.push({
      id: `bulk-il-${i}`,
      invoiceId: id,
      description: 'Bulk demo product',
      quantity: 1,
      unitPrice: 100,
      discountAmount: 0,
      taxRate: 0,
      taxAmount: 0,
      lineTotal: 100,
    });
    if (paid)
      payments.push({
        id: `bulk-pay-${i}`,
        invoiceId: id,
        method: 'BANK_TRANSFER',
        amount: 100,
        paidAt: addDays(today, -(i % 60)),
        note: 'Synthetic performance fixture',
      });
  }
  await batch(invoices, (data) => db.invoice.createMany({ data, skipDuplicates: true }));
  await batch(lines, (data) => db.invoiceLine.createMany({ data, skipDuplicates: true }));
  await batch(payments, (data) => db.payment.createMany({ data, skipDuplicates: true }));
  console.info('Seeded 200 customers, 5000 subscriptions, 15000 invoices and 10000 payments.');
}
seed().finally(() => db.$disconnect());
