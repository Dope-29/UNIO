import { Prisma } from '@prisma/client';
import { assert } from '../../shared/errors.js';
import { db, transaction } from '../../infra/db.js';
import * as schemas from './schema.js';
import type { z } from 'zod';
type Tx = Prisma.TransactionClient;
export async function checkLine(
  tx: Tx,
  line: { productId: string; variantId?: string | null; taxId?: string | null },
) {
  const product = await tx.product.findUnique({ where: { id: line.productId } });
  assert(product?.isActive, 400, 'INVALID_PRODUCT', 'Product must exist and be active');
  const variant = line.variantId
    ? await tx.productVariant.findUnique({ where: { id: line.variantId } })
    : null;
  assert(
    !line.variantId || variant?.productId === product.id,
    400,
    'INVALID_VARIANT',
    'Variant must belong to the selected product',
  );
  if (line.taxId) {
    const tax = await tx.tax.findUnique({ where: { id: line.taxId } });
    assert(tax?.isActive, 400, 'INVALID_TAX', 'Tax must exist and be active');
  }
  return { product, variant };
}
export async function saveTemplate(data: z.infer<typeof schemas.template>, id?: string) {
  return transaction(async (tx) => {
    const plan = await tx.plan.findUnique({ where: { id: data.planId } });
    assert(plan?.isActive, 400, 'INVALID_PLAN', 'Plan must exist and be active');
    for (const line of data.lines) await checkLine(tx, line);
    const header = { name: data.name, validityDays: data.validityDays, planId: data.planId };
    const lines = data.lines.map((l) => ({
      productId: l.productId,
      variantId: l.variantId,
      quantity: l.quantity,
      taxId: l.taxId,
    }));
    return id
      ? tx.quotationTemplate.update({
          where: { id },
          data: { ...header, lines: { deleteMany: {}, create: lines } },
          include: { lines: true },
        })
      : tx.quotationTemplate.create({
          data: { ...header, lines: { create: lines } },
          include: { lines: true },
        });
  });
}
export async function validateDiscount(data: z.infer<typeof schemas.discount>) {
  assert(data.endDate >= data.startDate, 400, 'INVALID_DATES', 'Discount end must follow start');
  assert(
    data.type !== 'PERCENT' || Number(data.value) <= 100,
    400,
    'INVALID_DISCOUNT',
    'Percentage cannot exceed 100',
  );
  const ids = [...new Set(data.productIds)];
  assert(
    data.scope !== 'PRODUCT' || ids.length > 0,
    400,
    'INVALID_SCOPE',
    'Product discounts need matching products',
  );
  assert(
    data.scope !== 'SUBSCRIPTION' || ids.length === 0,
    400,
    'INVALID_SCOPE',
    'Subscription discounts must not specify product IDs',
  );
  assert(
    (await db.product.count({ where: { id: { in: ids } } })) === ids.length,
    400,
    'INVALID_PRODUCT',
    'A discount product does not exist',
  );
}
export function validatePlan(data: z.infer<typeof schemas.plan>) {
  assert(
    !data.availableTo || data.availableTo >= data.availableFrom,
    400,
    'INVALID_DATES',
    'Plan availability end must follow start',
  );
}
