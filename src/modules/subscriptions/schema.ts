import { z } from 'zod';
import { date, id, money } from '../../shared/schema.js';
export const line = z
  .object({
    productId: id,
    variantId: id.nullable().optional(),
    quantity: z.number().int().positive().max(1000000),
    unitPrice: money.optional(),
    taxId: id.nullable().optional(),
  })
  .strict();
export const create = z
  .object({
    customerId: id,
    planId: id.optional(),
    templateId: id.optional(),
    startDate: date,
    expiryDate: date,
    dueDays: z.union([z.literal(0), z.literal(15), z.literal(30)]).default(0),
    validityDays: z.number().int().min(1).max(365).optional(),
    lines: z.array(line).min(1).max(100).optional(),
  })
  .strict()
  .refine((v) => !!v.planId || !!v.templateId, 'Choose a plan or template')
  .refine((v) => v.expiryDate > v.startDate, 'Expiry must be after start');
export const edit = z.object({ lines: z.array(line).min(1).max(100) }).strict();
export const addon = z
  .object({
    action: z.enum(['add', 'remove']),
    productId: id,
    variantId: id.optional(),
    quantity: z.number().int().positive().max(1000).default(1),
  })
  .strict();
export const actions = [
  'send-quote',
  'confirm',
  'activate',
  'close',
  'pause',
  'resume',
  'renew',
] as const;
