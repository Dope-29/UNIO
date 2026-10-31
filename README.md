# Unio

Unio is a subscription-management application with separate React frontend and
Express backend projects.

```text
unio/
|-- backend-1/   Express, TypeScript, Prisma, and PostgreSQL/Supabase API
|-- frontend/    React and Vite customer, staff, and administrator website
```

## Requirements

- Node.js 22.12 or newer
- npm
- A Supabase project with PostgreSQL

## 1. Configure and run the backend

Open PowerShell in the repository root and run:

```powershell
cd backend-1
npm ci
Copy-Item .env.example .env
```

Edit `backend-1\.env` and set:

- `SUPABASE_DATABASE_URL`: the Supabase **Session pooler** PostgreSQL URI
- `SUPABASE_DIRECT_URL`: the Supabase **Direct connection** PostgreSQL URI
- `JWT_SECRET`: a random secret with at least 32 characters
- `CRON_KEY`: another random secret
- `FRONTEND_URL`: `http://localhost:5173`

URL-encode any special characters in the database password. Do not use the
Supabase project URL, anon key, or service-role key as a database URL.

Initialize the database and start the API:

```powershell
npm run db:generate
npm run db:setup
npm run dev
```

\
3. The account is created with the default customer role.

Then, while the backend is running, promote that account from a third terminal:

```powershell
cd backend-1
npm run users:promote-admin -- your-email@example.com
```

Sign out and sign in again. The same account should now open the administrator
workspace.

## Website walkthrough

### Sign in and account recovery

1. Open `/login` and sign in.
2. The site sends a signed-in user to the dashboard matching their role.
3. Use **Forgot password?** to request a password-reset email.
4. Use the reset link delivered by email to choose a new password.
5. New users can create a customer account at `/signup`.

### Administrator workspace

Sign in with an administrator account and open `/user/admin` to see the
dashboard. Use the sidebar to walk through:

- **Customers** - create and manage customer records.
- **Subscriptions** - create subscriptions, open subscription details, and
  review subscription status.
- **Invoices** - review generated invoices and their payment state.
- **Payments** - inspect payments or record a manual payment.
- **Overdue** - review overdue invoices and subscription balances.
- **Products**, **Plans**, **Quotation Templates**, **Discounts**, and
  **Taxes** - configure the items and pricing rules used by subscriptions.
- **Staff** - manage staff accounts.
- **Reports** - review billing and revenue reports.

A typical administrator flow is:

1. Create products and plans.
2. Configure taxes and discounts if needed.
3. Add or review a customer.
4. Create a new subscription.
5. Open the subscription to confirm its plan, dates, charges, and status.
6. Review generated invoices, record or verify payments, and check overdue items.

### Staff workspace

A staff account can access `/user/staff`. Staff may work with:

- Customers
- Subscriptions
- Invoices
- Payments
- Overdue accounts
- Reports

Staff do not have access to administrator catalog, tax, discount, quotation
template, or staff-management screens.

### Customer portal

A customer account opens `/user/portal`. The customer can:

- Review the portal home page and account information.
- Browse **Products**.
- View **My Subscriptions** and open subscription details.
- View **My Invoices** and open invoice details.
- Continue to the payment page for available online payment options.
- Update information in **Profile**.

Sign out from the sidebar when the walkthrough is complete.

## Optional services

Email and Razorpay settings are optional for starting the application. Add
them to `backend-1\.env` only when the related feature is required:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `MAIL_FROM` enable
  reset emails and invoice delivery.
- Razorpay test credentials enable online payments. A public HTTPS webhook for
  Razorpay should target `/api/payments/webhook`.
- Set `CRON_ENABLED=true` only when the backend's scheduled billing worker
  should run automatically.

## Production build

```powershell
cd backend-1
npm ci
npm run db:generate
npm run db:setup
npm run build
npm start
```

In a separate terminal:

```powershell
cd frontend
npm ci
npm run build
npm run preview
```

For deployment, build the frontend and serve `frontend\dist` through the
frontend hosting platform. Set `frontend\.env`'s `VITE_API_URL` to the public
backend origin, update `FRONTEND_URL` in the backend environment, and ensure
the frontend and API are allowed to share credentials through CORS.

## Common checks

- Verify the API at <http://localhost:4000/health>.
- Verify PostgreSQL at <http://localhost:4000/ready>.
- Confirm the backend terminal has no database connection errors.
- Confirm `FRONTEND_URL=http://localhost:5173` in the backend environment.
- If Vite cannot reach the API, restart the frontend after changing
  `VITE_API_URL` and make sure the backend is still running.
