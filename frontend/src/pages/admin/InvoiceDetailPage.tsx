import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import Badge from '../../components/common/Badge';
import { mockInvoices } from '../../data/mockData';
import {
  ArrowLeft, CheckCircle, XCircle, Send, Printer, DollarSign,
} from 'lucide-react';

export default function InvoiceDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const initialInv = mockInvoices.find((i) => i.id === id) || mockInvoices[0];
  const [inv, setInv] = useState(initialInv);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleConfirm = () => {
    setInv({ ...inv, status: 'Confirmed' });
    showNotify('Invoice confirmed and locked for payments.');
  };

  const handleCancel = () => {
    if (window.confirm('Cancel this invoice?')) {
      setInv({ ...inv, status: 'Cancelled' });
      showNotify('Invoice marked as Cancelled.');
    }
  };

  const handleSend = () => {
    showNotify(`Invoice PDF dispatched to customer email.`);
  };

  return (
    <AdminLayout title={`Invoice ${inv.number}`}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onClick={() => navigate('/user/admin/invoices')}
        >
          <ArrowLeft size={16} /> Back to Invoices
        </button>

        {notification && (
          <div
            style={{
              marginBottom: 16,
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(220, 252, 124, 0.15)',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <CheckCircle size={16} />
            <span>{notification}</span>
          </div>
        )}

        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{inv.number}</h1>
                <Badge status={inv.status} />
              </div>
              <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: 13 }}>
                Linked to contract {inv.subscriptionId} · Issued {inv.issueDate}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {inv.status === 'Draft' && (
                <button className="btn btn-primary btn-sm" onClick={handleConfirm}>
                  <CheckCircle size={14} /> Confirm Invoice
                </button>
              )}

              {(inv.status === 'Draft' || (inv.status === 'Confirmed' && inv.paid === 0)) && (
                <button className="btn btn-danger btn-sm" onClick={handleCancel}>
                  <XCircle size={14} /> Cancel
                </button>
              )}

              <button className="btn btn-secondary btn-sm" onClick={handleSend}>
                <Send size={14} /> Send PDF
              </button>

              <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                <Printer size={14} /> Print
              </button>

              {inv.balance > 0 && inv.status !== 'Cancelled' && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() =>
                    navigate(`/user/admin/payments/record?invoice=${inv.id}`)
                  }
                >
                  <DollarSign size={14} /> Record Payment
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 32, marginBottom: 24 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 32,
              paddingBottom: 24,
              borderBottom: '1px solid var(--border)',
              marginBottom: 24,
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Billed To
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>
                {inv.customerName}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                123 Enterprise Park, Suite 400<br />
                San Francisco, CA 94105
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Payment Status
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: inv.balance === 0 ? 'var(--success)' : 'var(--danger)' }}>
                {inv.balance === 0 ? 'FULLY PAID' : `$${inv.balance.toLocaleString()} BALANCE DUE`}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                Due Date: <strong style={{ color: 'var(--text-primary)' }}>{inv.dueDate}</strong>
              </div>
            </div>
          </div>

          <table className="table" style={{ width: '100%', marginBottom: 24 }}>
            <thead>
              <tr>
                <th style={{ width: '45%' }}>Description</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Unit Price</th>
                <th style={{ textAlign: 'right' }}>Tax Rate</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {inv.lines.map((line) => (
                <tr key={line.id}>
                  <td style={{ fontWeight: 500 }}>{line.description}</td>
                  <td style={{ textAlign: 'center' }}>{line.qty}</td>
                  <td style={{ textAlign: 'right' }}>${line.unitPrice.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>{line.taxRate}%</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    ${line.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Untaxed Subtotal:</span>
                <span>${inv.subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Taxes:</span>
                <span>${inv.taxAmount.toLocaleString()}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 16,
                  fontWeight: 700,
                  paddingTop: 8,
                  borderTop: '1px solid var(--border)',
                }}
              >
                <span>Total Amount:</span>
                <span style={{ color: 'var(--accent)' }}>${inv.total.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--success)' }}>
                <span>Paid to Date:</span>
                <span>-${inv.paid.toLocaleString()}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 15,
                  fontWeight: 800,
                  paddingTop: 8,
                  borderTop: '1px dashed var(--border)',
                  color: inv.balance > 0 ? 'var(--danger)' : 'var(--success)',
                }}
              >
                <span>Balance Due:</span>
                <span>${inv.balance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

