process.env.NODE_ENV = 'test';
process.env.SUPABASE_DATABASE_URL =
  process.env.SUPABASE_TEST_DATABASE_URL ??
  'postgresql://postgres:test@db.example.supabase.co:5432/postgres';
process.env.SUPABASE_DIRECT_URL = process.env.SUPABASE_DATABASE_URL;
process.env.JWT_SECRET = 'test-only-secret-at-least-thirty-two-characters';
process.env.CRON_KEY = 'test-only-cron-secret-at-least-24-characters';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.DISCOUNT_PERCENT_BASE = 'ORIGINAL';
process.env.RAZORPAY_WEBHOOK_SECRET = 'test-webhook-secret';
