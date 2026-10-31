// Inserts a small, identifiable sample dataset without modifying existing records.
// Emails use the reserved .example domain, and no accounts or outgoing mail are created.
import { db } from '../src/infra/db.js';
import { env } from '../src/config/env.js';

const marker = 'sample-data-brightloop-v1';
const day = 86_400_000;
const today = new Date();
today.setUTCHours(0, 0, 0, 0);
const days = (offset: number) => new Date(today.getTime() + offset * day);

try {
  await db.$transaction(async (tx) => {
    if (await tx.counter.findUnique({ where: { key: marker } })) {
      throw new Error('Sample dataset already exists; no records were changed.');
    }
    // Creating the marker first also makes concurrent seed attempts fail atomically.
    await tx.counter.create({ data: { key: marker, value: 1 } });
    const product = await tx.product.create({ data: {
      id: 'sample-product-workspace-v1', name: '[Sample] Workspace subscription', type: 'Digital service',
      salesPrice: '1000.00', costPrice: '250.00', notes: 'Sample catalog record',
      variants: { create: [{ id: 'sample-variant-plus-v1', attribute: 'Tier', value: 'Plus', extraPrice: '500.00' }] },
    } });
    const addon = await tx.product.create({ data: {
      id: 'sample-product-support-v1', name: '[Sample] Priority support', type: 'Add-on',
      salesPrice: '250.00', costPrice: '50.00', notes: 'Sample catalog record',
    } });
    const plan = await tx.plan.create({ data: {
      id: 'sample-plan-monthly-v1', name: '[Sample] Monthly plan', price: '1000.00', billingPeriod: 'MONTHLY',
      availableFrom: days(-365), minQuantity: 1, allowPause: true, allowRenew: true, allowEarlyClose: true,
    } });
    const tax = await tx.tax.create({ data: { id: 'sample-tax-v1', name: '[Sample] Tax 10%', ratePercent: '10.00' } });
    await tx.quotationTemplate.create({ data: {
      id: 'sample-template-v1', name: '[Sample] Workspace quote', validityDays: 15, planId: plan.id,
      lines: { create: [{ id: 'sample-template-line-v1', productId: product.id, quantity: 1, taxId: tax.id }] },
    } });
    // Inactive so this example rule cannot unexpectedly discount real invoices.
    await tx.discount.create({ data: {
      id: 'sample-discount-v1', name: '[Sample] 10% workspace discount (inactive)', type: 'PERCENT', value: '10.00',
      startDate: days(-30), endDate: days(365), usageLimit: 100, scope: 'PRODUCT', productIds: [product.id], isActive: false,
    } });
    const first = await tx.customer.create({ data: { id: 'sample-customer-north-v1', name: '[Sample] Northwind Studio', email: 'northwind@brightloop-sample.example', address: 'Sample address, Bengaluru' } });
    const second = await tx.customer.create({ data: { id: 'sample-customer-river-v1', name: '[Sample] River Labs', email: 'river@brightloop-sample.example', address: 'Sample address, Pune' } });
    // Closed historical subscriptions prevent the scheduler from generating more sample invoices.
    for (const [suffix, customer, paid] of [['north', first, true], ['river', second, false]] as const) {
      const subscription = await tx.subscription.create({ data: {
        id: `sample-subscription-${suffix}-v1`, number: `SAMPLE-SUB-${suffix.toUpperCase()}-V1`, customerId: customer.id, planId: plan.id,
        startDate: days(-90), expiryDate: days(-30), billingAnchorDay: days(-90).getUTCDate(), validityDays: 15,
        dueDays: 15, paymentTerms: 'Net 15', status: 'CLOSED',
        lines: { create: [{ id: `sample-sub-line-${suffix}-v1`, productId: product.id, quantity: 1, unitPrice: '1000.00', taxId: tax.id }] },
      } });
      const invoice = await tx.invoice.create({ data: {
        id: `sample-invoice-${suffix}-v1`, number: `SAMPLE-INV-${suffix.toUpperCase()}-V1`, subscriptionId: subscription.id,
        customerId: customer.id, customerName: customer.name, customerEmail: customer.email, customerAddress: customer.address,
        currency: env.CURRENCY, periodStart: days(-60), periodEnd: days(-30), issueDate: days(-60), dueDate: days(-45),
        status: paid ? 'PAID' : 'CONFIRMED', subtotal: '1000.00', discountTotal: '0.00', taxTotal: '100.00', total: '1100.00', amountPaid: paid ? '1100.00' : '0.00',
        lines: { create: [{ id: `sample-invoice-line-${suffix}-v1`, description: '[Sample] Workspace subscription', quantity: 1, unitPrice: '1000.00', discountAmount: '0.00', taxRate: '10.00', taxAmount: '100.00', lineTotal: '1100.00' }] },
      } });
      if (paid) await tx.payment.create({ data: { id: 'sample-payment-north-v1', invoiceId: invoice.id, method: 'BANK_TRANSFER', amount: '1100.00', paidAt: days(-50), note: '[Sample] Historical payment' } });
    }
    console.info(`Prepared 2 products (including ${addon.name}), 1 plan, 1 tax, 1 inactive discount, 1 template, 2 customers, 2 historical subscriptions, 2 invoices and 1 payment.`);
  }, { timeout: 30000 });
  console.info('Sample dataset committed successfully.');
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Sample dataset could not be created.');
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
