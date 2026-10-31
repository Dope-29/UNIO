import { db } from '../../infra/db.js';
import { dateFilter, pageArgs } from '../../shared/schema.js';
import { overdueWhere } from '../invoices/service.js';
import { invoiceQuery } from '../invoices/schema.js';
import { subscriptionQuery } from '../subscriptions/router.js';
import { z } from 'zod';
export async function summary(query: unknown) {
  const filter = dateFilter(query);
  const [active, revenue, outstanding, overdue] = await Promise.all([
    db.subscription.count({ where: { status: 'ACTIVE', startDate: filter } }),
    db.payment.aggregate({ where: { paidAt: filter }, _sum: { amount: true } }),
    db.invoice.aggregate({
      where: { status: 'CONFIRMED', issueDate: filter },
      _sum: { total: true, amountPaid: true },
    }),
    db.invoice.count({ where: { ...overdueWhere(), issueDate: filter } }),
  ]);
  return {
    activeSubscriptions: active,
    revenue: revenue._sum.amount?.toFixed(2) ?? '0.00',
    outstanding:
      outstanding._sum.total?.minus(outstanding._sum.amountPaid ?? 0).toFixed(2) ?? '0.00',
    overdueCount: overdue,
  };
}
export async function report(kind: 'subscriptions' | 'invoices' | 'payments', query: unknown) {
  const { skip, take, page } = pageArgs(query);
  if (kind === 'subscriptions') {
    const { where } = subscriptionQuery(query);
    const [data, total] = await Promise.all([
      db.subscription.findMany({ where, skip, take, orderBy: { id: 'asc' } }),
      db.subscription.count({ where }),
    ]);
    return { data, total, page, take };
  }
  if (kind === 'invoices') {
    const { where } = invoiceQuery(query);
    const [data, total] = await Promise.all([
      db.invoice.findMany({ where, skip, take, orderBy: { id: 'asc' } }),
      db.invoice.count({ where }),
    ]);
    return { data, total, page, take };
  }
  const filter = z
    .object({
      invoiceId: z.string().optional(),
      method: z.enum(['CASH', 'BANK_TRANSFER', 'CARD', 'UPI', 'CHEQUE', 'ONLINE']).optional(),
    })
    .parse(query);
  const where = { ...filter, paidAt: dateFilter(query) };
  const [data, total] = await Promise.all([
    db.payment.findMany({ where, skip, take, orderBy: { id: 'asc' } }),
    db.payment.count({ where }),
  ]);
  return { data, total, page, take };
}
export function csv(rows: object[]) {
  if (!rows.length) return '';
  const fields = Object.keys(rows[0]);
  const cell = (v: unknown) => {
    let s = v instanceof Date ? v.toISOString() : String(v ?? '');
    if (/^[=+\-@\t\r\n]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  return [
    fields.map(cell).join(','),
    ...rows.map((row) => fields.map((f) => cell((row as Record<string, unknown>)[f])).join(',')),
  ].join('\r\n');
}
