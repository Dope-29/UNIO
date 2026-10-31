import { Router } from 'express';
import { authenticate, requireRole, customerScope } from '../../middleware/auth.js';
import { db } from '../../infra/db.js';
import { customerSchema } from '../customers/schema.js';
import { updateCustomer } from '../customers/service.js';
import { listSubscriptions } from '../subscriptions/router.js';
import * as subscriptions from '../subscriptions/service.js';
import { addon } from '../subscriptions/schema.js';
import { getInvoice } from '../invoices/service.js';
import { invoiceQuery } from '../invoices/schema.js';
import { invoicePdf } from '../../services/pdf.service.js';
import { createOrder } from '../../services/gateway.service.js';
import * as schema from './schema.js';
import * as service from './service.js';
import { pageArgs } from '../../shared/schema.js';
export const portalRouter = Router();
portalRouter.use(authenticate, requireRole('CUSTOMER'));
portalRouter.get('/products', async (req, res) => {
  const { skip, take, page } = pageArgs(req.query);
  const where = { isActive: true };
  const [data, total] = await Promise.all([
    db.product.findMany({ where, skip, take, orderBy: { id: 'asc' }, select: {
      id: true, name: true, type: true, salesPrice: true,
      variants: { select: { id: true, attribute: true, value: true, extraPrice: true } },
    } }),
    db.product.count({ where }),
  ]);
  res.json({ data, total, page, take });
});
portalRouter.get('/subscriptions', async (req, res) =>
  res.json(await listSubscriptions(req.query, customerScope(req))),
);
portalRouter.get('/subscriptions/:id', async (req, res) =>
  res.json({ data: await subscriptions.get(String(req.params.id), customerScope(req)) }),
);
for (const action of ['pause', 'resume', 'renew', 'close'] as const)
  portalRouter.post(`/subscriptions/:id/${action}`, async (req, res) =>
    res.json({
      data: await subscriptions.transition(String(req.params.id), action, customerScope(req)),
    }),
  );
portalRouter.post('/subscriptions/:id/addons', async (req, res) =>
  res.json({
    data: await subscriptions.changeAddon(
      String(req.params.id),
      customerScope(req),
      addon.parse(req.body),
    ),
  }),
);
portalRouter.get('/invoices', async (req, res) => {
  const { where, skip, take, page } = invoiceQuery(req.query, customerScope(req));
  const [data, total] = await Promise.all([
    db.invoice.findMany({ where, skip, take, orderBy: [{ issueDate: 'desc' }, { id: 'asc' }] }),
    db.invoice.count({ where }),
  ]);
  res.json({ data, total, page, take });
});
portalRouter.get('/invoices/:id', async (req, res) =>
  res.json({ data: await getInvoice(String(req.params.id), customerScope(req)) }),
);
portalRouter.get('/invoices/:id/pdf', async (req, res) => {
  const i = await getInvoice(String(req.params.id), customerScope(req));
  res
    .type('pdf')
    .attachment(`${i.number}.pdf`)
    .send(await invoicePdf(i));
});
portalRouter.post('/invoices/:id/pay-order', async (req, res) =>
  res.status(201).json({ data: await createOrder(String(req.params.id), customerScope(req)) }),
);
portalRouter.get('/profile', async (req, res) =>
  res.json({ data: await db.customer.findUniqueOrThrow({ where: { id: customerScope(req) } }) }),
);
portalRouter.patch('/profile', async (req, res) =>
  res.json({
    data: await updateCustomer(customerScope(req), customerSchema.partial().parse(req.body)),
  }),
);
portalRouter.post('/change-password', async (req, res) => {
  const data = schema.changePassword.parse(req.body);
  await service.changePassword(req.user!.id, data.currentPassword, data.password);
  res.json({ message: 'Password changed; please log in again' });
});
