import React from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../../components/Layout/PortalLayout';
import KPICard from '../../components/common/KPICard';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { mockSubscriptions, mockInvoices } from '../../data/mockData';
import {
  WalletCards, Receipt, DollarSign, Calendar, ArrowRight,
  ShieldCheck, CreditCard, ExternalLink,
} from 'lucide-react';

export default function PortalHomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter only Acme Corporation (customer id c1) for logged in customer
  const mySubscriptions = mockSubscriptions.filter((s) => s.customerId === 'c1');
  const activeSubs = mySubscriptions.filter((s) => s.status === 'Active');
  const myInvoices = mockInvoices.filter((i) => i.customerId === 'c1' && i.status !== 'Draft');
  const outstandingAmount = myInvoices
    .filter((i) => i.balance > 0)
    .reduce((sum, i) => sum + i.balance, 0);

  const nextBilling = activeSubs[0]?.nextBillingDate || 'Mar 24, 2025';

  return (
    <PortalLayout title="My Account Overview">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Welcome back, {user?.name || 'Customer'}</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 14 }}>
            Manage your company subscriptions, download invoices and handle payments.
          </p>
        </div>
      </div>

      {/* KPI Cards for Customer */}
      <div className="stats-grid">
        <KPICard
          label="Active Subscriptions"
          value={activeSubs.length.toString()}
          trend="2 Plans"
          trendUp={true}
          icon={WalletCards}
        />
        <KPICard
          label="Outstanding Balance"
          value={`$${outstandingAmount.toLocaleString()}`}
          trend={outstandingAmount > 0 ? 'Due soon' : 'All clear'}
          trendUp={outstandingAmount === 0}
          icon={DollarSign}
        />
        <KPICard
          label="Next Scheduled Billing"
          value={nextBilling}
          trend="Auto-charge"
          trendUp={true}
          icon={Calendar}
        />
      </div>

      {/* Quick Navigation Cards */}
      <div
        style={{
          marginTop: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        <div
          className="card"
          style={{ padding: 20, cursor: 'pointer', transition: 'border-color 0.2s' }}
          onClick={() => navigate('/user/portal/subscriptions')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(220, 252, 124, 0.1)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <WalletCards size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>My Subscriptions</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                  View terms, pause, or renew plans
                </p>
              </div>
            </div>
            <ArrowRight size={16} color="var(--accent)" />
          </div>
        </div>

        <div
          className="card"
          style={{ padding: 20, cursor: 'pointer', transition: 'border-color 0.2s' }}
          onClick={() => navigate('/user/portal/invoices')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(100, 181, 246, 0.1)',
                  color: 'var(--info)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Receipt size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>My Invoices</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                  Download PDF receipts & pay online
                </p>
              </div>
            </div>
            <ArrowRight size={16} color="var(--info)" />
          </div>
        </div>

        <div
          className="card"
          style={{ padding: 20, cursor: 'pointer', transition: 'border-color 0.2s' }}
          onClick={() => navigate('/user/portal/profile')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 184, 77, 0.1)',
                  color: 'var(--warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Profile & Billing Info</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                  Addresses, contacts & credentials
                </p>
              </div>
            </div>
            <ArrowRight size={16} color="var(--warning)" />
          </div>
        </div>
      </div>

      {/* Active Subscriptions Preview */}
      <div className="card" style={{ marginTop: 24, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Active Subscriptions</h3>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/user/portal/subscriptions')}
          >
            View all ({mySubscriptions.length})
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mySubscriptions.map((sub) => (
            <div
              key={sub.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/user/portal/subscriptions/${sub.id}`)}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{sub.number}</span>
                  <span style={{ fontWeight: 600 }}>{sub.planName}</span>
                  <Badge status={sub.status} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Valid until {sub.expiryDate} · Next billing: {sub.nextBillingDate}
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>
                    ${sub.total.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>annual contract</div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}

