import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PortalLayout from '../../components/Layout/PortalLayout';
import Badge from '../../components/common/Badge';
import { mockSubscriptions, mockPlans } from '../../data/mockData';
import {
  ArrowLeft, Pause, Play, RefreshCw, XCircle, FileText,
  Calendar, CheckCircle2, ShieldCheck, ToggleLeft, ToggleRight,
} from 'lucide-react';

export default function SubscriptionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const initialSub = mockSubscriptions.find((s) => s.id === id) || mockSubscriptions[0];
  const [sub, setSub] = useState(initialSub);
  const plan = mockPlans.find((p) => p.id === sub.planId) || mockPlans[0];

  const [addonEnabled, setAddonEnabled] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleTogglePause = () => {
    const nextStatus = sub.status === 'Paused' ? 'Active' : 'Paused';
    if (window.confirm(nextStatus === 'Paused' ? 'Pause your subscription? Billing will be suspended until resumed.' : 'Resume subscription?')) {
      setSub({ ...sub, status: nextStatus });
      showNotify(nextStatus === 'Paused' ? 'Subscription successfully paused.' : 'Subscription resumed.');
    }
  };

  const handleRenew = () => {
    if (window.confirm('Renew subscription for another year?')) {
      setSub({ ...sub, expiryDate: '2027-03-24' });
      showNotify('Subscription renewed! Contract extended to March 24, 2027.');
    }
  };

  const handleClose = () => {
    if (window.confirm('Are you sure you want to cancel and close this subscription?')) {
      setSub({ ...sub, status: 'Closed' });
      showNotify('Subscription closed.');
    }
  };

  const handleToggleAddon = () => {
    const nextState = !addonEnabled;
    setAddonEnabled(nextState);
    showNotify(
      nextState
        ? 'Analytics Add-on (+$79/mo) activated! Effective starting on next invoice.'
        : 'Analytics Add-on removed. Effective starting on next invoice.'
    );
  };

  return (
    <PortalLayout title={`Subscription Details (${sub.number})`}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onClick={() => navigate('/user/portal/subscriptions')}
        >
          <ArrowLeft size={16} /> Back to My Subscriptions
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
            <CheckCircle2 size={16} />
            <span>{notification}</span>
          </div>
        )}

        {/* Header Action Card */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{sub.planName}</h1>
                <Badge status={sub.status} />
              </div>
              <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: 13 }}>
                Reference: <strong style={{ color: 'var(--accent)' }}>{sub.number}</strong> · Terms: {sub.paymentTerms}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(sub.status === 'Active' || sub.status === 'Paused') && plan.allowPause && (
                <button className="btn btn-secondary btn-sm" onClick={handleTogglePause}>
                  {sub.status === 'Paused' ? <Play size={14} /> : <Pause size={14} />}
                  {sub.status === 'Paused' ? 'Resume Subscription' : 'Pause Subscription'}
                </button>
              )}

              {sub.status === 'Active' && plan.allowRenew && (
                <button className="btn btn-secondary btn-sm" onClick={handleRenew}>
                  <RefreshCw size={14} /> Renew Plan
                </button>
              )}

              {sub.status === 'Active' && plan.allowEarlyClose && (
                <button className="btn btn-danger btn-sm" onClick={handleClose}>
                  <XCircle size={14} /> Close Subscription
                </button>
              )}

              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/user/portal/invoices')}
              >
                <FileText size={14} /> View My Invoices
              </button>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Included Services</h3>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Product / Service</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {sub.lines.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 500 }}>{l.product}</td>
                    <td style={{ textAlign: 'center' }}>{l.qty}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      ${l.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {addonEnabled && (
                  <tr style={{ background: 'rgba(220, 252, 124, 0.05)' }}>
                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>
                      Analytics Add-on (Next Invoice)
                    </td>
                    <td style={{ textAlign: 'center' }}>1</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--accent)' }}>
                      +$79 / mo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Optional Add-on Toggle Card */}
            <div
              style={{
                marginTop: 24,
                padding: 16,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  Real-time Analytics Add-on
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Unlock custom BI dashboard, API exports and query builder (+$79/month).
                </div>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${addonEnabled ? 'btn-primary' : 'btn-secondary'}`}
                onClick={handleToggleAddon}
              >
                {addonEnabled ? 'Enabled' : 'Add to Plan'}
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Contract Terms</h3>
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
                  Next Scheduled Charge
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
                  Valid Term
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {sub.startDate} → {sub.expiryDate}
                </div>
              </div>

              <div
                style={{
                  paddingTop: 14,
                  borderTop: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Total Annual Value
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                  ${sub.total.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

