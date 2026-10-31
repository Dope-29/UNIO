# Verification results

Last local run: 2026-10-31.

`npm run test:integration -- --benchmark` applied both PostgreSQL migrations to a temporary database and completed 47 tests. The coverage includes authentication and reset-token reuse, role restrictions, customer ownership, price and tax snapshots, quotation templates, subscription transitions, pause/resume scheduling, add-ons, billing and payment races, discount limits, invoice cancellation, PDF generation, reports, signed Razorpay webhook replay, and manual `ONLINE` payment rejection.

The local performance fixture contained 200 customers, 5,000 active subscriptions, 15,000 invoices, and 10,000 payments. Expected report totals matched exactly: 5,000 active subscriptions, `1000000.00` revenue, `500000.00` outstanding, and 2,500 overdue invoices. The slowest of nine measured in-process HTTP endpoints was the first `/api/customers` request at 113.81 ms; the local results are saved in ignored `docs/local-benchmark.json`. `EXPLAIN ANALYZE` used `Invoice_status_dueDate_idx` for the overdue query.

These are local results, so hosted database latency, deployment cold starts, SMTP delivery, Razorpay test capture, public webhook delivery, and production query plans remain to be verified after deployment.
