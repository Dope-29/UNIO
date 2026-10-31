import { Router } from 'express';
import type { z } from 'zod';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { db } from '../../infra/db.js';
import { pageArgs } from '../../shared/schema.js';
import * as s from './schema.js';
import { saveTemplate, validateDiscount, validatePlan } from './service.js';
// One CRUD router handles validation, pagination and permissions consistently.
interface Store<T> {
  list(skip: number, take: number): Promise<unknown[]>;
  count(): Promise<number>;
  get(id: string): Promise<unknown>;
  create(data: T): Promise<unknown>;
  update(id: string, data: Partial<T>): Promise<unknown>;
  remove(id: string): Promise<unknown>;
}
function crud<T>(schema: z.ZodType<T>, patch: z.ZodType<Partial<T>>, store: Store<T>) {
  const r = Router();
  r.use(authenticate, requireRole('ADMIN', 'STAFF'));
  r.get('/', async (req, res) => {
    const { skip, take, page } = pageArgs(req.query);
    const [data, total] = await Promise.all([store.list(skip, take), store.count()]);
    res.json({ data, total, page, take });
  });
  r.get('/:id', async (req, res) => res.json({ data: await store.get(String(req.params.id)) }));
  r.post('/', requireRole('ADMIN'), async (req, res) =>
    res.status(201).json({ data: await store.create(schema.parse(req.body)) }),
  );
  r.patch('/:id', requireRole('ADMIN'), async (req, res) =>
    res.json({ data: await store.update(String(req.params.id), patch.parse(req.body)) }),
  );
  r.delete('/:id', requireRole('ADMIN'), async (req, res) => {
    await store.remove(String(req.params.id));
    res.status(204).end();
  });
  return r;
}
export const productsRouter = crud(s.product, s.product.partial(), {
  list: (skip, take) =>
    db.product.findMany({ skip, take, orderBy: { id: 'asc' }, include: { variants: true } }),
  count: () => db.product.count(),
  get: (id) => db.product.findUniqueOrThrow({ where: { id }, include: { variants: true } }),
  create: (data) => db.product.create({ data }),
  update: (id, data) => db.product.update({ where: { id }, data }),
  remove: (id) => db.product.update({ where: { id }, data: { isActive: false } }),
});
productsRouter.post('/:id/variants', requireRole('ADMIN'), async (req, res) =>
  res.status(201).json({
    data: await db.productVariant.create({
      data: { ...s.variant.parse(req.body), productId: String(req.params.id) },
    }),
  }),
);
productsRouter.patch('/:id/variants/:variantId', requireRole('ADMIN'), async (req, res) =>
  res.json({
    data: await db.productVariant.update({
      where: { id: String(req.params.variantId), productId: String(req.params.id) },
      data: s.variant.partial().parse(req.body),
    }),
  }),
);
productsRouter.delete('/:id/variants/:variantId', requireRole('ADMIN'), async (req, res) => {
  await db.productVariant.delete({
    where: { id: String(req.params.variantId), productId: String(req.params.id) },
  });
  res.status(204).end();
});
export const plansRouter = crud(s.plan, s.plan.partial(), {
  list: (skip, take) => db.plan.findMany({ skip, take, orderBy: { id: 'asc' } }),
  count: () => db.plan.count(),
  get: (id) => db.plan.findUniqueOrThrow({ where: { id } }),
  create: async (data) => {
    validatePlan(data);
    return db.plan.create({ data });
  },
  update: async (id, data) => {
    const old = await db.plan.findUniqueOrThrow({ where: { id } });
    validatePlan({ ...old, price: old.price.toString(), ...data });
    return db.plan.update({ where: { id }, data });
  },
  remove: (id) => db.plan.update({ where: { id }, data: { isActive: false } }),
});
export const taxesRouter = crud(s.tax, s.tax.partial(), {
  list: (skip, take) => db.tax.findMany({ skip, take, orderBy: { id: 'asc' } }),
  count: () => db.tax.count(),
  get: (id) => db.tax.findUniqueOrThrow({ where: { id } }),
  create: (data) => db.tax.create({ data }),
  update: (id, data) => db.tax.update({ where: { id }, data }),
  remove: (id) => db.tax.update({ where: { id }, data: { isActive: false } }),
});
export const discountsRouter = crud(s.discount, s.discount.partial(), {
  list: (skip, take) => db.discount.findMany({ skip, take, orderBy: { id: 'asc' } }),
  count: () => db.discount.count(),
  get: (id) => db.discount.findUniqueOrThrow({ where: { id } }),
  create: async (data) => {
    await validateDiscount(data);
    return db.discount.create({ data });
  },
  update: async (id, data) => {
    const old = await db.discount.findUniqueOrThrow({ where: { id } });
    await validateDiscount({
      ...old,
      value: old.value.toString(),
      minPurchase: old.minPurchase?.toString(),
      ...data,
    });
    return db.discount.update({ where: { id }, data });
  },
  remove: (id) => db.discount.update({ where: { id }, data: { isActive: false } }),
});
export const templatesRouter = crud(s.template, s.template.partial(), {
  list: (skip, take) =>
    db.quotationTemplate.findMany({ skip, take, orderBy: { id: 'asc' }, include: { lines: true } }),
  count: () => db.quotationTemplate.count(),
  get: (id) => db.quotationTemplate.findUniqueOrThrow({ where: { id }, include: { lines: true } }),
  create: (data) => saveTemplate(data),
  update: async (id, data) => {
    const old = await db.quotationTemplate.findUniqueOrThrow({
      where: { id },
      include: { lines: true },
    });
    return saveTemplate({ ...old, ...data }, id);
  },
  remove: (id) => db.quotationTemplate.delete({ where: { id } }),
});
