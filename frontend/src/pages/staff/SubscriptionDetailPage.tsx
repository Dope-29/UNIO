import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StaffLayout from '../../components/Layout/StaffLayout';
import Badge from '../../components/common/Badge';
import { mockSubscriptions, mockPlans } from '../../data/mockData';
import { SubscriptionStatus } from '../../types';
import {
  ArrowLeft, Send, CheckCircle2, Zap, XCircle, Pause, Play,
  RefreshCw, FileText, Printer, Calendar, Clock, DollarSign,
} from 'lucide-react';

export default function SubscriptionDetailPage({ basePath = '/user/staff' }: { basePath?: string }) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const initialSub = mockSubscriptions.find((s) => s.id === id) || mockSubscriptions[0];
  const [sub, setSub] = useState(initialSub);
  const plan = mockPlans.find((p) => p.id === sub.planId) || mockPlans[0];

  const [notification, setNotification] = useState<string | null>(null);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Status progression states
  const stages: SubscriptionStatus[] = ['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed'];
  const currentStageIndex = stages.indexOf(
    sub.status === 'Paused' ? 'Active' : sub.status
  );

  const handleSendQuotation = () => {
    setSub({ ...sub, status: 'Quotation' });
    showNotify('Quotation email sent with PDF proposal attached.');
  };

  const handleConfirm = () => {
    setSub({ ...sub, status: 'Confirmed' });
    showNotify('Quotation confirmed by customer.');
  };

  const handleActivate = () => {
    setSub({ ...sub, status: 'Active', nextBillingDate: '2025-04-24' });
    showNotify('Subscription activated! Next billing schedule has been armed.');
  };

  const handleTogglePause = () => {
    const nextStatus = sub.status === 'Paused' ? 'Active' : 'Paused';
    setSub({ ...sub, status: nextStatus });
    showNotify(
      nextStatus === 'Paused'
        ? 'Subscription paused. Automated billing is skipped.'
        : 'Subscription resumed. Billing schedule reinstated.'
    );
  };

  const handleRenew = () => {
    setSub({ ...sub, expiryDate: '2027-03-24' });
    showNotify('Subscription renewed! Extended expiry to March 24, 2027.');
  };

  const handleClose = () => {
    if (window.confirm('Are you sure you want to close this subscription?')) {
      setSub({ ...sub, status: 'Closed' });
      showNotify('Subscription closed.');
    }
  };

  const handleCreateInvoiceNow = () => {
    navigate(`${basePath}/invoices/i1`);
  };

  return (
    <StaffLayout title={`Subscription ${sub.number}`}>
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onClick={() => navigate(`${basePath}/subscriptions`)}
        >
          <ArrowLeft size={16} /> Back to Subscriptions
        </button>

        {/* Notifications */}
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
            <CheckCircle2 size={16} />
            <span>{notification}</span>
          </div>
        )}

        {/* Header and Lifecycle Actions */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{sub.number}</h1>
                <Badge status={sub.status} />
              </div>
              <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: 14 }}>
                Customer: <strong style={{ color: 'var(--text-primary)' }}>{sub.customerName}</strong> · Plan: {sub.planName}
              </p>
            </div>

            {/* Action Buttons based on status */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {sub.status === 'Draft' && (
                <button className="btn btn-primary btn-sm" onClick={handleSendQuotation}>
                  <Send size={14} /> Send Quotation
                </button>
              )}

              {sub.status === 'Quotation' && (
                <button className="btn btn-primary btn-sm" onClick={handleConfirm}>
                  <CheckCircle2 size={14} /> Customer Confirm
                </button>
              )}

              {sub.status === 'Confirmed' && (
                <button className="btn btn-primary btn-sm" onClick={handleActivate}>
                  <Zap size={14} /> Activate Subscription
                </button>
              )}

              {(sub.status === 'Active' || sub.status === 'Paused') && plan.allowPause && (
                <button className="btn btn-secondary btn-sm" onClick={handleTogglePause}>
                  {sub.status === 'Paused' ? <Play size={14} /> : <Pause size={14} />}
                  {sub.status === 'Paused' ? 'Resume Billing' : 'Pause'}
                </button>
              )}

              {sub.status === 'Active' && plan.allowRenew && (
                <button className="btn btn-secondary btn-sm" onClick={handleRenew}>
                  <RefreshCw size={14} /> Renew
                </button>
              )}

              {sub.status === 'Active' && (
                <button className="btn btn-primary btn-sm" onClick={handleCreateInvoiceNow}>
                  <FileText size={14} /> Create Invoice Now
                </button>
              )}

              {sub.status === 'Active' && plan.allowEarlyClose && (
                <button className="btn btn-danger btn-sm" onClick={handleClose}>
                  <XCircle size={14} /> Close
                </button>
              )}

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => window.print()}
                title="Print PDF"
              >
                <Printer size={14} /> Print
              </button>
            </div>
          </div>

          {/* Status Pipeline Tracker */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
            }}
          >
            {stages.map((st, i) => {
              const isPassed = i <= currentStageIndex;
              const isCurrent = stages[currentStageIndex] === st;
              return (
                <React.Fragment key={st}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      color: isCurrent
                        ? 'var(--accent)'
                        : isPassed
                        ? 'var(--text-primary)'
                        : 'var(--text-muted)',
                      fontWeight: isCurrent ? 700 : 500,
                      fontSize: 12,
                    }}
                  >
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        background: isCurrent
                          ? 'var(--accent)'
                          : isPassed
                          ? 'var(--bg-secondary)'
                          : 'transparent',
                        color: isCurrent ? '#1C1C1C' : isPassed ? 'var(--text-primary)' : 'var(--text-muted)',
                        border: isPassed ? '1px solid var(--border)' : '1px dashed var(--text-muted)',
                      }}
                    >
                      {i + 1}
                    </span>
                    <span>{st}</span>
                  </div>
                  {i < stages.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        margin: '0 12px',
                        background: isPassed ? 'var(--accent)' : 'var(--border)',
                        opacity: isPassed ? 0.7 : 0.3,
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Subscription Info Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Line items table */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Covered Products & Services</h3>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Unit Price</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {sub.lines.length === 0 ? (
                  <tr>
                    <td>Platform Access (Pro)</td>
                    <td style={{ textAlign: 'center' }}>50</td>
                    <td style={{ textAlign: 'right' }}>$199</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>$9,950</td>
                  </tr>
                ) : (
                  sub.lines.map((l) => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 500 }}>{l.product}</td>
                      <td style={{ textAlign: 'center' }}>{l.qty}</td>
                      <td style={{ textAlign: 'right' }}>${l.unitPrice}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        ${l.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div
              style={{
                marginTop: 18,
                paddingTop: 16,
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                  <span>${sub.total.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tax (8.25%):</span>
                  <span>${Math.round(sub.total * 0.0825).toLocaleString()}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 15,
                    fontWeight: 700,
                    paddingTop: 6,
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <span>Total Amount:</span>
                  <span style={{ color: 'var(--accent)' }}>
                    ${Math.round(sub.total * 1.0825).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Metadata */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Schedule & Rules</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Billing Frequency
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>
                  {plan.billingPeriod}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Next Billing Date
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 2,
                  }}
                >
                  <Calendar size={14} />
                  {sub.nextBillingDate}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Valid From / To
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {sub.startDate} → {sub.expiryDate}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Payment Terms
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {sub.paymentTerms}
                </div>
              </div>

              <div
                style={{
                  paddingTop: 12,
                  borderTop: '1px solid var(--border)',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                }}
              >
                Plan Capabilities:
                <ul style={{ paddingLeft: 16, marginTop: 4 }}>
                  <li>Pause allowed: {plan.allowPause ? 'Yes' : 'No'}</li>
                  <li>Renewal allowed: {plan.allowRenew ? 'Yes' : 'No'}</li>
                  <li>Early close: {plan.allowEarlyClose ? 'Yes' : 'No'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}

