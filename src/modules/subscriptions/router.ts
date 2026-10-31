import { Router } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { db } from '../../infra/db.js';
import { dateFilter, pageArgs } from '../../shared/schema.js';
import { generateInvoiceForSubscription } from '../../services/billing.service.js';
import * as schema from './schema.js';
import * as service from './service.js';
export function subscriptionQuery(query: unknown, customerId?: string) {
  const q = z
    .object({
      status: z.enum(['DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'CLOSED']).optional(),
      customerId: z.string().optional(),
      planId: z.string().optional(),
      paused: z.enum(['true', 'false']).optional(),
      pastExpiry: z.enum(['true', 'false']).optional(),
    })
    .parse(query);
  const where: Prisma.SubscriptionWhereInput = {
    status: q.status,
    customerId: customerId ?? q.customerId,
    planId: q.planId,
    startDate: dateFilter(query),
  };
  if (q.paused) where.pausedAt = q.paused === 'true' ? { not: null } : null;
  if (q.pastExpiry === 'true') {
    where.expiryDate = { lt: new Date() };
    where.status = 'ACTIVE';
  }
  if (q.pastExpiry === 'false') where.NOT = { status: 'ACTIVE', expiryDate: { lt: new Date() } };
  return { where, ...pageArgs(query) };
}
export async function listSubscriptions(query: unknown, customerId?: string) {
  const { where, skip, take, page } = subscriptionQuery(query, customerId);
  const [rows, total] = await Promise.all([
    db.subscription.findMany({
      where,
      skip,
      take,
      orderBy: { id: 'asc' },
      include: { plan: true, customer: { select: { name: true, email: true } } },
    }),
    db.subscription.count({ where }),
  ]);
  return {
    data: rows.map((s) => ({
      ...s,
      pastExpiry: s.status === 'ACTIVE' && s.expiryDate < new Date(),
    })),
    total,
    page,
    take,
  };
}
export const subscriptionsRouter = Router();
subscriptionsRouter.use(authenticate, requireRole('ADMIN', 'STAFF'));
subscriptionsRouter.get('/', async (req, res) => res.json(await listSubscriptions(req.query)));
subscriptionsRouter.post('/', async (req, res) =>
  res.status(201).json({ data: await service.create(schema.create.parse(req.body)) }),
);
subscriptionsRouter.get('/:id', async (req, res) =>
  res.json({ data: await service.get(String(req.params.id)) }),
);
subscriptionsRouter.patch('/:id', async (req, res) =>
  res.json({
    data: await service.editLines(String(req.params.id), schema.edit.parse(req.body).lines),
  }),
);
for (const action of schema.actions)
  subscriptionsRouter.post(`/:id/${action}`, async (req, res) =>
    res.json({ data: await service.transition(String(req.params.id), action) }),
  );
subscriptionsRouter.post('/:id/invoice-now', async (req, res) =>
  res.json({ data: await generateInvoiceForSubscription(String(req.params.id), new Date()) }),
);
