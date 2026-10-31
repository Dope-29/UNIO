import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PortalLayout from '../../components/Layout/PortalLayout';
import { mockInvoices } from '../../data/mockData';
import {
  CreditCard, ShieldCheck, CheckCircle2, Lock, ArrowLeft,
  Smartphone,
} from 'lucide-react';

export default function OnlinePaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('invoice') || mockInvoices[0]?.id;

  const invoice = mockInvoices.find((i) => i.id === invoiceId) || mockInvoices[0];

  const [method, setMethod] = useState<'card' | 'upi'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [upiId, setUpiId] = useState('finance@okhdfcbank');

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment gateway processing & webhook callback
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/user/portal/invoices/${invoice.id}`);
      }, 2000);
    }, 1500);
  };

  return (
    <PortalLayout title="Online Checkout">
      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onClick={() => navigate(`/user/portal/invoices/${invoice.id}`)}
        >
          <ArrowLeft size={16} /> Cancel and return to invoice
        </button>

        {/* Test Gateway Banner */}
        <div
          style={{
            marginBottom: 20,
            padding: '10px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 184, 77, 0.1)',
            border: '1px solid rgba(255, 184, 77, 0.3)',
            color: 'var(--warning)',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <ShieldCheck size={16} />
          <span>Payment Gateway in <strong>TEST SANDBOX MODE</strong>. No real funds will be charged.</span>
        </div>

        {success ? (
          <div className="card" style={{ padding: 36, textAlign: 'center' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(220, 252, 124, 0.2)',
                color: 'var(--accent)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Payment Succeeded!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
              Transaction ID <strong>TXN-SANDBOX-78491</strong> confirmed.<br />
              Updating invoice status to Paid and redirecting...
            </p>
          </div>
        ) : (
          <form onSubmit={handlePay}>
            <div className="card" style={{ padding: 28, marginBottom: 20 }}>
              {/* Checkout Summary */}
              <div
                style={{
                  paddingBottom: 20,
                  borderBottom: '1px solid var(--border)',
                  marginBottom: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Paying Invoice
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>
                    {invoice.number}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Amount Due
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>
                    ${invoice.balance.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <button
                  type="button"
                  className={`btn ${method === 'card' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center' }}
                  onClick={() => setMethod('card')}
                >
                  <CreditCard size={16} /> Credit / Debit Card
                </button>
                <button
                  type="button"
                  className={`btn ${method === 'upi' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center' }}
                  onClick={() => setMethod('upi')}
                >
                  <Smartphone size={16} /> UPI / QR
                </button>
              </div>

              {method === 'card' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Test Card Number</label>
                    <input
                      className="input"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Expires</label>
                      <input
                        className="input"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVC</label>
                      <input
                        className="input"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Virtual Payment Address (VPA)</label>
                  <input
                    className="input"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@okhdfcbank"
                    required
                  />
                </div>
              )}

              <div
                style={{
                  marginTop: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  color: 'var(--text-muted)',
                }}
              >
                <Lock size={13} />
                <span>256-bit encrypted test checkout session.</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: 15 }}
              disabled={processing}
            >
              {processing ? (
                'Processing simulated checkout...'
              ) : (
                `Complete Test Payment of $${invoice.balance.toLocaleString()}`
              )}
            </button>
          </form>
        )}
      </div>
    </PortalLayout>
  );
}

