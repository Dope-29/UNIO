# Brightloop backend

Express + TypeScript, Prisma + PostgreSQL. Backend only. Module responsibilities and confirmed rules are in [docs/TASKS.md](docs/TASKS.md); request bodies and endpoint behavior are in [docs/API.md](docs/API.md).

## Setup

Requires Node.js 22.12+ and PostgreSQL 17 (local Docker or hosted).

```powershell
npm ci
Copy-Item .env.example .env
# Edit .env: database URLs, random JWT/cron secrets, frontend URL and percentage basis.
npm run db:generate
npm run db:migrate
# Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env first.
npm run db:seed
npm run dev
```

Local database: `docker compose up -d db`. Set DATABASE_URL and DIRECT_URL to `postgresql://brightloop:brightloop_local_only@localhost:55432/brightloop` for this local container only. Hosted deployments use provider-issued credentials and TLS settings. No database credentials are checked in for a hosted service.

Production: `npm ci`, `npm run db:generate`, `npm run build`, apply migrations with `npm run db:migrate`, then `npm start`. API defaults to port 4000. `/health` checks the process; `/ready` checks PostgreSQL. Configure a persistent API process for the email worker and optional UTC billing scheduler. A protected external cron can POST `{}` to `/api/internal/run-billing` with `x-cron-key` and JSON Content-Type. No proxy trust is enabled implicitly; configure a verified proxy topology before deployment behind a reverse proxy.

## Verification

`npm test` runs pure pricing/date rules and HTTP/security tests. `npm run test:integration` launches a temporary local PostgreSQL instance on port 55439, applies migrations, runs all tests, and stops it. `npm run benchmark:local` additionally seeds and measures the 5,000-subscription fixture. Its data is retained under ignored `.test-db/` for inspection. Alternatively, set TEST_DATABASE_URL to a separate disposable PostgreSQL database with migrations applied to enable the integration suite. The suite inserts uniquely prefixed fixtures and removes only its own records; never use a production database. See [docs/VERIFICATION.md](docs/VERIFICATION.md) for actual results and external checks.

`npm run build` checks TypeScript and produces dist. `npm audit` checks dependencies. Package lock is committed with the source deliverable. The Prisma version is pinned to the stable 7.x line instead of the registry's 8.x release candidate.

## Email and payments

SMTP configuration is required for reset emails and invoice delivery. Quotation delivery uses a retrying outbox; password reset tokens are stored only as SHA-256 hashes and never logged. Requests to forgot-password always return the same response. SMTP delivery failures are logged without tokens.

Razorpay is optional and restricted to test keys. Configure RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET, then point a public HTTPS webhook at `/api/payments/webhook`, subscribed to payment.captured. Manual payments work independently. Signed payment IDs are unique and replay-safe. If a capture arrives after another payment has settled the invoice, it is rejected for reconciliation rather than silently overpaying the ledger; monitor failed webhook deliveries and refund/reconcile in the gateway dashboard. This build does not automate refunds.

## Performance dataset

Run the admin/demo seed first if desired. Set `SEED_BULK_CONFIRM=development-fixtures`, then `npm run db:seed:bulk` to add 200 customers, 5,000 subscriptions, 15,000 invoices and 10,000 payments, in batches of 1,000. Fixture IDs are deterministic; rerunning skips existing fixtures. List queries are bounded; dashboard calculations use database aggregates. Hosted timings and query plans must be measured against the actual deployment before claiming the two-second target.
