# Backend implementation tasks

Implementation order: foundation; authentication; staff/RBAC; customers; products/variants; plans/templates; taxes/discount pricing; subscription lifecycle; invoice/billing engine; manual payments/overdue; email/PDF; customer portal; reports; PostgreSQL persistence; Razorpay; verification.

Shared services own all business rules. Routers validate and authorize requests. Staff and customer routes reuse services with explicit customer ownership filters. No frontend is included.

## Confirmed business decisions

- Default unit price is product sales price plus variant extra; plan price is metadata, not an additional charge.
- Discounts stack, product scope before subscription scope. Fixed discounts apply once across matching lines and are allocated proportionally. Eligibility thresholds use the scope's products/whole subscription. Usage is once per invoice and restored on cancellation. No line may become negative.
- Staff read catalog, plans, templates, taxes and discounts; only admins write these or manage staff.
- Resume skips paused periods; next billing date is one plan period from resume date. Without auto-close, billing continues past expiry and exposes a pastExpiry flag.
- Add-ons change subscription lines for the next generated invoice, without proration.
- Money is decimal, rounded half-up to cents. Dates and billing scheduler use UTC. Monthly/yearly periods preserve the original billing anchor day when possible.

## Final external checks

- Apply migrations to the chosen PostgreSQL instance and run integration tests.
- Configure sandbox SMTP and verify delivered reset/invoice emails.
- Configure Razorpay test keys, public webhook URL and verify a test capture.
- Seed hosted performance dataset and measure API timings and EXPLAIN plans; do not claim the two-second target without measurements.
