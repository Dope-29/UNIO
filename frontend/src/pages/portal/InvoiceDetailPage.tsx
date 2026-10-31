import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PortalLayout from '../../components/Layout/PortalLayout';
import Badge from '../../components/common/Badge';
import { mockInvoices } from '../../data/mockData';
import { ArrowLeft, Download, CreditCard, Printer, CheckCircle } from 'lucide-react';

export default function InvoiceDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Find invoice belonging to customer
  const inv = mockInvoices.find((i) => i.id === id) || mockInvoices[0];

  return (
    <PortalLayout title={`Invoice ${inv.number}`}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onClick={() => navigate('/user/portal/invoices')}
        >
          <ArrowLeft size={16} /> Back to Invoices
        </button>

        {/* Action Bar */}
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
                Issued {inv.issueDate} · Due {inv.dueDate}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => window.print()}
              >
                <Download size={14} /> Download PDF
              </button>

              {inv.balance > 0 && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/user/portal/payment?invoice=${inv.id}`)}
                >
                  <CreditCard size={14} /> Pay Now (${inv.balance.toLocaleString()})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Statement Box */}
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
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
                Customer Account
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>
                {inv.customerName}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                Billing Address: 123 Enterprise Park, Suite 400<br />
                San Francisco, CA 94105
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Outstanding Amount
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: inv.balance === 0 ? 'var(--success)' : 'var(--danger)' }}>
                {inv.balance === 0 ? 'PAID IN FULL' : `$${inv.balance.toLocaleString()} DUE`}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                Payment terms: Net 30
              </div>
            </div>
          </div>

          <table className="table" style={{ width: '100%', marginBottom: 24 }}>
            <thead>
              <tr>
                <th style={{ width: '50%' }}>Description</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Unit Price</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {inv.lines.map((l) => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 500 }}>{l.description}</td>
                  <td style={{ textAlign: 'center' }}>{l.qty}</td>
                  <td style={{ textAlign: 'right' }}>${l.unitPrice.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>${l.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
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
                <span>Amount Paid:</span>
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
    </PortalLayout>
  );
}

