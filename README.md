# UNIO

**UNIO** is one unified platform that runs the full life of a subscription business: products and plans, quotations, subscriptions, automatic recurring invoices, taxes, discounts, payments, and finance reporting. Built for a 6-hour hackathon.

The scenario is Brightloop Software, a company that sells business software on subscription (monthly or yearly), with add-ons and product variants. Before UNIO, subscriptions lived in a spreadsheet, renewals were remembered by whoever noticed first, invoices were typed by hand, payments were matched by scrolling bank statements, and nobody could say how much recurring revenue the company had. UNIO replaces all of that.

---

## Users and roles

| Role | What they can do |
|---|---|
| **Admin** | Controls the whole system. Creates products, variants, plans, quotation templates, taxes and discount rules. The only role that can add staff. Can also use every staff screen. |
| **Staff** | Day-to-day work with limited access: customers, subscriptions, invoices, payments, overdue list, reports. No access to products, plans, taxes, discounts or staff management. |
| **Customer** | Self-service portal. Sees only their own subscriptions and invoices. Can pause, renew or close a subscription (only if the plan allows it), switch add-ons, download invoices and pay online. |

Security is enforced in the API on every route. Hiding menu items in the UI is only a convenience.

---

## Features

**Accounts and access**
- Sign up with email and password. One account per email.
- Password rule: more than 8 characters (at least 9), with an uppercase letter, a lowercase letter and a special character.
- Forgot password: a one-time reset link is emailed to the registered address.
- Role-based access for Admin, Staff and Customer.

**Catalogue**
- Products with name, type, sales price, cost price and notes.
- Variants, for example Brand = Odoo adds 560 to the price.
- Plans with price, billing period (daily, weekly, monthly, yearly), minimum quantity and availability dates.
- Per-plan rules chosen by the admin: close automatically at end, allow early close, allow pause, allow renew.
- Quotation templates (plan + product lines + validity in days).

**Subscriptions**
- Unique number (SUB-0001), customer, plan, start date, expiry date, payment terms.
- Lines with product, quantity, unit price, taxes and amount.
- Status flow: **Draft, Quotation, Confirmed, Active, Closed**, visible to the whole team.

**Billing**
- Invoices are generated from subscriptions automatically, with customer, lines, taxes and totals filled in.
- Taxes are calculated from the admin's tax rules.
- Invoice status flow: **Draft, Confirmed, Paid** (plus Cancelled). Team can confirm, cancel, send and print.
- Nothing is billed twice and nothing is skipped.

**Discounts**
- Admin-only rules: fixed amount or percentage, minimum purchase or quantity, start and end dates, usage limit.
- Apply to specific products or whole subscriptions.
- Applied to the next invoice automatically and stop when expired or used up.

**Payments**
- Record method, amount, date and note against the right invoice (partial payments supported).
- Customers can pay online through a gateway in test mode.
- Paid vs outstanding is visible at all times, with an overdue list and reminder emails.

**Reporting**
- One finance view: active subscriptions, revenue collected, amount still owed, overdue invoices, with filters and a summary.
- Every page is designed to respond in under 2 seconds with thousands of subscriptions.

---

## How the whole workflow runs

A billing month, step by step.

1. **A customer signs up.** A Customer account is created and the customer lands in the portal. Login redirects by role: Admin to the admin dashboard, Staff to the staff dashboard, Customer to the portal. Forgotten passwords are handled by an emailed reset link.
2. **Admin sets up the catalogue.** Products with variants, plans with their rules, taxes, discount rules and quotation templates. Admin also adds staff members.
3. **Staff prepares an offer.** A sales rep starts a new subscription from a quotation template. Plan and product lines fill in and the quotation expiry is set to today plus the template's validity days. The subscription is saved as **Draft**.
4. **The subscription moves through its life:** Draft, then **Send quotation** (Quotation), then **Confirm** (Confirmed), then **Activate** (Active), then **Close** (Closed). Pause, Resume and Renew appear only when the plan allows them.
5. **Billing day.** The billing engine runs daily at 00:30, or staff press **Run billing now**. For every Active, unpaused subscription whose next billing date has arrived it:
   - creates an invoice with the customer, lines, taxes and totals filled in,
   - applies any valid discounts and counts their usage,
   - moves the next billing date forward by one billing period,
   - closes the subscription if its plan has ended and auto-close is on.

   A database unique key on (subscription, period start) means the same period can never be invoiced twice. A failure on one subscription never stops the others and is retried on the next run.
6. **Staff handles invoices:** Confirm, Cancel, Send (emails a PDF) and Print.
7. **Money comes in.** Staff record a payment with method, amount, date and note, or the customer pays online. When the balance reaches zero the invoice becomes **Paid** automatically.
8. **Chasing late payers.** The overdue list shows Confirmed invoices past their due date. Staff can send reminders or record a payment from there.
9. **Finance review.** The reports screen shows active subscriptions, revenue, outstanding balance and overdue invoices, with filters and CSV export.
10. **Customers self-serve.** The portal lets customers view subscriptions, pause, renew or close them if the plan allows, switch add-ons, view and pay invoices, and update their profile.

---

## Tech stack

| Layer | Technology |
|---|---|
| Language | TypeScript (frontend and backend) |
| Backend | Node.js + Express |
| ORM and migrations | Prisma |
| Database | **PostgreSQL hosted on Supabase** |
| Validation | Zod |
| Authentication | bcrypt password hashing, JWT in an httpOnly cookie |
| Scheduler | node-cron, plus a protected HTTP trigger |
| Email | Nodemailer (Mailtrap sandbox or Gmail SMTP) |
| PDF | pdfkit |
| Payment gateway | Razorpay in test mode (alongside manual payment recording) |
| Frontend | React 18 + Vite + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Data fetching | TanStack Query + axios |
| Forms | react-hook-form + zod |
| Routing | React Router |
| Hosting | Frontend: Vercel or Netlify. Backend: Render or Railway. Database: Supabase |

### How Supabase is used

Supabase is used **only as the hosted PostgreSQL database**. Authentication, roles and business logic are handled by UNIO's own Express API, not by Supabase Auth. Prisma connects to Supabase with a connection string.

Copy the connection strings from the Supabase dashboard (Connect button on your project) and put them in `.env`:

- `DATABASE_URL`: the pooled connection string, used by the running API.
- `DIRECT_URL`: the direct connection string, used by Prisma for migrations.

Use the exact strings and any extra query parameters shown in the Supabase dashboard and the Prisma + Supabase documentation for your project.

---

## Architecture

```
React web app (Vercel/Netlify)
        |  HTTPS, httpOnly cookie
        v
Express API (Render/Railway)
   - auth + role guard on every route
   - modules: auth, users, customers, products, plans, templates,
              taxes, discounts, subscriptions, invoices, payments,
              reports, portal
   - services: billing, pricing (tax + discount), mail, pdf, numbering
   - cron: daily billing + overdue check
        |  Prisma
        v
PostgreSQL on Supabase
```

### Project structure

```
unio/
  server/
    prisma/schema.prisma
    prisma/seed.ts
    src/
      app.ts
      config/env.ts
      middleware/ (auth.ts, error.ts)
      modules/ (auth, users, customers, products, plans, templates,
                taxes, discounts, subscriptions, invoices, payments,
                reports, portal)
      services/ (billing, pricing, mail, pdf, numbering)
      jobs/cron.ts
  web/
    src/
      api/  auth/  layouts/  components/
      pages/ (admin, staff, portal)
```

---

## Key business rules

- **Unique email** enforced by a database unique constraint (email stored lower-case).
- **No double billing:** unique (subscriptionId, periodStart) on invoices, one transaction per invoice.
- **Money** stored as `Decimal(12,2)`, never floats. Invoice lines are snapshots, so later price changes never alter old invoices.
- **Tax** is calculated per line after discount, from the admin's active tax rules.
- **Discounts** apply only between their start and end dates, while usage is below the limit, and when the minimum purchase or quantity is met.
- **Overdue** means status Confirmed, balance above zero and due date in the past.
- **Plan flags** (pause, renew, early close) decide which buttons appear and are also re-checked on the server.
- **Customer data isolation:** the customer id always comes from the login token, never from the URL.

---

## Getting started

### 1. Prerequisites

- Node.js (current LTS)
- A Supabase project (the database)
- A Mailtrap account or a Gmail app password (email)
- Optional: Razorpay test keys (online payments)

### 2. Environment variables

Create `server/.env` (and keep a `server/.env.example` without secrets):

```
DATABASE_URL=
DIRECT_URL=
JWT_SECRET=
CRON_KEY=
FRONTEND_URL=http://localhost:5173
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
PORT=4000
```

Generate `JWT_SECRET` and `CRON_KEY` with:

```
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

`SEED_ADMIN_PASSWORD` must follow the password rule (at least 9 characters, with an uppercase letter, a lowercase letter and a special character). Never commit `.env`.

### 3. Set up the database and run the API

```
cd server
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### 4. Run the web app

```
cd web
npm install
npm run dev
```

Open the URL printed by Vite and log in with the seeded admin account.

Adjust the script names above to match the `package.json` in your repository.

---

## Demo flow

1. Sign up a customer, showing the password rule and duplicate-email errors.
2. As admin: create a product with an Odoo variant, a monthly plan, a tax, a discount rule, a quotation template and a staff member.
3. As staff: create a subscription from the template, send the quotation, confirm and activate.
4. Press **Run billing now**: invoices appear with taxes and discounts filled in. Press it again and nothing is duplicated.
5. Record a payment and show the invoice become Paid. Show the overdue list and send a reminder.
6. As customer: see only your own data, pause a subscription, pay an invoice in gateway test mode.
7. Open the finance dashboard and show active subscriptions, revenue, outstanding and overdue with filters, and the measured page timings on seeded data.
