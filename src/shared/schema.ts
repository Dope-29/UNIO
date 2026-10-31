import { z } from 'zod';
export const passwordRule = z
  .string()
  .min(9, 'Must be more than 8 characters')
  .max(72, 'Must be at most 72 characters')
  .refine((v) => Buffer.byteLength(v, 'utf8') <= 72, 'Must be at most 72 UTF-8 bytes')
  .regex(/[A-Z]/, 'Needs an uppercase letter')
  .regex(/[a-z]/, 'Needs a lowercase letter')
  .regex(/[^A-Za-z0-9]/, 'Needs a special character');
export const email = z.string().trim().toLowerCase().pipe(z.email());
export const money = z
  .union([z.string(), z.number()])
  .transform(String)
  .pipe(
    z
      .string()
      .regex(/^\d{1,10}(\.\d{1,2})?$/, 'Use a nonnegative amount with at most 2 decimal places'),
  );
export const date = z.iso.datetime({ offset: true }).transform((v) => new Date(v));
export const id = z.string().min(1).max(100);
export const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  take: z.coerce.number().int().min(1).max(100).default(25),
});
export function pageArgs(query: unknown) {
  const p = pagination.parse(query);
  return { ...p, skip: (p.page - 1) * p.take };
}
export const period = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']);
export const range = z
  .object({ from: date.optional(), to: date.optional() })
  .refine((v) => !v.from || !v.to || v.from <= v.to, 'from must precede to');
export function dateFilter(query: unknown) {
  const { from, to } = range.parse(query);
  return from || to ? { gte: from, lte: to } : undefined;
}
