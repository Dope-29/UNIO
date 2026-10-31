import { z } from 'zod';
import { date, money } from '../../shared/schema.js';
export const payment = z
  .object({
    method: z.enum(['CASH', 'BANK_TRANSFER', 'CARD', 'UPI', 'CHEQUE']),
    amount: money.refine((v) => Number(v) > 0, 'Amount must be positive'),
    paidAt: date,
    note: z.string().max(2000).optional(),
  })
  .strict();
