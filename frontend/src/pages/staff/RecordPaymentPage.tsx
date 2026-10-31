import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StaffLayout from '../../components/Layout/StaffLayout';
import { mockInvoices } from '../../data/mockData';
import { PaymentMethod } from '../../types';
import { ArrowLeft, Check, DollarSign } from 'lucide-react';

export default function RecordPaymentPage({ basePath = '/user/staff' }: { basePath?: string }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('invoice') || mockInvoices[1]?.id;

  const invoice = mockInvoices.find((i) => i.id === invoiceId) || mockInvoices[1];

  const [method, setMethod] = useState<PaymentMethod>('Bank Transfer');
  const [amount, setAmount] = useState<number>(invoice?.balance || 5184);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('Payment settlement received via wire transfer');
  const [error, setError] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }
    if (amount > invoice.balance) {
      setError(`Payment cannot exceed outstanding balance of $${invoice.balance.toLocaleString()}.`);
      return;
    }

    // In a real database this would deduct from balance & mark Paid if balance reaches 0
    navigate(`${basePath}/invoices/${invoice.id}`);
  };

  return (
    <StaffLayout title="Record Payment">
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onClick={() => navigate(`${basePath}/invoices/${invoice.id}`)}
        >
          <ArrowLeft size={16} /> Back to Invoice
        </button>

        <div className="page-header" style={{ marginBottom: 20 }}>
          <div>
            <h1 className="page-title">Record Payment</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 14 }}>
              Register incoming remittance against invoice <strong>{invoice.number}</strong>.
            </p>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 85, 85, 0.15)',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            {/* Invoice summary info box */}
            <div
              style={{
                padding: 16,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                marginBottom: 20,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Customer
                </span>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{invoice.customerName}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Current Outstanding
                </span>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--danger)' }}>
                  ${invoice.balance.toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  className="select"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                >
                  <option value="Bank Transfer">Bank Transfer / Wire</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="UPI">UPI / Instant Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Amount ($)</label>
                <input
                  type="number"
                  className="input"
                  min={1}
                  max={invoice.balance}
                  required
                  value={amount}
                  onChange={(e) => {
                    setError(null);
                    setAmount(Number(e.target.value));
                  }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Maximum allowable payment for this invoice: ${invoice.balance.toLocaleString()}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Received Date</label>
                <input
                  type="date"
                  className="input"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Internal Note / Transaction ID</label>
                <textarea
                  className="input"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Reference #TXN-98432 from Bank of America..."
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`${basePath}/invoices/${invoice.id}`)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} /> Save Payment
            </button>
          </div>
        </form>
      </div>
    </StaffLayout>
  );
}

