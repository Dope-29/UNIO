# Brightloop backend

Express + TypeScript, Prisma + Supabase PostgreSQL. Backend only. Module responsibilities and confirmed rules are in [docs/TASKS.md](docs/TASKS.md); request bodies and endpoint behavior are in [docs/API.md](docs/API.md).

## Setup

Requires Node.js 22.12+ and a Supabase project.

```powershell
npm ci
Copy-Item .env.example .env
# Edit .env with your Supabase connection URIs and random JWT/cron secrets.
npm run db:generate
npm run db:setup
npm run dev
```

In Supabase Dashboard, open **Connect**. Put the **Session pooler** URI in `SUPABASE_DATABASE_URL` and the **Direct connection** URI in `SUPABASE_DIRECT_URL`. URL-encode special characters in the database password. The first is used by the long-running API; the second initializes the empty database. `npm run db:setup` is not a migration workflow: it directly creates the tables, indexes, foreign keys, enums, and validation constraints from [prisma/schema.prisma](prisma/schema.prisma). No Supabase URL, anon key, or service-role key is needed because this server connects directly to PostgreSQL and owns authentication and authorization.

The database begins empty. Sign up your first account through `POST /api/auth/signup`, then promote it once:

```powershell
npm run users:promote-admin -- you@example.com
```

Log in again after promotion. This command changes only that existing account; it does not insert demo data.

Production: `npm ci`, `npm run db:generate`, run `npm run db:setup` once for an empty Supabase project, then `npm run build` and `npm start`. API defaults to port 4000. `/health` checks the process; `/ready` checks PostgreSQL. Configure a persistent API process for the email worker and optional UTC billing scheduler. A protected external cron can POST `{}` to `/api/internal/run-billing` with `x-cron-key` and JSON Content-Type. No proxy trust is enabled implicitly; configure a verified proxy topology before deployment behind a reverse proxy.

## Verification

`npm test` runs pure pricing/date rules and HTTP/security tests. The database integration suite runs only when `SUPABASE_TEST_DATABASE_URL` is explicitly set to a separate non-production Supabase database. See [docs/VERIFICATION.md](docs/VERIFICATION.md) for actual results and external checks.

`npm run build` checks TypeScript and produces dist. `npm audit` checks dependencies. Package lock is committed with the source deliverable. The Prisma version is pinned to the stable 7.x line instead of the registry's 8.x release candidate.

## Email and payments

SMTP configuration is required for reset emails and invoice delivery. Quotation delivery uses a retrying outbox; password reset tokens are stored only as SHA-256 hashes and never logged. Requests to forgot-password always return the same response. SMTP delivery failures are logged without tokens.

Razorpay is optional and restricted to test keys. Configure RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET, then point a public HTTPS webhook at `/api/payments/webhook`, subscribed to payment.captured. Manual payments work independently. Signed payment IDs are unique and replay-safe. If a capture arrives after another payment has settled the invoice, it is rejected for reconciliation rather than silently overpaying the ledger; monitor failed webhook deliveries and refund/reconcile in the gateway dashboard. This build does not automate refunds.

## Supabase dashboard

Use Supabase SQL Editor only for inspecting tables and query plans. Do not enable Supabase Auth or Row Level Security for these tables: this API uses its own JWT sessions and role checks, and the database connection uses the server database role. Keep the project URL, anon key, and service-role key out of this backend unless you later add a Supabase service that requires them.
