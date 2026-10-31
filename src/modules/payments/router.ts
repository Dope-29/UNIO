import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { db } from '../../infra/db.js';
import { pageArgs, dateFilter } from '../../shared/schema.js';
export const paymentsRouter = Router();
paymentsRouter.use(authenticate, requireRole('ADMIN', 'STAFF'));
paymentsRouter.get('/', async (req, res) => {
  const { skip, take, page } = pageArgs(req.query);
  const q = z
    .object({
      invoiceId: z.string().optional(),
      method: z.enum(['CASH', 'BANK_TRANSFER', 'CARD', 'UPI', 'CHEQUE', 'ONLINE']).optional(),
    })
    .parse(req.query);
  const where = { ...q, paidAt: dateFilter(req.query) };
  const [data, total] = await Promise.all([
    db.payment.findMany({
      where,
      skip,
      take,
      orderBy: [{ paidAt: 'desc' }, { id: 'asc' }],
      include: { invoice: { select: { number: true, customerId: true } } },
    }),
    db.payment.count({ where }),
  ]);
  res.json({ data, total, page, take });
});
