import { Prisma, type PayMethod } from '@prisma/client';
import { transaction } from '../../infra/db.js';
import { assert } from '../../shared/errors.js';
export interface PaymentInput {
  method: PayMethod;
  amount: string;
  paidAt: Date;
  note?: string;
  recordedById?: string;
  gatewayRef?: string;
}
export async function recordPaymentInTransaction(
  tx: Prisma.TransactionClient,
  invoiceId: string,
  data: PaymentInput,
) {
  if (data.gatewayRef) {
    const existing = await tx.payment.findUnique({ where: { gatewayRef: data.gatewayRef } });
    if (existing) {
      assert(
        existing.invoiceId === invoiceId && existing.amount.equals(data.amount),
        409,
        'PAYMENT_CONFLICT',
        'Gateway reference conflicts with an existing payment',
      );
      return existing;
    }
  }
  const invoice = await tx.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
  assert(
    invoice.status === 'CONFIRMED',
    409,
    'INVALID_STATUS',
    'Only confirmed invoices can receive payments',
  );
  const amount = new Prisma.Decimal(data.amount);
  assert(
    amount.gt(0) && amount.decimalPlaces() <= 2,
    400,
    'INVALID_AMOUNT',
    'Payment must be positive with at most two decimals',
  );
  assert(
    amount.lte(invoice.total.minus(invoice.amountPaid)),
    400,
    'OVERPAYMENT',
    'Payment exceeds outstanding balance',
  );
  assert(data.paidAt <= new Date(), 400, 'FUTURE_PAYMENT', 'Payment date cannot be in the future');
  const payment = await tx.payment.create({ data: { invoiceId, ...data } });
  const aggregate = await tx.payment.aggregate({ where: { invoiceId }, _sum: { amount: true } });
  const paid = aggregate._sum.amount ?? new Prisma.Decimal(0);
  await tx.invoice.update({
    where: { id: invoiceId },
    data: { amountPaid: paid, status: paid.equals(invoice.total) ? 'PAID' : 'CONFIRMED' },
  });
  return payment;
}
export async function recordPayment(id: string, data: PaymentInput) {
  return transaction((tx) => recordPaymentInTransaction(tx, id, data));
}
