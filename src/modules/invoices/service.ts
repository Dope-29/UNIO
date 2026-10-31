import { Prisma } from '@prisma/client';
import { db, transaction } from '../../infra/db.js';
import { assert } from '../../shared/errors.js';
import { startOfDay } from '../../shared/dates.js';
import { sendMail } from '../../services/mail.service.js';
import { invoicePdf } from '../../services/pdf.service.js';
export const invoiceDetail = {
  lines: { orderBy: { id: 'asc' as const } },
  discounts: true,
  payments: true,
  customer: true,
} satisfies Prisma.InvoiceInclude;
export const overdueWhere = (): Prisma.InvoiceWhereInput => ({
  status: 'CONFIRMED',
  dueDate: { lt: startOfDay() },
  amountPaid: { lt: db.invoice.fields.total },
});
export async function getInvoice(id: string, customerId?: string) {
  const inv = await db.invoice.findFirst({
    where: { id, customerId, ...(customerId ? { status: { not: 'DRAFT' as const } } : {}) },
    include: invoiceDetail,
  });
  assert(inv, 404, 'NOT_FOUND', 'Invoice not found');
  return { ...inv, balance: inv.total.minus(inv.amountPaid).toFixed(2) };
}
export async function confirm(id: string) {
  return transaction(async (tx) => {
    const i = await tx.invoice.findUniqueOrThrow({ where: { id } });
    assert(i.status === 'DRAFT', 409, 'INVALID_TRANSITION', 'Only drafts can be confirmed');
    return tx.invoice.update({
      where: { id },
      data: { status: i.total.isZero() ? 'PAID' : 'CONFIRMED' },
    });
  });
}
export async function cancel(id: string) {
  return transaction(async (tx) => {
    const i = await tx.invoice.findUniqueOrThrow({
      where: { id },
      include: { discounts: true, _count: { select: { payments: true } } },
    });
    assert(
      ['DRAFT', 'CONFIRMED'].includes(i.status) && i._count.payments === 0,
      409,
      'CANNOT_CANCEL',
      'Only unpaid Draft or Confirmed invoices can be cancelled',
    );
    for (const discount of i.discounts) {
      const changed = await tx.discount.updateMany({
        where: { id: discount.discountId, usedCount: { gt: 0 } },
        data: { usedCount: { decrement: 1 } },
      });
      assert(changed.count === 1, 409, 'USAGE_CONFLICT', 'Discount usage cannot be restored');
    }
    return tx.invoice.update({ where: { id }, data: { status: 'CANCELLED' } });
  });
}
export async function sendInvoice(id: string) {
  const i = await getInvoice(id);
  assert(
    ['DRAFT', 'CONFIRMED'].includes(i.status),
    409,
    'INVALID_STATUS',
    'Only Draft or Confirmed invoices can be sent',
  );
  await sendMail(
    i.customerEmail,
    `Invoice ${i.number}`,
    `Please find invoice ${i.number} attached.`,
    [{ filename: `${i.number}.pdf`, content: await invoicePdf(i) }],
  );
  return db.invoice.update({ where: { id }, data: { sentAt: new Date() } });
}
export async function remind(id: string, sentById: string) {
  const i = await db.invoice.findFirst({ where: { id, ...overdueWhere() } });
  assert(i, 409, 'NOT_OVERDUE', 'Invoice is not overdue');
  await sendMail(
    i.customerEmail,
    `Reminder: invoice ${i.number}`,
    `Your outstanding balance is ${i.total.minus(i.amountPaid).toFixed(2)} ${i.currency}. Please arrange payment.`,
  );
  return db.reminderLog.create({ data: { invoiceId: id, sentById } });
}
