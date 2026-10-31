import { Product, Plan, Customer, Subscription, Invoice, Payment, StaffMember, Discount, Tax, QuotationTemplate } from '../types';

export const mockProducts: Product[] = [
  { id: 'p1', name: 'Platform Access', type: 'Digital service', salesPrice: 199, costPrice: 30, notes: 'Core platform subscription.', variants: [{ id: 'pv1', attribute: 'Tier', value: 'Basic', extraPrice: 0 }, { id: 'pv2', attribute: 'Tier', value: 'Pro', extraPrice: 80 }], status: 'Active' },
  { id: 'p2', name: 'Priority Support', type: 'Add-on', salesPrice: 49, costPrice: 10, notes: '24/7 dedicated support team.', variants: [], status: 'Active' },
  { id: 'p3', name: 'Onboarding Package', type: 'One-time', salesPrice: 1200, costPrice: 250, notes: 'Onboarding + training sessions.', variants: [{ id: 'pv3', attribute: 'Sessions', value: '3', extraPrice: 0 }, { id: 'pv4', attribute: 'Sessions', value: '6', extraPrice: 600 }], status: 'Active' },
  { id: 'p4', name: 'Analytics Add-on', type: 'Add-on', salesPrice: 79, costPrice: 15, notes: 'Advanced analytics dashboard.', variants: [], status: 'Active' },
  { id: 'p5', name: 'Storage Expansion', type: 'Add-on', salesPrice: 29, costPrice: 5, notes: 'Extra 100GB storage per user.', variants: [], status: 'Inactive' },
];

export const mockPlans: Plan[] = [
  { id: 'pl1', name: 'Enterprise Annual', price: 12400, billingPeriod: 'Annual', minQty: 1, availableFrom: '2024-01-01', availableUntil: '2026-12-31', closeAuto: true, allowEarlyClose: true, allowPause: true, allowRenew: true, status: 'Active' },
  { id: 'pl2', name: 'Growth Monthly', price: 400, billingPeriod: 'Monthly', minQty: 1, availableFrom: '2024-01-01', availableUntil: '2026-12-31', closeAuto: false, allowEarlyClose: true, allowPause: true, allowRenew: true, status: 'Active' },
  { id: 'pl3', name: 'Starter Monthly', price: 99, billingPeriod: 'Monthly', minQty: 1, availableFrom: '2024-06-01', availableUntil: '2026-12-31', closeAuto: false, allowEarlyClose: false, allowPause: false, allowRenew: true, status: 'Active' },
  { id: 'pl4', name: 'Team Quarterly', price: 1200, billingPeriod: 'Quarterly', minQty: 5, availableFrom: '2024-03-01', availableUntil: '2026-12-31', closeAuto: true, allowEarlyClose: true, allowPause: true, allowRenew: true, status: 'Inactive' },
];

export const mockCustomers: Customer[] = [
  { id: 'c1', name: 'Acme Corporation', email: 'finance@acme.co', phone: '+1 (555) 100-2000', billingAddress: '123 Main St, San Francisco, CA 94105', activeSubscriptions: 3, outstandingAmount: 4800, status: 'Active', createdAt: '2023-01-15' },
  { id: 'c2', name: 'Northstar Labs', email: 'ops@northstar.io', phone: '+1 (555) 200-3000', billingAddress: '456 Tech Ave, Austin, TX 78701', activeSubscriptions: 1, outstandingAmount: 0, status: 'Active', createdAt: '2023-04-22' },
  { id: 'c3', name: 'Orbit Systems', email: 'hello@orbit.dev', phone: '+1 (555) 300-4000', billingAddress: '789 Innovation Dr, Seattle, WA 98101', activeSubscriptions: 1, outstandingAmount: 0, status: 'Active', createdAt: '2023-07-10' },
  { id: 'c4', name: 'Vertex Studio', email: 'billing@vertex.studio', phone: '+1 (555) 400-5000', billingAddress: '321 Creative Blvd, NYC, NY 10001', activeSubscriptions: 1, outstandingAmount: 4800, status: 'Active', createdAt: '2023-02-28' },
  { id: 'c5', name: 'Morrow & Co.', email: 'team@morrow.co', phone: '+1 (555) 500-6000', billingAddress: '654 Business Rd, Chicago, IL 60601', activeSubscriptions: 1, outstandingAmount: 0, status: 'Active', createdAt: '2024-01-05' },
  { id: 'c6', name: 'Pinnacle Tech', email: 'billing@pinnacle.tech', phone: '+1 (555) 600-7000', billingAddress: '987 Enterprise Way, Boston, MA 02101', activeSubscriptions: 2, outstandingAmount: 0, status: 'Active', createdAt: '2023-11-12' },
];

export const mockSubscriptions: Subscription[] = [
  { id: 's1', number: 'SUB-0001', customerId: 'c1', customerName: 'Acme Corporation', planId: 'pl1', planName: 'Enterprise Annual', startDate: '2024-03-24', expiryDate: '2025-03-24', nextBillingDate: '2025-03-24', paymentTerms: 'Net 30', status: 'Active', lines: [{ id: 'sl1', product: 'Platform Access (Pro)', qty: 50, unitPrice: 199, taxIds: ['t1'], amount: 9950 }, { id: 'sl2', product: 'Priority Support', qty: 1, unitPrice: 2450, taxIds: ['t1'], amount: 2450 }], total: 12400 },
  { id: 's2', number: 'SUB-0002', customerId: 'c2', customerName: 'Northstar Labs', planId: 'pl2', planName: 'Growth Monthly', startDate: '2024-02-12', expiryDate: '2025-02-12', nextBillingDate: '2025-03-12', paymentTerms: 'Net 15', status: 'Active', lines: [{ id: 'sl3', product: 'Platform Access (Basic)', qty: 25, unitPrice: 199, taxIds: ['t1'], amount: 4975 }], total: 4800 },
  { id: 's3', number: 'SUB-0003', customerId: 'c3', customerName: 'Orbit Systems', planId: 'pl3', planName: 'Starter Monthly', startDate: '2025-02-04', expiryDate: '2026-02-04', nextBillingDate: '2025-03-04', paymentTerms: 'Net 30', status: 'Active', lines: [{ id: 'sl4', product: 'Platform Access (Basic)', qty: 5, unitPrice: 199, taxIds: [], amount: 995 }], total: 990 },
  { id: 's4', number: 'SUB-0004', customerId: 'c4', customerName: 'Vertex Studio', planId: 'pl2', planName: 'Growth Monthly', startDate: '2024-01-22', expiryDate: '2025-01-22', nextBillingDate: '2025-02-22', paymentTerms: 'Net 15', status: 'Active', lines: [{ id: 'sl5', product: 'Platform Access (Pro)', qty: 20, unitPrice: 240, taxIds: ['t1'], amount: 4800 }], total: 4800 },
  { id: 's5', number: 'SUB-0005', customerId: 'c5', customerName: 'Morrow & Co.', planId: 'pl3', planName: 'Starter Monthly', startDate: '2024-12-05', expiryDate: '2025-12-05', nextBillingDate: '2025-03-05', paymentTerms: 'Net 30', status: 'Active', lines: [{ id: 'sl6', product: 'Platform Access (Basic)', qty: 5, unitPrice: 199, taxIds: [], amount: 995 }], total: 990 },
  { id: 's6', number: 'SUB-0006', customerId: 'c6', customerName: 'Pinnacle Tech', planId: 'pl2', planName: 'Growth Monthly', startDate: '2024-11-01', expiryDate: '2025-11-01', nextBillingDate: '2025-03-01', paymentTerms: 'Net 30', status: 'Paused', lines: [{ id: 'sl7', product: 'Platform Access (Pro)', qty: 15, unitPrice: 320, taxIds: ['t1'], amount: 4800 }], total: 4800 },
  { id: 's7', number: 'SUB-0007', customerId: 'c1', customerName: 'Acme Corporation', planId: 'pl3', planName: 'Starter Monthly', startDate: '2023-06-01', expiryDate: '2024-06-01', nextBillingDate: '—', paymentTerms: 'Net 30', status: 'Closed', lines: [{ id: 'sl8', product: 'Analytics Add-on', qty: 1, unitPrice: 79, taxIds: [], amount: 79 }], total: 990 },
  { id: 's8', number: 'SUB-0008', customerId: 'c2', customerName: 'Northstar Labs', planId: 'pl3', planName: 'Starter Monthly', startDate: '2025-02-20', expiryDate: '2026-02-20', nextBillingDate: '2025-03-20', paymentTerms: 'Net 30', status: 'Quotation', lines: [], total: 0 },
];

export const mockInvoices: Invoice[] = [
  { id: 'i1', number: 'INV-0001', customerId: 'c1', customerName: 'Acme Corporation', subscriptionId: 's1', issueDate: '2025-02-24', dueDate: '2025-03-24', lines: [{ id: 'il1', description: 'Platform Access (Pro) x50', qty: 50, unitPrice: 199, taxRate: 8, amount: 9950 }, { id: 'il2', description: 'Priority Support', qty: 1, unitPrice: 2450, taxRate: 8, amount: 2450 }], subtotal: 12400, taxAmount: 992, discountAmount: 0, total: 13392, paid: 13392, balance: 0, status: 'Paid' },
  { id: 'i2', number: 'INV-0002', customerId: 'c2', customerName: 'Northstar Labs', subscriptionId: 's2', issueDate: '2025-02-12', dueDate: '2025-03-12', lines: [{ id: 'il3', description: 'Platform Access (Basic) x25', qty: 25, unitPrice: 199, taxRate: 8, amount: 4975 }], subtotal: 4800, taxAmount: 384, discountAmount: 0, total: 5184, paid: 0, balance: 5184, status: 'Confirmed' },
  { id: 'i3', number: 'INV-0003', customerId: 'c4', customerName: 'Vertex Studio', subscriptionId: 's4', issueDate: '2025-01-22', dueDate: '2025-02-22', lines: [{ id: 'il4', description: 'Platform Access (Pro) x20', qty: 20, unitPrice: 240, taxRate: 8, amount: 4800 }], subtotal: 4800, taxAmount: 384, discountAmount: 0, total: 5184, paid: 0, balance: 5184, status: 'Overdue' },
  { id: 'i4', number: 'INV-0004', customerId: 'c5', customerName: 'Morrow & Co.', subscriptionId: 's5', issueDate: '2025-02-05', dueDate: '2025-03-05', lines: [{ id: 'il5', description: 'Platform Access (Basic) x5', qty: 5, unitPrice: 199, taxRate: 0, amount: 995 }], subtotal: 990, taxAmount: 0, discountAmount: 0, total: 990, paid: 990, balance: 0, status: 'Paid' },
  { id: 'i5', number: 'INV-0005', customerId: 'c3', customerName: 'Orbit Systems', subscriptionId: 's3', issueDate: '2025-02-04', dueDate: '2025-03-04', lines: [{ id: 'il6', description: 'Platform Access (Basic) x5', qty: 5, unitPrice: 199, taxRate: 0, amount: 995 }], subtotal: 990, taxAmount: 0, discountAmount: 0, total: 990, paid: 0, balance: 990, status: 'Confirmed' },
  { id: 'i6', number: 'INV-0006', customerId: 'c6', customerName: 'Pinnacle Tech', subscriptionId: 's6', issueDate: '2025-01-01', dueDate: '2025-01-31', lines: [{ id: 'il7', description: 'Growth Monthly x15', qty: 15, unitPrice: 320, taxRate: 8, amount: 4800 }], subtotal: 4800, taxAmount: 384, discountAmount: 0, total: 5184, paid: 0, balance: 5184, status: 'Overdue' },
];

export const mockPayments: Payment[] = [
  { id: 'pay1', invoiceId: 'i1', invoiceNumber: 'INV-0001', customerId: 'c1', customerName: 'Acme Corporation', method: 'Card', amount: 13392, date: '2025-02-25', note: 'Annual payment received via Visa 4242' },
  { id: 'pay2', invoiceId: 'i4', invoiceNumber: 'INV-0004', customerId: 'c5', customerName: 'Morrow & Co.', method: 'Bank Transfer', amount: 990, date: '2025-02-08', note: 'Wire transfer confirmed' },
  { id: 'pay3', invoiceId: 'i5', invoiceNumber: 'INV-0005', customerId: 'c3', customerName: 'Orbit Systems', method: 'UPI', amount: 500, date: '2025-02-10', note: 'Partial payment' },
];

export const mockStaff: StaffMember[] = [
  { id: 'st1', name: 'Alex Morgan', email: 'admin@unio.com', role: 'Administrator', status: 'Active', lastActive: 'Just now' },
  { id: 'st2', name: 'Priya Shah', email: 'staff@unio.com', role: 'Billing Manager', status: 'Active', lastActive: '2 hours ago' },
  { id: 'st3', name: 'Noah Williams', email: 'noah@unio.com', role: 'Sales Staff', status: 'Active', lastActive: 'Yesterday' },
  { id: 'st4', name: 'Sara Chen', email: 'sara@unio.com', role: 'Support Staff', status: 'Active', lastActive: '3 days ago' },
  { id: 'st5', name: 'James Park', email: 'james@unio.com', role: 'Sales Staff', status: 'Inactive', lastActive: '2 weeks ago' },
];

export const mockDiscounts: Discount[] = [
  { id: 'd1', name: 'Annual Commitment', type: 'Percentage', value: 15, minPurchase: 0, minQty: 1, startDate: '2024-01-01', endDate: '2026-12-31', usageLimit: 0, usageCount: 12, appliesTo: 'Annual Plans', status: 'Active' },
  { id: 'd2', name: 'Launch Offer', type: 'Percentage', value: 20, minPurchase: 0, minQty: 1, startDate: '2024-06-01', endDate: '2024-12-31', usageLimit: 100, usageCount: 100, appliesTo: 'All Plans', status: 'Exhausted' },
  { id: 'd3', name: 'Q1 Promo', type: 'Fixed', value: 500, minPurchase: 2000, minQty: 5, startDate: '2025-01-01', endDate: '2025-03-31', usageLimit: 50, usageCount: 23, appliesTo: 'Enterprise Plans', status: 'Active' },
  { id: 'd4', name: 'Summer Sale', type: 'Percentage', value: 10, minPurchase: 0, minQty: 1, startDate: '2025-06-01', endDate: '2025-08-31', usageLimit: 200, usageCount: 0, appliesTo: 'All Products', status: 'Scheduled' },
];

export const mockTaxes: Tax[] = [
  { id: 't1', name: 'US Standard', rate: 8.25, appliesTo: 'All Products', active: true },
  { id: 't2', name: 'EU VAT', rate: 20, appliesTo: 'EU Customers', active: true },
  { id: 't3', name: 'CA GST', rate: 5, appliesTo: 'Canadian Customers', active: true },
  { id: 't4', name: 'UK VAT', rate: 20, appliesTo: 'UK Customers', active: false },
];

export const mockTemplates: QuotationTemplate[] = [
  { id: 'qt1', name: 'Enterprise Annual Template', validityDays: 30, planId: 'pl1', lines: [{ id: 'qtl1', product: 'Platform Access', variant: 'Pro', qty: 50 }, { id: 'qtl2', product: 'Priority Support', variant: '', qty: 1 }] },
  { id: 'qt2', name: 'Growth Monthly Template', validityDays: 15, planId: 'pl2', lines: [{ id: 'qtl3', product: 'Platform Access', variant: 'Basic', qty: 25 }] },
  { id: 'qt3', name: 'Starter Onboarding', validityDays: 7, planId: 'pl3', lines: [{ id: 'qtl4', product: 'Platform Access', variant: 'Basic', qty: 5 }, { id: 'qtl5', product: 'Onboarding Package', variant: '3 Sessions', qty: 1 }] },
];

