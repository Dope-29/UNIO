import { db } from '../src/infra/db.js';

const constraints = [
  [
    'user_email_normalized',
    'ALTER TABLE "User" ADD CONSTRAINT "user_email_normalized" CHECK (email = lower(btrim(email)))',
  ],
  [
    'customer_email_normalized',
    'ALTER TABLE "Customer" ADD CONSTRAINT "customer_email_normalized" CHECK (email = lower(btrim(email)))',
  ],
  [
    'product_prices_nonnegative',
    'ALTER TABLE "Product" ADD CONSTRAINT "product_prices_nonnegative" CHECK ("salesPrice" >= 0 AND "costPrice" >= 0)',
  ],
  [
    'variant_extra_nonnegative',
    'ALTER TABLE "ProductVariant" ADD CONSTRAINT "variant_extra_nonnegative" CHECK ("extraPrice" >= 0)',
  ],
  [
    'plan_valid',
    'ALTER TABLE "Plan" ADD CONSTRAINT "plan_valid" CHECK (price >= 0 AND "minQuantity" > 0 AND ("availableTo" IS NULL OR "availableTo" >= "availableFrom"))',
  ],
  [
    'tax_rate_valid',
    'ALTER TABLE "Tax" ADD CONSTRAINT "tax_rate_valid" CHECK ("ratePercent" BETWEEN 0 AND 100)',
  ],
  [
    'discount_valid',
    'ALTER TABLE "Discount" ADD CONSTRAINT "discount_valid" CHECK (value >= 0 AND "usedCount" >= 0 AND "usageLimit" > 0 AND "endDate" >= "startDate" AND (type <> \'PERCENT\' OR value <= 100) AND ("minPurchase" IS NULL OR "minPurchase" >= 0) AND ("minQuantity" IS NULL OR "minQuantity" > 0))',
  ],
  [
    'subscription_valid',
    'ALTER TABLE "Subscription" ADD CONSTRAINT "subscription_valid" CHECK ("expiryDate" > "startDate" AND "dueDays" IN (0, 15, 30) AND "validityDays" > 0 AND "billingAnchorDay" BETWEEN 1 AND 31)',
  ],
  [
    'subscription_line_valid',
    'ALTER TABLE "SubscriptionLine" ADD CONSTRAINT "subscription_line_valid" CHECK (quantity > 0 AND "unitPrice" >= 0)',
  ],
  [
    'template_validity_positive',
    'ALTER TABLE "QuotationTemplate" ADD CONSTRAINT "template_validity_positive" CHECK ("validityDays" > 0)',
  ],
  [
    'template_line_quantity_positive',
    'ALTER TABLE "QuotationTemplateLine" ADD CONSTRAINT "template_line_quantity_positive" CHECK (quantity > 0)',
  ],
  [
    'invoice_amounts_valid',
    'ALTER TABLE "Invoice" ADD CONSTRAINT "invoice_amounts_valid" CHECK (subtotal >= 0 AND "discountTotal" BETWEEN 0 AND subtotal AND "taxTotal" >= 0 AND total = subtotal - "discountTotal" + "taxTotal" AND "amountPaid" BETWEEN 0 AND total AND "periodEnd" > "periodStart" AND "dueDate" >= "issueDate")',
  ],
  [
    'invoice_line_valid',
    'ALTER TABLE "InvoiceLine" ADD CONSTRAINT "invoice_line_valid" CHECK (quantity > 0 AND "unitPrice" >= 0 AND "discountAmount" BETWEEN 0 AND quantity * "unitPrice" AND "taxRate" BETWEEN 0 AND 100 AND "taxAmount" >= 0 AND "lineTotal" = quantity * "unitPrice" - "discountAmount" + "taxAmount")',
  ],
  [
    'invoice_discount_positive',
    'ALTER TABLE "InvoiceDiscount" ADD CONSTRAINT "invoice_discount_positive" CHECK (amount > 0)',
  ],
  [
    'payment_positive',
    'ALTER TABLE "Payment" ADD CONSTRAINT "payment_positive" CHECK (amount > 0)',
  ],
  [
    'order_positive',
    'ALTER TABLE "GatewayOrder" ADD CONSTRAINT "order_positive" CHECK (amount > 0)',
  ],
] as const;

for (const [name, sql] of constraints) {
  const existing = await db.$queryRawUnsafe<{ exists: boolean }[]>(
    'SELECT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = $1) AS exists',
    name,
  );
  if (!existing[0]?.exists) await db.$executeRawUnsafe(sql);
}

console.info(`Verified ${constraints.length} database constraints.`);
await db.$disconnect();
