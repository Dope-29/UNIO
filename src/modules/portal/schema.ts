import { z } from 'zod';
import { passwordRule } from '../../shared/schema.js';
export const changePassword = z
  .object({ currentPassword: z.string().min(1).max(200), password: passwordRule })
  .strict();
