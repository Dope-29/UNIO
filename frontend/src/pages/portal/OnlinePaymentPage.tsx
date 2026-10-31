import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PortalLayout from '../../components/Layout/PortalLayout';
import { post, messageFrom } from '../../lib/api';
import { useApiItem } from '../../hooks/useApi';

type Invoice = { id: string; number: string; total: string; amountPaid: string; currency: string; status: string };
type Order = { orderId: string; keyId: string; amount: number; currency: string };
declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => { open(): void } } }

function loadCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load the payment gateway.'));
    document.head.appendChild(script);
  });
}

export default function OnlinePaymentPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const id = params.get('invoice');
  const { data: invoice, loading, error } = useApiItem<Invoice>(`/portal/invoices/${encodeURIComponent(id ?? '')}`, !!id);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const pay = async () => {
    if (!invoice) return;
    setBusy(true); setMessage('');
    try {
      await loadCheckout();
      const { data } = await post<{ data: Order }>(`/portal/invoices/${encodeURIComponent(invoice.id)}/pay-order`);
      if (!window.Razorpay) throw new Error('Unable to load the payment gateway.');
      new window.Razorpay({ key: data.keyId, order_id: data.orderId, amount: data.amount, currency: data.currency,
        handler: () => setMessage('Payment submitted. The invoice updates after the payment provider confirms it.'),
        modal: { ondismiss: () => setBusy(false) },
      }).open();
    } catch (err) { setMessage(messageFrom(err)); }
    finally { setBusy(false); }
  };
  return <PortalLayout title="Online Checkout"><div className="card" style={{ padding: 24, maxWidth: 560 }}>
    <button className="btn btn-secondary" onClick={() => navigate('/user/portal/invoices')}>Back to invoices</button>
    {!id && <p>Select an invoice to make a payment.</p>}
    {loading && <p>Loading invoice…</p>}
    {error && <p className="form-error">{error}</p>}
    {invoice && <><h2>{invoice.number}</h2><p>Balance: {invoice.currency} {(Number(invoice.total) - Number(invoice.amountPaid)).toFixed(2)}</p>
      <button className="btn btn-primary" disabled={busy || invoice.status !== 'CONFIRMED'} onClick={() => void pay()}>Pay online</button></>}
    {message && <p role="status">{message}</p>}
  </div></PortalLayout>;
}
