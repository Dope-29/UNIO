import { z } from 'zod';
import { email } from '../../shared/schema.js';
export const customerSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email,
    company: z.string().max(200).nullable().optional(),
    phone: z.string().max(40).nullable().optional(),
    address: z.string().max(2000).nullable().optional(),
  })
  .strict();
