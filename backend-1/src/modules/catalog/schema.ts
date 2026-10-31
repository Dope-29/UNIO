import { z } from 'zod';
import { date, id, money, period } from '../../shared/schema.js';
const name = z.string().trim().min(1).max(200);
export const product = z
  .object({
    name,
    type: z.string().trim().min(1).max(50),
    salesPrice: money,
    costPrice: money,
    notes: z.string().max(4000).nullable().optional(),
    isActive: z.boolean().default(true),
  })
  .strict();
export const variant = z.object({ attribute: name, value: name, extraPrice: money }).strict();
export const plan = z
  .object({
    name,
    price: money,
    billingPeriod: period,
    minQuantity: z.number().int().positive().default(1),
    availableFrom: date,
    availableTo: date.nullable().optional(),
    autoCloseOnEnd: z.boolean().default(false),
    allowEarlyClose: z.boolean().default(false),
    allowPause: z.boolean().default(false),
    allowRenew: z.boolean().default(false),
    isActive: z.boolean().default(true),
  })
  .strict();
export const tax = z
  .object({
    name,
    ratePercent: money.refine((v) => Number(v) <= 100, 'Tax cannot exceed 100%'),
    isActive: z.boolean().default(true),
  })
  .strict();
export const discount = z
  .object({
    name,
    type: z.enum(['FIXED', 'PERCENT']),
    value: money,
    minPurchase: money.nullable().optional(),
    minQuantity: z.number().int().positive().nullable().optional(),
    startDate: date,
    endDate: date,
    usageLimit: z.number().int().positive(),
    scope: z.enum(['PRODUCT', 'SUBSCRIPTION']),
    productIds: z.array(id).max(1000).default([]),
    isActive: z.boolean().default(true),
  })
  .strict();
export const template = z
  .object({
    name,
    validityDays: z.number().int().min(1).max(365),
    planId: id,
    lines: z
      .array(
        z
          .object({
            productId: id,
            variantId: id.nullable().optional(),
            quantity: z.number().int().positive(),
            taxId: id.nullable().optional(),
          })
          .strict(),
      )
      .min(1)
      .max(100),
  })
  .strict();
