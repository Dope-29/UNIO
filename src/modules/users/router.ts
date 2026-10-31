import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { db } from '../../infra/db.js';
import { pageArgs } from '../../shared/schema.js';
import { staffCreate, staffUpdate } from './schema.js';
import { createStaff, staffSelect } from './service.js';
export const usersRouter = Router();
usersRouter.use(authenticate, requireRole('ADMIN'));
usersRouter.get('/staff', async (req, res) => {
  const { skip, take, page } = pageArgs(req.query);
  const [data, total] = await Promise.all([
    db.user.findMany({
      where: { role: 'STAFF' },
      select: staffSelect,
      skip,
      take,
      orderBy: { id: 'asc' },
    }),
    db.user.count({ where: { role: 'STAFF' } }),
  ]);
  res.json({ data, total, page, take });
});
usersRouter.post('/staff', async (req, res) =>
  res.status(201).json({ data: await createStaff(staffCreate.parse(req.body)) }),
);
usersRouter.patch('/staff/:id', async (req, res) =>
  res.json({
    data: await db.user.update({
      where: { id: String(req.params.id), role: 'STAFF' },
      data: staffUpdate.parse(req.body),
      select: staffSelect,
    }),
  }),
);
