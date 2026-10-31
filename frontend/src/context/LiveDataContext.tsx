import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { get, type ApiPage } from '../lib/api';
import { useAuth } from './AuthContext';
import { mockCustomers, mockDiscounts, mockInvoices, mockPayments, mockPlans, mockProducts, mockStaff, mockSubscriptions, mockTaxes, mockTemplates, replace } from '../data/mockData';

type Raw = Record<string, any>;
const num = (v: unknown) => Number(v ?? 0);
const date = (v: unknown) => v ? String(v).slice(0, 10) : '';
const title = (v: string) => v.charAt(0) + v.slice(1).toLowerCase();
const product = (p: Raw) => ({ ...p, salesPrice: num(p.salesPrice), costPrice: num(p.costPrice), notes: p.notes ?? '', status: p.isActive ? 'Active' : 'Inactive' });
const plan = (p: Raw) => ({ id:p.id, name:p.name, price:num(p.price), billingPeriod:title(p.billingPeriod), minQty:p.minQuantity, availableFrom:date(p.availableFrom), availableUntil:date(p.availableTo), closeAuto:p.autoCloseOnEnd, allowEarlyClose:p.allowEarlyClose, allowPause:p.allowPause, allowRenew:p.allowRenew, status:p.isActive ? 'Active' : 'Inactive' });
const customer = (c: Raw) => ({ id:c.id, name:c.name, email:c.email, phone:c.phone ?? '', billingAddress:c.address ?? '', activeSubscriptions:0, outstandingAmount:0, status:'Active' as const, createdAt:'' });
const subscription = (s: Raw) => ({ id:s.id, number:s.number, customerId:s.customerId, customerName:s.customer?.name ?? '', planId:s.planId, planName:s.plan?.name ?? '', startDate:date(s.startDate), expiryDate:date(s.expiryDate), nextBillingDate:date(s.nextBillingDate), paymentTerms:s.paymentTerms ?? '', status:title(s.status), lines:(s.lines ?? []).map((l: Raw) => ({ id:l.id, product:l.product?.name ?? l.productId, qty:l.quantity, unitPrice:num(l.unitPrice), taxIds:l.taxId ? [l.taxId] : [], amount:num(l.quantity)*num(l.unitPrice) })), total:(s.lines ?? []).reduce((x:number,l:Raw)=>x+num(l.quantity)*num(l.unitPrice),0) });
const invoice = (i: Raw) => ({ id:i.id, number:i.number, customerId:i.customerId, customerName:i.customerName, subscriptionId:i.subscriptionId, issueDate:date(i.issueDate), dueDate:date(i.dueDate), lines:(i.lines ?? []).map((l:Raw)=>({id:l.id,description:l.description,qty:l.quantity,unitPrice:num(l.unitPrice),taxRate:num(l.taxRate),amount:num(l.lineTotal)})), subtotal:num(i.subtotal), taxAmount:num(i.taxTotal), discountAmount:num(i.discountTotal), total:num(i.total), paid:num(i.amountPaid), balance:num(i.total)-num(i.amountPaid), status:title(i.status) });
const payment = (p:Raw) => ({id:p.id,invoiceId:p.invoiceId,invoiceNumber:p.invoice?.number ?? '',customerId:p.invoice?.customerId ?? '',customerName:'',method:title(p.method).replace('_',' '),amount:num(p.amount),date:date(p.paidAt),note:p.note ?? ''});
const discount = (d:Raw) => ({id:d.id,name:d.name,type:d.type==='PERCENT'?'Percentage':'Fixed',value:num(d.value),minPurchase:num(d.minPurchase),minQty:d.minQuantity??0,startDate:date(d.startDate),endDate:date(d.endDate),usageLimit:d.usageLimit,usageCount:d.usedCount,appliesTo:d.scope,status:d.isActive?'Active':'Expired'});
const tax = (t:Raw) => ({id:t.id,name:t.name,rate:num(t.ratePercent),appliesTo:'',active:t.isActive});
const template = (t:Raw) => ({id:t.id,name:t.name,validityDays:t.validityDays,planId:t.planId,lines:(t.lines??[]).map((l:Raw)=>({id:l.id,product:l.productId,variant:l.variantId??'',qty:l.quantity}))});
const staff = (u:Raw) => ({id:u.id,name:u.name,email:u.email,role:'Staff',status:u.isActive?'Active':'Inactive',lastActive:''});
type LiveData = { version:number; loading:boolean; error:string|null; reload:()=>Promise<void> };
const Context = createContext<LiveData | null>(null);
const page = <T,>(path:string) => get<ApiPage<T>>(`${path}${path.includes('?')?'&':'?'}take=100`).then(r=>r.data);

export function LiveDataProvider({children}:{children:ReactNode}) {
 const {user,isLoading:authLoading}=useAuth(); const [version,setVersion]=useState(0); const [loading,setLoading]=useState(false); const [error,setError]=useState<string|null>(null);
 const reload=async()=>{ if(!user)return; setLoading(true);setError(null);try { if(user.role==='CUSTOMER'){const [s,i]=await Promise.all([page<Raw>('/portal/subscriptions'),page<Raw>('/portal/invoices')]);replace(mockSubscriptions,s.map(subscription));replace(mockInvoices,i.map(invoice));replace(mockProducts,[]);replace(mockPlans,[]);replace(mockCustomers,[]);replace(mockPayments,[]);replace(mockStaff,[]);replace(mockDiscounts,[]);replace(mockTaxes,[]);replace(mockTemplates,[]);}else{const req:Promise<Raw[]>[]=[page('/products'),page('/plans'),page('/customers'),page('/subscriptions'),page('/invoices'),page('/payments')];if(user.role==='ADMIN')req.push(page('/discounts'),page('/taxes'),page('/templates'),page('/users/staff'));const r=await Promise.all(req);replace(mockProducts,r[0].map(product));replace(mockPlans,r[1].map(plan));replace(mockCustomers,r[2].map(customer));replace(mockSubscriptions,r[3].map(subscription));replace(mockInvoices,r[4].map(invoice));replace(mockPayments,r[5].map(payment));replace(mockDiscounts,(r[6]??[]).map(discount));replace(mockTaxes,(r[7]??[]).map(tax));replace(mockTemplates,(r[8]??[]).map(template));replace(mockStaff,(r[9]??[]).map(staff));}setVersion(v=>v+1);}catch(e){setError(e instanceof Error?e.message:'Unable to load data');}finally{setLoading(false);}};
 useEffect(()=>{if(!authLoading&&user)void reload();},[authLoading,user?.id]);
 return <Context.Provider value={{version,loading,error,reload}}>{children}</Context.Provider>;
}
export function useLiveData(){const value=useContext(Context);if(!value)throw new Error('useLiveData must be used inside LiveDataProvider');return value;}
