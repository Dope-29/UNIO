import 'dotenv/config';
import { z } from 'zod';
const optional = z
  .string()
  .optional()
  .transform((v) => v || undefined);
export const env = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    SUPABASE_DATABASE_URL: z.url(),
    SUPABASE_DIRECT_URL: z.url(),
    JWT_SECRET: z.string().min(32),
    CRON_KEY: z.string().min(24),
    FRONTEND_URL: z.url(),
    CURRENCY: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .default('INR'),
    COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
    DISCOUNT_PERCENT_BASE: z.enum(['ORIGINAL', 'REMAINING']).default('ORIGINAL'),
    CRON_ENABLED: z.enum(['true', 'false']).default('false'),
    SMTP_HOST: optional,
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: optional,
    SMTP_PASS: optional,
    MAIL_FROM: z.string().default('Brightloop <billing@example.com>'),
    RAZORPAY_KEY_ID: optional,
    RAZORPAY_KEY_SECRET: optional,
    RAZORPAY_WEBHOOK_SECRET: optional,
  })
  .parse(process.env);
