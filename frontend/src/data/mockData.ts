// Compatibility exports for existing screens. They start empty and are only
// populated from the authenticated backend API by LiveDataProvider.
import type { Customer, Discount, Invoice, Payment, Plan, Product, QuotationTemplate, StaffMember, Subscription, Tax } from '../types';
export const mockProducts: Product[] = [];
export const mockPlans: Plan[] = [];
export const mockCustomers: Customer[] = [];
export const mockSubscriptions: Subscription[] = [];
export const mockInvoices: Invoice[] = [];
export const mockPayments: Payment[] = [];
export const mockStaff: StaffMember[] = [];
export const mockDiscounts: Discount[] = [];
export const mockTaxes: Tax[] = [];
export const mockTemplates: QuotationTemplate[] = [];
export function replace<T>(target: T[], values: T[]) { target.splice(0, target.length, ...values); }
