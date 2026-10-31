import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { db } from '../../infra/db.js';
import { pageArgs } from '../../shared/schema.js';
import { payment } from '../payments/schema.js';
import { recordPayment } from '../payments/service.js';
import { invoicePdf } from '../../services/pdf.service.js';
import { invoiceQuery } from './schema.js';
import * as service from './service.js';
export const invoicesRouter = Router();
invoicesRouter.use(authenticate, requireRole('ADMIN', 'STAFF'));
invoicesRouter.get('/overdue', async (req, res) => {
  const { skip, take, page } = pageArgs(req.query);
  const where = service.overdueWhere();
  const [data, total] = await Promise.all([
    db.invoice.findMany({ where, skip, take, orderBy: [{ dueDate: 'asc' }, { id: 'asc' }] }),
    db.invoice.count({ where }),
  ]);
  res.json({ data, total, page, take });
});
invoicesRouter.get('/', async (req, res) => {
  const { where, skip, take, page } = invoiceQuery(req.query);
  const [data, total] = await Promise.all([
    db.invoice.findMany({ where, skip, take, orderBy: [{ issueDate: 'desc' }, { id: 'asc' }] }),
    db.invoice.count({ where }),
  ]);
  res.json({ data, total, page, take });
});
invoicesRouter.get('/:id', async (req, res) =>
  res.json({ data: await service.getInvoice(String(req.params.id)) }),
);
invoicesRouter.get('/:id/pdf', async (req, res) => {
  const inv = await service.getInvoice(String(req.params.id));
  res
    .type('pdf')
    .attachment(`${inv.number}.pdf`)
    .send(await invoicePdf(inv));
});
invoicesRouter.post('/:id/confirm', async (req, res) =>
  res.json({ data: await service.confirm(String(req.params.id)) }),
);
invoicesRouter.post('/:id/cancel', async (req, res) =>
  res.json({ data: await service.cancel(String(req.params.id)) }),
);
invoicesRouter.post('/:id/send', async (req, res) =>
  res.json({ data: await service.sendInvoice(String(req.params.id)) }),
);
invoicesRouter.post('/:id/remind', async (req, res) =>
  res.json({ data: await service.remind(String(req.params.id), req.user!.id) }),
);
invoicesRouter.post('/:id/payments', async (req, res) =>
  res.status(201).json({
    data: await recordPayment(String(req.params.id), {
      ...payment.parse(req.body),
      recordedById: req.user!.id,
    }),
  }),
);
