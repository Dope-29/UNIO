// ─── Auth ───────────────────────────────────────────────────────────────────
export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
}

// ─── Product ─────────────────────────────────────────────────────────────────
export interface ProductVariant {
  id: string;
  attribute: string;
  value: string;
  extraPrice: number;
}

export interface Product {
  id: string;
  name: string;
  type: 'Digital service' | 'Physical' | 'Add-on' | 'One-time';
  salesPrice: number;
  costPrice: number;
  notes: string;
  variants: ProductVariant[];
  status: 'Active' | 'Inactive';
}

// ─── Plan ────────────────────────────────────────────────────────────────────
export type BillingPeriod = 'Monthly' | 'Quarterly' | 'Annual';

export interface Plan {
  id: string;
  name: string;
  price: number;
  billingPeriod: BillingPeriod;
  minQty: number;
  availableFrom: string;
  availableUntil: string;
  closeAuto: boolean;
  allowEarlyClose: boolean;
  allowPause: boolean;
  allowRenew: boolean;
  status: 'Active' | 'Inactive';
}

// ─── Quotation Template ───────────────────────────────────────────────────────
export interface QuotationLine {
  id: string;
  product: string;
  variant: string;
  qty: number;
}

export interface QuotationTemplate {
  id: string;
  name: string;
  validityDays: number;
  planId: string;
  lines: QuotationLine[];
}

// ─── Discount ────────────────────────────────────────────────────────────────
export type DiscountType = 'Fixed' | 'Percentage';
export type DiscountStatus = 'Active' | 'Expired' | 'Exhausted' | 'Scheduled';

export interface Discount {
  id: string;
  name: string;
  type: DiscountType;
  value: number;
  minPurchase: number;
  minQty: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usageCount: number;
  appliesTo: string;
  status: DiscountStatus;
}

// ─── Tax ─────────────────────────────────────────────────────────────────────
export interface Tax {
  id: string;
  name: string;
  rate: number;
  appliesTo: string;
  active: boolean;
}

// ─── Staff ───────────────────────────────────────────────────────────────────
export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  lastActive: string;
}

// ─── Customer ────────────────────────────────────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  billingAddress: string;
  activeSubscriptions: number;
  outstandingAmount: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

// ─── Subscription ────────────────────────────────────────────────────────────
export type SubscriptionStatus =
  | 'Draft'
  | 'Quotation'
  | 'Confirmed'
  | 'Active'
  | 'Paused'
  | 'Closed';

export interface SubscriptionLine {
  id: string;
  product: string;
  qty: number;
  unitPrice: number;
  taxIds: string[];
  amount: number;
}

export interface Subscription {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  planId: string;
  planName: string;
  startDate: string;
  expiryDate: string;
  nextBillingDate: string;
  paymentTerms: string;
  status: SubscriptionStatus;
  lines: SubscriptionLine[];
  total: number;
  templateId?: string;
}

// ─── Invoice ─────────────────────────────────────────────────────────────────
export type InvoiceStatus = 'Draft' | 'Confirmed' | 'Paid' | 'Overdue' | 'Cancelled';

export interface InvoiceLine {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  subscriptionId: string;
  issueDate: string;
  dueDate: string;
  lines: InvoiceLine[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paid: number;
  balance: number;
  status: InvoiceStatus;
}

// ─── Payment ─────────────────────────────────────────────────────────────────
export type PaymentMethod = 'Card' | 'Bank Transfer' | 'UPI' | 'Cash' | 'Cheque';

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  method: PaymentMethod;
  amount: number;
  date: string;
  note: string;
}

// ─── KPI ─────────────────────────────────────────────────────────────────────
export interface KPIData {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: string;
}

