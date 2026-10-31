import { z } from 'zod';
import { email, passwordRule } from '../../shared/schema.js';
export const staffCreate = z
  .object({ name: z.string().trim().min(1).max(120), email, password: passwordRule })
  .strict();
export const staffUpdate = z
  .object({ name: z.string().trim().min(1).max(120).optional(), isActive: z.boolean().optional() })
  .strict();
