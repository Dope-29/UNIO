import Razorpay from 'razorpay';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { db, transaction } from '../infra/db.js';
import { env } from '../config/env.js';
import { assert } from '../shared/errors.js';
import { recordPaymentInTransaction } from '../modules/payments/service.js';
const gateway =
  env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET
    ? new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET })
    : undefined;
export async function createOrder(invoiceId: string, customerId: string) {
  assert(
    gateway && env.RAZORPAY_KEY_ID?.startsWith('rzp_test_'),
    503,
    'GATEWAY_UNAVAILABLE',
    'Razorpay test mode is not configured',
  );
  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId, customerId, status: 'CONFIRMED' },
  });
  assert(invoice, 404, 'NOT_FOUND', 'Payable invoice not found');
  const balance = invoice.total.minus(invoice.amountPaid);
  assert(balance.gt(0), 409, 'NO_BALANCE', 'Invoice has no outstanding balance');
  const recent = await db.gatewayOrder.findFirst({
    where: {
      invoiceId,
      amount: balance,
      paidAt: null,
      createdAt: { gt: new Date(Date.now() - 15 * 60 * 1000) },
    },
    orderBy: { createdAt: 'desc' },
  });
  if (recent)
    return {
      orderId: recent.id,
      keyId: env.RAZORPAY_KEY_ID,
      amount: balance.mul(100).toNumber(),
      currency: invoice.currency,
    };
  const amount = balance.mul(100).toNumber();
  assert(Number.isSafeInteger(amount), 400, 'INVALID_AMOUNT', 'Invalid gateway amount');
  const order = await gateway.orders.create({
    amount,
    currency: invoice.currency,
    receipt: invoice.number,
    notes: { invoiceId },
  });
  await db.gatewayOrder.create({
    data: { id: order.id, invoiceId, amount: balance, currency: invoice.currency },
  });
  return { orderId: order.id, keyId: env.RAZORPAY_KEY_ID, amount, currency: invoice.currency };
}
export function verifyWebhook(raw: Buffer, signature: string | undefined, secret: string) {
  assert(
    signature && /^[a-fA-F0-9]{64}$/.test(signature),
    400,
    'INVALID_SIGNATURE',
    'Invalid webhook signature',
  );
  const expected = createHmac('sha256', secret).update(raw).digest();
  assert(
    timingSafeEqual(expected, Buffer.from(signature, 'hex')),
    400,
    'INVALID_SIGNATURE',
    'Invalid webhook signature',
  );
}
const captured = z.object({
  event: z.literal('payment.captured'),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string().min(1),
        order_id: z.string().min(1),
        amount: z.number().int().positive().safe(),
        currency: z.string(),
        status: z.literal('captured'),
        created_at: z.number().int().positive(),
      }),
    }),
  }),
});
export async function handleWebhook(raw: Buffer, signature: string | undefined) {
  assert(env.RAZORPAY_WEBHOOK_SECRET, 503, 'GATEWAY_UNAVAILABLE', 'Webhook is not configured');
  verifyWebhook(raw, signature, env.RAZORPAY_WEBHOOK_SECRET);
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.toString('utf8'));
  } catch {
    assert(false, 400, 'INVALID_JSON', 'Invalid webhook JSON');
  }
  const event = z.object({ event: z.string() }).parse(parsed);
  if (event.event !== 'payment.captured') return { ignored: true };
  const payment = captured.parse(parsed).payload.payment.entity;
  return transaction(async (tx) => {
    const order = await tx.gatewayOrder.findUnique({ where: { id: payment.order_id } });
    assert(order, 409, 'UNKNOWN_ORDER', 'Order is not registered; retry delivery');
    assert(
      order.currency === payment.currency && order.amount.mul(100).equals(payment.amount),
      400,
      'ORDER_MISMATCH',
      'Payment amount or currency does not match order',
    );
    const recorded = await recordPaymentInTransaction(tx, order.invoiceId, {
      method: 'ONLINE',
      amount: order.amount.toFixed(2),
      paidAt: new Date(payment.created_at * 1000),
      gatewayRef: payment.id,
    });
    await tx.gatewayOrder.update({ where: { id: order.id }, data: { paidAt: new Date() } });
    return { paymentId: recorded.id };
  });
}
