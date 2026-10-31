import { z } from 'zod';
import { email, passwordRule } from '../../shared/schema.js';
export const signup = z
  .object({ name: z.string().trim().min(1).max(120), email, password: passwordRule })
  .strict();
export const login = z.object({ email, password: z.string().min(1).max(200) }).strict();
export const forgot = z.object({ email }).strict();
export const reset = z
  .object({ token: z.string().regex(/^[a-f0-9]{64}$/), password: passwordRule })
  .strict();
