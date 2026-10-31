import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { db } from '../../infra/db.js';
import { pageArgs } from '../../shared/schema.js';
import { customerSchema } from './schema.js';
import { updateCustomer } from './service.js';
export const customersRouter = Router();
customersRouter.use(authenticate, requireRole('ADMIN', 'STAFF'));
customersRouter.get('/', async (req, res) => {
  const { skip, take, page } = pageArgs(req.query);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};
  const [data, total] = await Promise.all([
    db.customer.findMany({ where, skip, take, orderBy: { id: 'asc' } }),
    db.customer.count({ where }),
  ]);
  res.json({ data, total, page, take });
});
customersRouter.get('/:id', async (req, res) =>
  res.json({ data: await db.customer.findUniqueOrThrow({ where: { id: String(req.params.id) } }) }),
);
customersRouter.post('/', async (req, res) =>
  res
    .status(201)
    .json({ data: await db.customer.create({ data: customerSchema.parse(req.body) }) }),
);
customersRouter.patch('/:id', async (req, res) =>
  res.json({
    data: await updateCustomer(String(req.params.id), customerSchema.partial().parse(req.body)),
  }),
);
