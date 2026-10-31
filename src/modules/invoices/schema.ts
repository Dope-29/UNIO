import { z } from 'zod';
import { dateFilter, pageArgs } from '../../shared/schema.js';
import type { Prisma } from '@prisma/client';
export function invoiceQuery(query: unknown, customerId?: string) {
  const q = z
    .object({
      customerId: z.string().optional(),
      status: z.enum(['DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED']).optional(),
      subscriptionId: z.string().optional(),
    })
    .parse(query);
  const where: Prisma.InvoiceWhereInput = {
    ...q,
    customerId: customerId ?? q.customerId,
    issueDate: dateFilter(query),
  };
  if (customerId) {
    where.AND = [{ status: { not: 'DRAFT' } }, ...(q.status ? [{ status: q.status }] : [])];
    delete where.status;
  }
  return { where, ...pageArgs(query) };
}
