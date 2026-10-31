import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { randomUUID, createHmac } from 'node:crypto';
import { db } from '../src/infra/db.js';
import { app } from '../src/app.js';
import { signSession, hashToken, reset } from '../src/modules/auth/service.js';
import { generateInvoiceForSubscription } from '../src/services/billing.service.js';
import { recordPayment } from '../src/modules/payments/service.js';
import { confirm, cancel, getInvoice } from '../src/modules/invoices/service.js';
import { transition, changeAddon } from '../src/modules/subscriptions/service.js';
const suite = process.env.TEST_DATABASE_URL ? describe : describe.skip;
suite('PostgreSQL API and transaction integration', () => {
  const prefix = `test-${randomUUID()}`;
  let customerId: string,
    otherCustomerId: string,
    staffId: string,
    adminCookie: string,
    staffCookie: string,
    customerCookie: string,
    planId: string,
    productId: string,
    addonId: string,
    taxId: string,
    discountId: string;
  const now = new Date();
  async function makeSub(suffix: string, extra: Record<string, unknown> = {}) {
    return db.subscription.create({
      data: {
        number: `${prefix}-${suffix}`,
        customerId,
        planId,
        startDate: now,
        expiryDate: new Date(now.getTime() + 365 * 86400000),
        billingAnchorDay: now.getUTCDate(),
        validityDays: 15,
        dueDays: 0,
        paymentTerms: 'Immediate',
        status: 'ACTIVE',
        nextBillingDate: now,
        lines: { create: { productId, quantity: 1, unitPrice: '100', taxId } },
        ...extra,
      },
    });
  }
  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('PasswordGood!', 4);
    const admin = await db.user.create({
      data: { email: `${prefix}-admin@example.test`, name: 'Admin', passwordHash, role: 'ADMIN' },
    });
    const staff = await db.user.create({
      data: { email: `${prefix}-staff@example.test`, name: 'Staff', passwordHash, role: 'STAFF' },
    });
    staffId = staff.id;
    const user = await db.user.create({
      data: {
        email: `${prefix}-customer@example.test`,
        name: 'Customer',
        passwordHash,
        role: 'CUSTOMER',
      },
    });
    const customer = await db.customer.create({
      data: { name: 'Test customer', email: user.email, userId: user.id },
    });
    customerId = customer.id;
    otherCustomerId = (
      await db.customer.create({
        data: { name: 'Other customer', email: `${prefix}-other@example.test` },
      })
    ).id;
    adminCookie = `session=${signSession(admin)}`;
    staffCookie = `session=${signSession(staff)}`;
    customerCookie = `session=${signSession(user)}`;
    planId = (
      await db.plan.create({
        data: {
          name: prefix,
          price: 50,
          billingPeriod: 'MONTHLY',
          availableFrom: new Date('2020-01-01'),
          allowPause: true,
          allowRenew: true,
          allowEarlyClose: true,
        },
      })
    ).id;
    productId = (
      await db.product.create({
        data: { name: prefix, type: 'Software', salesPrice: 100, costPrice: 20 },
      })
    ).id;
    addonId = (
      await db.product.create({
        data: { name: `${prefix}-addon`, type: 'Add-on', salesPrice: 10, costPrice: 1 },
      })
    ).id;
    taxId = (await db.tax.create({ data: { name: prefix, ratePercent: 10 } })).id;
    discountId = (
      await db.discount.create({
        data: {
          name: prefix,
          type: 'PERCENT',
          value: 10,
          scope: 'PRODUCT',
          productIds: [productId],
          usageLimit: 2,
          startDate: new Date('2020-01-01'),
          endDate: new Date('2099-01-01'),
        },
      })
    ).id;
  });
  afterAll(async () => {
    // Only remove fixtures owned by this suite, in foreign-key order.
    const customers = await db.customer.findMany({
      where: { email: { startsWith: prefix } },
      select: { id: true },
    });
    const ids = customers.map((x) => x.id);
    const invoices = await db.invoice.findMany({
      where: { customerId: { in: ids } },
      select: { id: true },
    });
    const invIds = invoices.map((x) => x.id);
    await db.gatewayOrder.deleteMany({ where: { invoiceId: { in: invIds } } });
    await db.reminderLog.deleteMany({ where: { invoiceId: { in: invIds } } });
    await db.payment.deleteMany({ where: { invoiceId: { in: invIds } } });
    await db.invoiceDiscount.deleteMany({ where: { invoiceId: { in: invIds } } });
    await db.invoiceLine.deleteMany({ where: { invoiceId: { in: invIds } } });
    await db.invoice.deleteMany({ where: { id: { in: invIds } } });
    await db.subscription.deleteMany({ where: { customerId: { in: ids } } });
    await db.customer.deleteMany({ where: { id: { in: ids } } });
    await db.user.deleteMany({ where: { email: { startsWith: prefix } } });
    await db.discount.deleteMany({ where: { name: prefix } });
    await db.quotationTemplate.deleteMany({ where: { name: prefix } });
    await db.productVariant.deleteMany({ where: { productId } });
    await db.product.deleteMany({ where: { name: { startsWith: prefix } } });
    await db.plan.deleteMany({ where: { name: prefix } });
    await db.tax.deleteMany({ where: { name: prefix } });
    await db.mailOutbox.deleteMany({ where: { to: { startsWith: prefix } } });
    await db.$disconnect();
  });
  it('allows staff reads but rejects writes and staff creation', async () => {
    expect((await request(app).get('/api/discounts').set('Cookie', staffCookie)).status).toBe(200);
    expect(
      (
        await request(app)
          .post('/api/taxes')
          .set('Cookie', staffCookie)
          .send({ name: 'Denied', ratePercent: '10' })
      ).status,
    ).toBe(403);
    expect(
      (await request(app).post('/api/users/staff').set('Cookie', staffCookie).send({})).status,
    ).toBe(403);
  });
  it('supports signup, lowercase uniqueness, and role protection', async () => {
    const data = {
      name: 'Signup',
      email: `${prefix}-signup@example.test`,
      password: 'PasswordGood!',
    };
    expect((await request(app).post('/api/auth/signup').send(data)).status).toBe(201);
    expect(
      (
        await request(app)
          .post('/api/auth/signup')
          .send({ ...data, email: data.email.toUpperCase() })
      ).status,
    ).toBe(409);
  });
  it('links self signup to an existing staff-created customer', async () => {
    const email = `${prefix}-link@example.test`;
    const existing = await db.customer.create({ data: { email, name: 'Company contact' } });
    expect(
      (
        await request(app)
          .post('/api/auth/signup')
          .send({ name: 'Login', email, password: 'PasswordGood!' })
      ).status,
    ).toBe(201);
    const linked = await db.customer.findUniqueOrThrow({ where: { id: existing.id } });
    expect(linked.userId).not.toBeNull();
  });
  it('copies product price plus variant extra and ignores plan price', async () => {
    const variant = await db.productVariant.create({
      data: { productId, attribute: 'Brand', value: 'Odoo', extraPrice: 560 },
    });
    const r = await request(app)
      .post('/api/subscriptions')
      .set('Cookie', staffCookie)
      .send({
        customerId,
        planId,
        startDate: now.toISOString(),
        expiryDate: new Date(now.getTime() + 86400000).toISOString(),
        validityDays: 15,
        lines: [{ productId, variantId: variant.id, quantity: 1 }],
      });
    expect(r.status).toBe(201);
    expect(r.body.data.lines[0].unitPrice).toBe('660');
  });
  it('bills concurrently once and advances next date once', async () => {
    const s = await makeSub('race');
    const results = await Promise.all([
      generateInvoiceForSubscription(s.id, now),
      generateInvoiceForSubscription(s.id, now),
    ]);
    expect(results.filter((r) => 'created' in r)).toHaveLength(1);
    expect(await db.invoice.count({ where: { subscriptionId: s.id } })).toBe(1);
    const invoice = await db.invoice.findFirstOrThrow({ where: { subscriptionId: s.id } });
    expect(invoice.total.toFixed(2)).toBe('99.00');
  });
  it('does not exceed discount usage under contention across subscriptions', async () => {
    const a = await makeSub('limit-a');
    const b = await makeSub('limit-b');
    await Promise.all([
      generateInvoiceForSubscription(a.id, now),
      generateInvoiceForSubscription(b.id, now),
    ]);
    expect((await db.discount.findUniqueOrThrow({ where: { id: discountId } })).usedCount).toBe(2);
    const invs = await db.invoice.findMany({ where: { subscriptionId: { in: [a.id, b.id] } } });
    expect(invs.map((i) => i.discountTotal.toFixed(2)).sort()).toEqual(['0.00', '10.00']);
  });
  it('preserves invoice snapshot after tax changes; cancellation restores usage once', async () => {
    const invoice = await db.invoice.findFirstOrThrow({
      where: { subscription: { number: `${prefix}-race` } },
    });
    await db.tax.update({ where: { id: taxId }, data: { ratePercent: 20 } });
    expect((await getInvoice(invoice.id)).taxTotal.toFixed(2)).toBe('9.00');
    await cancel(invoice.id);
    expect((await db.discount.findUniqueOrThrow({ where: { id: discountId } })).usedCount).toBe(1);
    await expect(cancel(invoice.id)).rejects.toThrow();
    expect((await db.discount.findUniqueOrThrow({ where: { id: discountId } })).usedCount).toBe(1);
  });
  it('processes a signed captured payment exactly once across webhook replays', async () => {
    const s = await makeSub('webhook');
    const result = await generateInvoiceForSubscription(s.id, now);
    const invoice = await confirm(result.created!);
    const orderId = `order_${prefix}`;
    await db.gatewayOrder.create({
      data: {
        id: orderId,
        invoiceId: invoice.id,
        amount: invoice.total,
        currency: invoice.currency,
      },
    });
    const body = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: `pay_${prefix}`,
            order_id: orderId,
            amount: invoice.total.mul(100).toNumber(),
            currency: invoice.currency,
            status: 'captured',
            created_at: Math.floor(now.getTime() / 1000),
          },
        },
      },
    });
    const signature = createHmac('sha256', 'test-webhook-secret').update(body).digest('hex');
    for (let i = 0; i < 2; i++) {
      const r = await request(app)
        .post('/api/payments/webhook')
        .type('json')
        .set('x-razorpay-signature', signature)
        .send(body);
      expect(r.status).toBe(200);
    }
    expect(await db.payment.count({ where: { invoiceId: invoice.id } })).toBe(1);
    expect((await getInvoice(invoice.id)).status).toBe('PAID');
  });
  it('rejects tampered webhook and manual ONLINE injection', async () => {
    expect(
      (
        await request(app)
          .post('/api/payments/webhook')
          .type('json')
          .set('x-razorpay-signature', 'a'.repeat(64))
          .send('{}')
      ).status,
    ).toBe(400);
    const s = await makeSub('manual-online');
    const inv = await generateInvoiceForSubscription(s.id, now);
    expect(
      (
        await request(app)
          .post(`/api/invoices/${inv.created}/payments`)
          .set('Cookie', adminCookie)
          .send({ method: 'ONLINE', amount: '1', paidAt: now.toISOString() })
      ).status,
    ).toBe(400);
  });
  it('supports all catalog create routes and template-derived subscriptions', async () => {
    const post = (path: string, body: object) =>
      request(app).post(`/api/${path}`).set('Cookie', adminCookie).send(body);
    const p = await post('products', {
      name: prefix,
      type: 'Software',
      salesPrice: '20',
      costPrice: '5',
    });
    expect(p.status).toBe(201);
    const plan = await post('plans', {
      name: prefix,
      price: '20',
      billingPeriod: 'WEEKLY',
      availableFrom: '2020-01-01T00:00:00Z',
    });
    expect(plan.status).toBe(201);
    const tax = await post('taxes', { name: prefix, ratePercent: '5' });
    expect(tax.status).toBe(201);
    expect(
      (
        await post('discounts', {
          name: prefix,
          type: 'FIXED',
          value: '1',
          scope: 'PRODUCT',
          productIds: [p.body.data.id],
          startDate: '2020-01-01T00:00:00Z',
          endDate: '2099-01-01T00:00:00Z',
          usageLimit: 1,
        })
      ).status,
    ).toBe(201);
    const t = await post('templates', {
      name: prefix,
      validityDays: 15,
      planId: plan.body.data.id,
      lines: [{ productId: p.body.data.id, taxId: tax.body.data.id, quantity: 2 }],
    });
    expect(t.status).toBe(201);
    const s = await post('subscriptions', {
      customerId,
      templateId: t.body.data.id,
      startDate: now.toISOString(),
      expiryDate: new Date(now.getTime() + 86400000).toISOString(),
    });
    expect(s.status).toBe(201);
    expect(s.body.data.lines[0].unitPrice).toBe('20');
  });
  it('returns PDFs, overdue invoices, reports and safe CSV', async () => {
    const s = await makeSub('report');
    const result = await generateInvoiceForSubscription(s.id, now);
    await confirm(result.created!);
    await db.invoice.update({
      where: { id: result.created },
      data: {
        issueDate: new Date(now.getTime() - 3 * 86400000),
        dueDate: new Date(now.getTime() - 2 * 86400000),
      },
    });
    const overdue = await request(app).get('/api/invoices/overdue').set('Cookie', adminCookie);
    expect(overdue.status).toBe(200);
    expect(overdue.body.data.some((i: { id: string }) => i.id === result.created)).toBe(true);
    const pdf = await request(app)
      .get(`/api/invoices/${result.created}/pdf`)
      .set('Cookie', adminCookie);
    expect(pdf.status).toBe(200);
    expect(pdf.headers['content-type']).toContain('application/pdf');
    const summary = await request(app).get('/api/reports/summary').set('Cookie', adminCookie);
    expect(summary.status).toBe(200);
    expect(summary.body.data.overdueCount).toBeGreaterThan(0);
    const csv = await request(app)
      .get('/api/reports/invoices?format=csv')
      .set('Cookie', adminCookie);
    expect(csv.status).toBe(200);
    expect(csv.headers['content-type']).toContain('text/csv');
  });
  it('rejects overpayments and simultaneous final payments', async () => {
    const s = await makeSub('payment');
    const result = await generateInvoiceForSubscription(s.id, now);
    if (!result.created) throw Error('No invoice');
    await confirm(result.created);
    await recordPayment(result.created, { method: 'CASH', amount: '10', paidAt: now });
    const inv = await getInvoice(result.created);
    expect(inv.status).toBe('CONFIRMED');
    await expect(
      recordPayment(inv.id, { method: 'CASH', amount: '100000', paidAt: now }),
    ).rejects.toThrow();
    const outcomes = await Promise.allSettled([
      recordPayment(inv.id, { method: 'CASH', amount: inv.balance, paidAt: now }),
      recordPayment(inv.id, { method: 'CASH', amount: inv.balance, paidAt: now }),
    ]);
    expect(outcomes.filter((o) => o.status === 'fulfilled')).toHaveLength(1);
    expect((await getInvoice(inv.id)).status).toBe('PAID');
    await expect(cancel(inv.id)).rejects.toThrow();
  });
  it('scopes portal invoice IDs and hides drafts', async () => {
    const s = await makeSub('other', { customerId: otherCustomerId });
    const other = await generateInvoiceForSubscription(s.id, now);
    if (!other.created) throw Error('No invoice');
    await confirm(other.created);
    expect(
      (
        await request(app)
          .get(`/api/portal/invoices/${other.created}`)
          .set('Cookie', customerCookie)
      ).status,
    ).toBe(404);
    const own = await makeSub('draft');
    const draft = await generateInvoiceForSubscription(own.id, now);
    expect(
      (
        await request(app)
          .get(`/api/portal/invoices/${draft.created}`)
          .set('Cookie', customerCookie)
      ).status,
    ).toBe(404);
  });
  it('validates lifecycle, expiry and pause/resume schedule', async () => {
    const s = await makeSub('lifecycle', { status: 'DRAFT', nextBillingDate: null });
    await expect(transition(s.id, 'activate')).rejects.toThrow();
    const quote = await transition(s.id, 'send-quote', undefined, now);
    expect(quote.status).toBe('QUOTATION');
    await expect(
      transition(s.id, 'confirm', undefined, new Date(now.getTime() + 16 * 86400000)),
    ).rejects.toThrow();
    await transition(s.id, 'confirm', undefined, now);
    await transition(s.id, 'activate');
    await transition(s.id, 'pause');
    const resumed = await transition(s.id, 'resume', undefined, new Date('2027-01-31T00:00:00Z'));
    expect(resumed.nextBillingDate!.toISOString()).toBe('2027-02-28T00:00:00.000Z');
    await db.plan.update({ where: { id: planId }, data: { allowPause: false } });
    await expect(transition(s.id, 'pause')).rejects.toThrow();
    await db.plan.update({ where: { id: planId }, data: { allowPause: true } });
    await transition(s.id, 'close');
  });
  it('applies add-ons to future invoices without changing snapshots', async () => {
    const s = await makeSub('addon');
    const invoice = await generateInvoiceForSubscription(s.id, now);
    await changeAddon(s.id, customerId, { action: 'add', productId: addonId, quantity: 1 });
    expect((await getInvoice(invoice.created!)).lines).toHaveLength(1);
    expect(await db.subscriptionLine.count({ where: { subscriptionId: s.id } })).toBe(2);
    await changeAddon(s.id, customerId, { action: 'remove', productId: addonId, quantity: 1 });
    expect(await db.subscriptionLine.count({ where: { subscriptionId: s.id } })).toBe(1);
  });
  it('reset tokens are one-time and revoke old sessions', async () => {
    const user = await db.user.findUniqueOrThrow({ where: { id: staffId } });
    const token = 'a'.repeat(64);
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 60000),
      },
    });
    await reset(token, 'NewPasswordGood!');
    await expect(reset(token, 'AnotherPassword!')).rejects.toThrow();
    expect((await request(app).get('/api/auth/me').set('Cookie', staffCookie)).status).toBe(401);
    expect(
      await bcrypt.compare(
        'NewPasswordGood!',
        (await db.user.findUniqueOrThrow({ where: { id: staffId } })).passwordHash,
      ),
    ).toBe(true);
  });
  it('admin can deactivate staff immediately', async () => {
    const staff = await db.user.findUniqueOrThrow({ where: { id: staffId } });
    const cookie = `session=${signSession(staff)}`;
    expect(
      (
        await request(app)
          .patch(`/api/users/staff/${staffId}`)
          .set('Cookie', adminCookie)
          .send({ isActive: false })
      ).status,
    ).toBe(200);
    expect((await request(app).get('/api/auth/me').set('Cookie', cookie)).status).toBe(401);
  });
});
