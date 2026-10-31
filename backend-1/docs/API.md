# API contract

Base URL: `/api`. Send JSON with `Content-Type: application/json` for every mutation, including `{}` for actions. Authentication uses an HttpOnly `session` cookie; browser clients must use `credentials: "include"`. The browser Origin must equal FRONTEND_URL. Money is returned as decimal strings. Dates are ISO UTC timestamps. IDs are opaque strings.

Success: `{data: ...}`. Paginated lists: `{data: [], total, page, take}`. Errors: `{error: {code, message, fields?}}`. Default take 25, maximum 100. Dates in filters: `from` and `to` ISO timestamps, inclusive. Ordering is deterministic. Reports exported as CSV contain the requested page, with `X-Total-Count`; paginate exports to retrieve all rows.

## Authentication and staff

- POST `/auth/signup`: `{name,email,password}`; always creates CUSTOMER. Password >=9 characters, uppercase, lowercase, special; bcrypt limit 72 UTF-8 bytes.
- POST `/auth/login`: `{email,password}`; POST `/auth/logout`: `{}`; GET `/auth/me`.
- POST `/auth/forgot`: `{email}`; POST `/auth/reset`: `{token,password}`.
- ADMIN: GET/POST `/users/staff`, PATCH `/users/staff/:id` (`name`, `isActive`). Staff creation uses `{name,email,password}`.

## Catalog

ADMIN writes; ADMIN and STAFF read. GET/POST collection, GET/PATCH/DELETE `/:id` for `/products`, `/plans`, `/taxes`, `/discounts`, `/templates`. DELETE deactivates products/plans/taxes/discounts; templates are deleted. Referenced variants cannot be deleted.

- Products: `{name,type,salesPrice,costPrice,notes?,isActive?}`; add-on type is `Add-on`.
- POST `/products/:id/variants`: `{attribute,value,extraPrice}`; PATCH/DELETE `/products/:id/variants/:variantId`.
- Plans: `{name,price,billingPeriod,minQuantity?,availableFrom,availableTo?,autoCloseOnEnd?,allowEarlyClose?,allowPause?,allowRenew?,isActive?}`. Periods: DAILY, WEEKLY, MONTHLY, YEARLY.
- Taxes: `{name,ratePercent,isActive?}`.
- Discounts: `{name,type,value,scope,productIds?,minPurchase?,minQuantity?,startDate,endDate,usageLimit,isActive?}`. Type FIXED/PERCENT, scope PRODUCT/SUBSCRIPTION. `usedCount` is server-managed.
- Templates: `{name,validityDays,planId,lines:[{productId,variantId?,quantity,taxId?}]}`.

## Customers and subscriptions (ADMIN/STAFF)

- GET/POST `/customers`, GET/PATCH `/customers/:id`; fields `{name,email,company?,phone?,address?}`. List accepts `search`.
- GET/POST `/subscriptions`, GET/PATCH `/subscriptions/:id`. Filters: `status`, `customerId`, `planId`, `paused`, `pastExpiry`, `from`, `to` (start date).
- Create: `{customerId,planId?,templateId?,startDate,expiryDate,dueDays?,validityDays?,lines?}`. Template fills plan, validity and lines. Without template, planId, validityDays and lines are required. dueDays: 0,15,30.
- Lines: `{productId,variantId?,quantity,unitPrice?,taxId?}`. Omitted unitPrice uses product plus variant. PATCH body: `{lines:[...]}`; allowed in Draft or Active. Active edits affect subsequent invoices.
- POST `/subscriptions/:id/{send-quote,confirm,activate,close,pause,resume,renew}` with `{}`.
- POST `/subscriptions/:id/invoice-now`, POST `/billing/run`, POST `/internal/run-billing` with `{}`. Internal trigger uses `x-cron-key`.
- One billing run produces at most one outstanding period per subscription. Repeat runs catch up historical periods, in order. Already billed periods are never regenerated, including cancelled invoices. Resume skips paused periods and schedules a new period one billing interval from resume time.
- Quotation emails are queued transactionally and retried every minute. SMTP must be configured for delivery. Send-quote responses mean queued, not delivered.

## Invoices, payments and reports (ADMIN/STAFF)

- GET `/invoices`, GET `/invoices/:id`; filters: status, customerId, subscriptionId, from/to (issue date).
- POST `/invoices/:id/{confirm,cancel,send,remind}`; GET `/invoices/:id/pdf`; GET `/invoices/overdue`.
- POST `/invoices/:id/payments`: `{method,amount,paidAt,note?}`. Manual methods CASH/BANK_TRANSFER/CARD/UPI/CHEQUE. ONLINE is webhook-only. Payment dates cannot be future dates. Confirmed zero-total invoices become Paid on confirmation.
- GET `/payments`: filters invoiceId, method, from/to (paid date).
- GET `/reports/summary`: from/to applies to subscription start date, payment date, and invoice issue date respectively. Active counts include paused active subscriptions. Outstanding excludes Draft/Cancelled. Overdue is due date before current UTC day.
- GET `/reports/{subscriptions,invoices,payments}` supports corresponding list filters and `format=csv`.

## Customer portal

- GET `/portal/subscriptions`, GET `/portal/subscriptions/:id`; POST `/:id/{pause,resume,renew,close}`.
- POST `/portal/subscriptions/:id/addons`: `{action:"add"|"remove",productId,variantId?,quantity?}`.
- GET `/portal/invoices`, GET `/portal/invoices/:id`, GET `/portal/invoices/:id/pdf`. Drafts are hidden; every lookup is scoped to the authenticated customer.
- POST `/portal/invoices/:id/pay-order`: returns `{data:{orderId,keyId,amount,currency}}`, amount is integer minor units for Razorpay checkout.
- GET/PATCH `/portal/profile`; POST `/portal/change-password`: `{currentPassword,password}`; changing password invalidates all sessions.
- POST `/payments/webhook`: raw JSON with Razorpay HMAC signature. Only payment.captured records payment; browser success callbacks never do.

## Pricing

Scope thresholds use original matching subtotals and quantities. Product discounts run before subscription discounts; ties use discount ID for deterministic order. Fixed discounts are allocated once in proportion to original matching line amounts, capped per line, with leftover cents redistributed. Each stacked percentage uses the line's original subtotal. Taxes apply to discounted lines. Snapshots never change with catalog/customer updates. Invoice cancellation restores one usage for each discount applied to that invoice.
