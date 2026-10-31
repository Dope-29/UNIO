import { z } from 'zod';
export const reportKind = z.enum(['subscriptions', 'invoices', 'payments']);
export const outputFormat = z.enum(['json', 'csv']).default('json');
