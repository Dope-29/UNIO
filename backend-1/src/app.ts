import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { timingSafeEqual } from 'node:crypto';
import { env } from './config/env.js';
import { db } from './infra/db.js';
import { assert, errorHandler } from './shared/errors.js';
import { authenticate, requireRole } from './middleware/auth.js';
import { authRouter } from './modules/auth/router.js';
import { usersRouter } from './modules/users/router.js';
import { customersRouter } from './modules/customers/router.js';
import {
  productsRouter,
  plansRouter,
  taxesRouter,
  discountsRouter,
  templatesRouter,
} from './modules/catalog/router.js';
import { subscriptionsRouter } from './modules/subscriptions/router.js';
import { invoicesRouter } from './modules/invoices/router.js';
import { paymentsRouter } from './modules/payments/router.js';
import { portalRouter } from './modules/portal/router.js';
import { reportsRouter } from './modules/reports/router.js';
import { handleWebhook } from './services/gateway.service.js';
import { runBilling } from './services/billing.service.js';
export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true, exposedHeaders: ['X-Total-Count'] }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/ready', async (_req, res) => {
  await db.$queryRaw`SELECT 1`;
  res.json({ status: 'ready' });
});
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json', limit: '256kb' }),
  async (req, res) => {
    assert(Buffer.isBuffer(req.body), 400, 'INVALID_BODY', 'Webhook requires raw JSON');
    res.json(await handleWebhook(req.body, req.get('x-razorpay-signature')));
  },
);
app.use(express.json({ limit: '256kb' }), cookieParser());
// Cookie-authenticated mutations require an allowed Origin. CLI clients may omit Origin
// but must send JSON; browsers cannot send cross-site JSON without a CORS preflight.
app.use('/api', (req, _res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const origin = req.get('origin');
    assert(!origin || origin === env.FRONTEND_URL, 403, 'INVALID_ORIGIN', 'Origin is not allowed');
    assert(
      !req.get('sec-fetch-site') ||
        req.get('sec-fetch-site') !== 'cross-site' ||
        origin === env.FRONTEND_URL,
      403,
      'INVALID_ORIGIN',
      'Cross-site request rejected',
    );
    assert(
      req.is('application/json'),
      415,
      'JSON_REQUIRED',
      'Send Content-Type: application/json, including for empty action bodies',
    );
  }
  next();
});
app.use(
  '/api',
  rateLimit({
    windowMs: 60000,
    limit: 300,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
  }),
);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/products', productsRouter);
app.use('/api/plans', plansRouter);
app.use('/api/taxes', taxesRouter);
app.use('/api/discounts', discountsRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/portal', portalRouter);
app.use('/api/reports', reportsRouter);
app.post('/api/billing/run', authenticate, requireRole('ADMIN', 'STAFF'), async (_req, res) =>
  res.json({ data: await runBilling() }),
);
app.post('/api/internal/run-billing', async (req, res) => {
  const provided = Buffer.from(req.get('x-cron-key') ?? '');
  const expected = Buffer.from(env.CRON_KEY);
  assert(
    provided.length === expected.length && timingSafeEqual(provided, expected),
    401,
    'UNAUTHORIZED',
    'Invalid cron key',
  );
  res.json({ data: await runBilling() });
});
app.use((_req, res) =>
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }),
);
app.use(errorHandler);
