import React from 'react';
import { useNavigate } from 'react-router-dom';
import StaffLayout from '../../components/Layout/StaffLayout';
import KPICard from '../../components/common/KPICard';
import Badge from '../../components/common/Badge';
import {
  WalletCards, AlertCircle, TrendingDown, Users, FileText,
  ArrowRight, Clock, CheckCircle, Plus, RefreshCw,
} from 'lucide-react';
import { mockSubscriptions, mockInvoices, mockCustomers } from '../../data/mockData';

// ── derived KPI values ────────────────────────────────────────────────────────
const activeSubscriptions = mockSubscriptions.filter((s) => s.status === 'Active');
const outstandingInvoices = mockInvoices.filter((i) => i.status !== 'Paid');
const overdueInvoices     = mockInvoices.filter((i) => i.status === 'Overdue');

const outstandingAmount = outstandingInvoices.reduce((sum, i) => sum + i.balance, 0);
const overdueAmount     = overdueInvoices.reduce((sum, i) => sum + i.balance, 0);

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// ── recent activity (fabricated from mock data) ───────────────────────────────
const recentActivity = [
  { id: 'a1', icon: CheckCircle, color: '#DCFC7C', text: 'Invoice INV-0001 marked as Paid', sub: 'Acme Corporation', time: '2h ago' },
  { id: 'a2', icon: RefreshCw,   color: '#7CBFFC', text: 'Subscription SUB-0003 renewed',   sub: 'Orbit Systems',   time: '5h ago' },
  { id: 'a3', icon: AlertCircle, color: '#FC7C7C', text: 'Invoice INV-0003 is Overdue',      sub: 'Vertex Studio',   time: '1d ago' },
  { id: 'a4', icon: Plus,        color: '#DCFC7C', text: 'New customer Morrow & Co. added',  sub: 'Staff: Alex M.',  time: '2d ago' },
  { id: 'a5', icon: AlertCircle, color: '#FC7C7C', text: 'Invoice INV-0006 is Overdue',      sub: 'Pinnacle Tech',   time: '3d ago' },
  { id: 'a6', icon: CheckCircle, color: '#DCFC7C', text: 'Payment of $990 received',         sub: 'Morrow & Co.',    time: '4d ago' },
];

// ── quick actions ─────────────────────────────────────────────────────────────
const quickActions = [
  { label: 'New Subscription', path: '/user/staff/subscriptions/new' },
  { label: 'View Invoices',    path: '/user/staff/invoices' },
  { label: 'Overdue Report',   path: '/user/staff/overdue' },
  { label: 'All Customers',    path: '/user/staff/customers' },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <StaffLayout title="Dashboard">
      {/* ── Page header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 14 }}>
            Welcome back — here's what's happening today.
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/user/staff/subscriptions/new')}>
            <Plus size={15} /> New Subscription
          </button>
        </div>
      </div>

      {/* ── KPI grid ── */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        <KPICard
          label="Active Subscriptions"
          value={String(activeSubscriptions.length)}
          trend="+1 this month"
          trendUp={true}
          icon={WalletCards}
        />
        <KPICard
          label="Outstanding Amount"
          value={fmt(outstandingAmount)}
          trend="2 invoices pending"
          trendUp={false}
          icon={FileText}
        />
        <KPICard
          label="Overdue Amount"
          value={fmt(overdueAmount)}
          trend="2 invoices overdue"
          trendUp={false}
          icon={AlertCircle}
        />
        <KPICard
          label="Total Customers"
          value={String(mockCustomers.length)}
          trend="+1 this month"
          trendUp={true}
          icon={Users}
        />
      </div>

      {/* ── Body grid: recent subs + activity + quick actions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginTop: 24 }}>
        {/* Recent subscriptions */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>Recent Subscriptions</span>
            <button
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '5px 12px' }}
              onClick={() => navigate('/user/staff/subscriptions')}
            >
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Number', 'Customer', 'Plan', 'Status', 'Next Billing', 'Total'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '10px 16px',
                          textAlign: 'left',
                          color: 'var(--text-muted)',
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockSubscriptions.slice(0, 6).map((sub, idx) => (
                    <tr
                      key={sub.id}
                      onClick={() => navigate(`/user/staff/subscriptions/${sub.id}`)}
                      style={{
                        borderBottom: idx < 5 ? '1px solid var(--border)' : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '11px 16px', fontWeight: 500, color: 'var(--accent)' }}>
                        {sub.number}
                      </td>
                      <td style={{ padding: '11px 16px' }}>{sub.customerName}</td>
                      <td style={{ padding: '11px 16px', color: 'var(--text-muted)' }}>{sub.planName}</td>
                      <td style={{ padding: '11px 16px' }}>
                        <Badge status={sub.status} />
                      </td>
                      <td style={{ padding: '11px 16px', color: 'var(--text-muted)' }}>
                        {sub.nextBillingDate}
                      </td>
                      <td style={{ padding: '11px 16px', fontWeight: 500 }}>{fmt(sub.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Recent activity */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <span style={{ fontWeight: 600, fontSize: 15 }}>Recent Activity</span>
            </div>
            <div className="card-body" style={{ padding: '4px 0 8px' }}>
              {recentActivity.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '10px 16px',
                      borderBottom: idx < recentActivity.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: item.color + '18',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <Icon size={14} color={item.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, lineHeight: 1.4 }}>{item.text}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {item.sub}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      <Clock size={10} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                      {item.time}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick actions */}
          <div className="card">
            <div className="card-header">
              <span style={{ fontWeight: 600, fontSize: 15 }}>Quick Actions</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {quickActions.map((a) => (
                <button
                  key={a.label}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'space-between', width: '100%', fontSize: 13 }}
                  onClick={() => navigate(a.path)}
                >
                  {a.label}
                  <ArrowRight size={13} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Overdue invoices mini-table ── */}
      {overdueInvoices.length > 0 && (
        <div className="card" style={{ marginTop: 24, borderLeft: '3px solid #FC7C7C' }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} color="#FC7C7C" />
            <span style={{ fontWeight: 600, fontSize: 15 }}>Overdue Invoices</span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 12,
                background: '#FC7C7C22',
                color: '#FC7C7C',
                borderRadius: 4,
                padding: '2px 8px',
                fontWeight: 600,
              }}
            >
              {overdueInvoices.length} overdue
            </span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Invoice', 'Customer', 'Due Date', 'Balance'].map((h) => (
                    <th
                      key={h}
                      style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overdueInvoices.map((inv, idx) => (
                  <tr
                    key={inv.id}
                    style={{ borderBottom: idx < overdueInvoices.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <td style={{ padding: '11px 16px', fontWeight: 500, color: 'var(--accent)' }}>
                      {inv.number}
                    </td>
                    <td style={{ padding: '11px 16px' }}>{inv.customerName}</td>
                    <td style={{ padding: '11px 16px', color: '#FC7C7C' }}>{inv.dueDate}</td>
                    <td style={{ padding: '11px 16px', fontWeight: 600, color: '#FC7C7C' }}>
                      {fmt(inv.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}
