import 'dotenv/config';
import bcrypt from 'bcrypt';
import { db } from '../src/infra/db.js';
import { email, passwordRule } from '../src/shared/schema.js';
async function seed() {
  const adminEmail = email.parse(process.env.SEED_ADMIN_EMAIL);
  const password = passwordRule.parse(process.env.SEED_ADMIN_PASSWORD);
  await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Brightloop Admin',
      passwordHash: await bcrypt.hash(password, 12),
      role: 'ADMIN',
    },
  });
  const product = await db.product.upsert({
    where: { id: 'demo-software' },
    update: {},
    create: {
      id: 'demo-software',
      name: 'Brightloop Suite',
      type: 'Software',
      salesPrice: '1000',
      costPrice: '400',
    },
  });
  await db.product.upsert({
    where: { id: 'demo-addon' },
    update: {},
    create: {
      id: 'demo-addon',
      name: 'Extra storage',
      type: 'Add-on',
      salesPrice: '100',
      costPrice: '20',
    },
  });
  await db.productVariant.upsert({
    where: { id: 'demo-variant' },
    update: {},
    create: {
      id: 'demo-variant',
      productId: product.id,
      attribute: 'Brand',
      value: 'Odoo',
      extraPrice: '560',
    },
  });
  await db.tax.upsert({
    where: { id: 'demo-tax' },
    update: {},
    create: { id: 'demo-tax', name: 'Demo tax', ratePercent: '18' },
  });
  for (const billingPeriod of ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const)
    await db.plan.upsert({
      where: { id: `demo-${billingPeriod}` },
      update: {},
      create: {
        id: `demo-${billingPeriod}`,
        name: `${billingPeriod} plan`,
        price: '1000',
        billingPeriod,
        availableFrom: new Date('2020-01-01'),
        allowPause: true,
        allowRenew: true,
        allowEarlyClose: true,
      },
    });
  await db.quotationTemplate.upsert({
    where: { id: 'demo-template' },
    update: {},
    create: {
      id: 'demo-template',
      name: 'Suite quote',
      planId: 'demo-MONTHLY',
      validityDays: 15,
      lines: {
        create: {
          productId: product.id,
          variantId: 'demo-variant',
          quantity: 1,
          taxId: 'demo-tax',
        },
      },
    },
  });
  await db.discount.upsert({
    where: { id: 'demo-discount' },
    update: {},
    create: {
      id: 'demo-discount',
      name: 'Welcome 10%',
      type: 'PERCENT',
      value: '10',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-12-31'),
      usageLimit: 2,
      scope: 'SUBSCRIPTION',
      productIds: [],
    },
  });
  console.info('Demo catalog and admin seeded. Existing admin password was not changed.');
}
seed().finally(() => db.$disconnect());
