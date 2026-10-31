process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://brightloop:brightloop_local_only@localhost:55432/brightloop_test';
process.env.JWT_SECRET = 'test-only-secret-at-least-thirty-two-characters';
process.env.CRON_KEY = 'test-only-cron-secret-at-least-24-characters';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.DISCOUNT_PERCENT_BASE = 'ORIGINAL';
process.env.RAZORPAY_WEBHOOK_SECRET = 'test-webhook-secret';
