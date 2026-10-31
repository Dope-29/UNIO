-- Brightloop backend database schema for Supabase PostgreSQL.
-- Paste this entire file into Supabase Dashboard -> SQL Editor and run it
-- against a new/empty project.  These quoted names intentionally match
-- prisma/schema.prisma exactly.

BEGIN;

CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF', 'CUSTOMER');
CREATE TYPE "BillingPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');
CREATE TYPE "SubStatus" AS ENUM ('DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'CLOSED');
CREATE TYPE "InvStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED');
CREATE TYPE "DiscountType" AS ENUM ('FIXED', 'PERCENT');
CREATE TYPE "DiscountScope" AS ENUM ('PRODUCT', 'SUBSCRIPTION');
CREATE TYPE "PayMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CARD', 'UPI', 'CHEQUE', 'ONLINE');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sessionVersion" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "User_email_key" UNIQUE ("email"),
  CONSTRAINT "user_email_normalized" CHECK ("email" = lower(btrim("email")))
);

CREATE TABLE "Customer" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "company" TEXT,
  "phone" TEXT,
  "address" TEXT,
  CONSTRAINT "Customer_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Customer_userId_key" UNIQUE ("userId"),
  CONSTRAINT "Customer_email_key" UNIQUE ("email"),
  CONSTRAINT "customer_email_normalized" CHECK ("email" = lower(btrim("email"))),
  CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "salesPrice" DECIMAL(12,2) NOT NULL,
  "costPrice" DECIMAL(12,2) NOT NULL,
  "notes" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "product_prices_nonnegative" CHECK ("salesPrice" >= 0 AND "costPrice" >= 0)
);

CREATE TABLE "ProductVariant" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "attribute" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "extraPrice" DECIMAL(12,2) NOT NULL,
  CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProductVariant_productId_attribute_value_key" UNIQUE ("productId", "attribute", "value"),
  CONSTRAINT "variant_extra_nonnegative" CHECK ("extraPrice" >= 0),
  CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Plan" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "price" DECIMAL(12,2) NOT NULL,
  "billingPeriod" "BillingPeriod" NOT NULL,
  "minQuantity" INTEGER NOT NULL DEFAULT 1,
  "availableFrom" TIMESTAMP(3) NOT NULL,
  "availableTo" TIMESTAMP(3),
  "autoCloseOnEnd" BOOLEAN NOT NULL DEFAULT false,
  "allowEarlyClose" BOOLEAN NOT NULL DEFAULT false,
  "allowPause" BOOLEAN NOT NULL DEFAULT false,
  "allowRenew" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "Plan_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "plan_valid" CHECK ("price" >= 0 AND "minQuantity" > 0 AND ("availableTo" IS NULL OR "availableTo" >= "availableFrom"))
);

CREATE TABLE "Tax" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "ratePercent" DECIMAL(5,2) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "Tax_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "tax_rate_valid" CHECK ("ratePercent" BETWEEN 0 AND 100)
);

CREATE TABLE "Discount" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "DiscountType" NOT NULL,
  "value" DECIMAL(12,2) NOT NULL,
  "minPurchase" DECIMAL(12,2),
  "minQuantity" INTEGER,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "usageLimit" INTEGER NOT NULL,
  "usedCount" INTEGER NOT NULL DEFAULT 0,
  "scope" "DiscountScope" NOT NULL,
  "productIds" TEXT[] NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "Discount_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "discount_valid" CHECK ("value" >= 0 AND "usedCount" >= 0 AND "usageLimit" > 0 AND "endDate" >= "startDate" AND ("type" <> 'PERCENT' OR "value" <= 100) AND ("minPurchase" IS NULL OR "minPurchase" >= 0) AND ("minQuantity" IS NULL OR "minQuantity" > 0))
);

CREATE TABLE "QuotationTemplate" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "validityDays" INTEGER NOT NULL,
  "planId" TEXT NOT NULL,
  CONSTRAINT "QuotationTemplate_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "template_validity_positive" CHECK ("validityDays" > 0),
  CONSTRAINT "QuotationTemplate_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "QuotationTemplateLine" (
  "id" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "variantId" TEXT,
  "quantity" INTEGER NOT NULL,
  "taxId" TEXT,
  CONSTRAINT "QuotationTemplateLine_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "template_line_quantity_positive" CHECK ("quantity" > 0),
  CONSTRAINT "QuotationTemplateLine_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "QuotationTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "QuotationTemplateLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "QuotationTemplateLine_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "QuotationTemplateLine_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "Tax"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Subscription" (
  "id" TEXT NOT NULL,
  "number" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "expiryDate" TIMESTAMP(3) NOT NULL,
  "billingAnchorDay" INTEGER NOT NULL,
  "validityDays" INTEGER NOT NULL,
  "dueDays" INTEGER NOT NULL DEFAULT 0,
  "paymentTerms" TEXT NOT NULL,
  "status" "SubStatus" NOT NULL DEFAULT 'DRAFT',
  "nextBillingDate" TIMESTAMP(3),
  "pausedAt" TIMESTAMP(3),
  "quotationValidUntil" TIMESTAMP(3),
  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Subscription_number_key" UNIQUE ("number"),
  CONSTRAINT "subscription_valid" CHECK ("expiryDate" > "startDate" AND "dueDays" IN (0, 15, 30) AND "validityDays" > 0 AND "billingAnchorDay" BETWEEN 1 AND 31),
  CONSTRAINT "Subscription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "SubscriptionLine" (
  "id" TEXT NOT NULL,
  "subscriptionId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "variantId" TEXT,
  "quantity" INTEGER NOT NULL,
  "unitPrice" DECIMAL(12,2) NOT NULL,
  "taxId" TEXT,
  CONSTRAINT "SubscriptionLine_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "subscription_line_valid" CHECK ("quantity" > 0 AND "unitPrice" >= 0),
  CONSTRAINT "SubscriptionLine_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SubscriptionLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "SubscriptionLine_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "SubscriptionLine_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "Tax"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Invoice" (
  "id" TEXT NOT NULL,
  "number" TEXT NOT NULL,
  "subscriptionId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "customerAddress" TEXT,
  "currency" TEXT NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "issueDate" TIMESTAMP(3) NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "status" "InvStatus" NOT NULL DEFAULT 'DRAFT',
  "subtotal" DECIMAL(12,2) NOT NULL,
  "discountTotal" DECIMAL(12,2) NOT NULL,
  "taxTotal" DECIMAL(12,2) NOT NULL,
  "total" DECIMAL(12,2) NOT NULL,
  "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "sentAt" TIMESTAMP(3),
  CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Invoice_number_key" UNIQUE ("number"),
  CONSTRAINT "Invoice_subscriptionId_periodStart_key" UNIQUE ("subscriptionId", "periodStart"),
  CONSTRAINT "invoice_amounts_valid" CHECK ("subtotal" >= 0 AND "discountTotal" BETWEEN 0 AND "subtotal" AND "taxTotal" >= 0 AND "total" = "subtotal" - "discountTotal" + "taxTotal" AND "amountPaid" BETWEEN 0 AND "total" AND "periodEnd" > "periodStart" AND "dueDate" >= "issueDate"),
  CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "InvoiceLine" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitPrice" DECIMAL(12,2) NOT NULL,
  "discountAmount" DECIMAL(12,2) NOT NULL,
  "taxRate" DECIMAL(5,2) NOT NULL,
  "taxAmount" DECIMAL(12,2) NOT NULL,
  "lineTotal" DECIMAL(12,2) NOT NULL,
  CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "invoice_line_valid" CHECK ("quantity" > 0 AND "unitPrice" >= 0 AND "discountAmount" BETWEEN 0 AND "quantity" * "unitPrice" AND "taxRate" BETWEEN 0 AND 100 AND "taxAmount" >= 0 AND "lineTotal" = "quantity" * "unitPrice" - "discountAmount" + "taxAmount"),
  CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "InvoiceDiscount" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "discountId" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  CONSTRAINT "InvoiceDiscount_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "InvoiceDiscount_invoiceId_discountId_key" UNIQUE ("invoiceId", "discountId"),
  CONSTRAINT "invoice_discount_positive" CHECK ("amount" > 0),
  CONSTRAINT "InvoiceDiscount_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "InvoiceDiscount_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "method" "PayMethod" NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "paidAt" TIMESTAMP(3) NOT NULL,
  "note" TEXT,
  "gatewayRef" TEXT,
  "recordedById" TEXT,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Payment_gatewayRef_key" UNIQUE ("gatewayRef"),
  CONSTRAINT "payment_positive" CHECK ("amount" > 0),
  CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Payment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "ReminderLog" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sentById" TEXT,
  CONSTRAINT "ReminderLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ReminderLog_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ReminderLog_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "PasswordResetToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PasswordResetToken_tokenHash_key" UNIQUE ("tokenHash"),
  CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Counter" (
  "key" TEXT NOT NULL,
  "value" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Counter_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "MailOutbox" (
  "id" TEXT NOT NULL,
  "to" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sentAt" TIMESTAMP(3),
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "MailOutbox_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GatewayOrder" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paidAt" TIMESTAMP(3),
  CONSTRAINT "GatewayOrder_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "order_positive" CHECK ("amount" > 0),
  CONSTRAINT "GatewayOrder_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "QuotationTemplate_planId_idx" ON "QuotationTemplate"("planId");
CREATE INDEX "QuotationTemplateLine_templateId_idx" ON "QuotationTemplateLine"("templateId");
CREATE INDEX "Discount_isActive_startDate_endDate_idx" ON "Discount"("isActive", "startDate", "endDate");
CREATE INDEX "Subscription_status_nextBillingDate_idx" ON "Subscription"("status", "nextBillingDate");
CREATE INDEX "Subscription_customerId_idx" ON "Subscription"("customerId");
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");
CREATE INDEX "SubscriptionLine_subscriptionId_idx" ON "SubscriptionLine"("subscriptionId");
CREATE INDEX "Invoice_status_dueDate_idx" ON "Invoice"("status", "dueDate");
CREATE INDEX "Invoice_customerId_idx" ON "Invoice"("customerId");
CREATE INDEX "Invoice_issueDate_idx" ON "Invoice"("issueDate");
CREATE INDEX "InvoiceLine_invoiceId_idx" ON "InvoiceLine"("invoiceId");
CREATE INDEX "InvoiceDiscount_discountId_idx" ON "InvoiceDiscount"("discountId");
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");
CREATE INDEX "Payment_paidAt_idx" ON "Payment"("paidAt");
CREATE INDEX "ReminderLog_invoiceId_idx" ON "ReminderLog"("invoiceId");
CREATE INDEX "PasswordResetToken_userId_usedAt_idx" ON "PasswordResetToken"("userId", "usedAt");
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");
CREATE INDEX "MailOutbox_sentAt_nextAttemptAt_idx" ON "MailOutbox"("sentAt", "nextAttemptAt");
CREATE INDEX "GatewayOrder_invoiceId_idx" ON "GatewayOrder"("invoiceId");

COMMIT;
