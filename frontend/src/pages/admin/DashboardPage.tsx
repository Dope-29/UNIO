import React from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import KPICard from '../../components/common/KPICard';
import { WalletCards, CircleDollarSign, AlertCircle, TrendingDown, FileText } from 'lucide-react';
import { mockSubscriptions, mockInvoices, mockPayments } from '../../data/mockData';
import Badge from '../../components/common/Badge';

// Mini bar chart component
function MiniBarChart() {
  const bars = [42, 58, 45, 72, 63, 88, 75, 92, 80, 95, 85, 100];
  const months = ['Sep', '', 'Oct', '', 'Nov', '', 'Dec', '', 'Jan', '', 'Feb', ''];
  return (
    <div style={{ display: 'flex', height: 160, alignItems: 'flex-end', gap: 6, padding: '0 4px' }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            height: '100%',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{
              width: '100%',
              height: `${h * 0.55}%`,
              background: 'var(--border)',
              borderRadius: '4px 4px 0 0',
            }}
          />
          <div
            style={{
              width: '100%',
              height: `${h}%`,
              background: 'var(--accent)',
              borderRadius: '4px 4px 0 0',
              opacity: 0.9,
            }}
          />
          <span
            style={{
              fontSize: 9,
              color: 'var(--text-muted)',
              marginTop: 2,
              whiteSpace: 'nowrap',
            }}
          >
            {months[i]}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const activeSubscriptions = mockSubscriptions.filter((s) => s.status === 'Active').length;
  const totalRevenue = mockPayments.reduce((sum, p) => sum + p.amount, 0);
  const outstanding = mockInvoices
    .filter((i) => i.status === 'Confirmed' || i.status === 'Overdue')
    .reduce((sum, i) => sum + i.balance, 0);
  const overdue = mockInvoices
    .filter((i) => i.status === 'Overdue')
    .reduce((sum, i) => sum + i.balance, 0);

  const recentInvoices = mockInvoices.slice(0, 5);
  const recentActivity = [
    {
      text: 'Acme Corporation renewed Enterprise Annual',
      time: '2 min ago',
      initials: 'AC',
      color: 'avatar-accent',
    },
    {
      text: 'Payment received from Northstar Labs — $13,392',
      time: '1 hr ago',
      initials: 'NL',
      color: 'avatar-blue',
    },
    {
      text: 'New subscription created for Morrow & Co.',
      time: '3 hrs ago',
      initials: 'MC',
      color: 'avatar-green',
    },
    {
      text: 'Invoice INV-0003 is 8 days overdue',
      time: 'Yesterday',
      initials: 'VS',
      color: 'avatar-red',
    },
    {
      text: 'New customer Pinnacle Tech onboarded',
      time: '2 days ago',
      initials: 'PT',
      color: 'avatar-orange',
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your subscription business — February 2025</p>
        </div>
      </div>

      <div className="kpi-grid">
        <KPICard
          label="Active Subscriptions"
          value={String(activeSubscriptions)}
          trend="+8.2%"
          trendUp={true}
          icon={WalletCards}
        />
        <KPICard
          label="Revenue (Feb)"
          value={`$${totalRevenue.toLocaleString()}`}
          trend="+12.8%"
          trendUp={true}
          icon={CircleDollarSign}
        />
        <KPICard
          label="Outstanding"
          value={`$${outstanding.toLocaleString()}`}
          trend="+4.1%"
          trendUp={false}
          icon={AlertCircle}
        />
        <KPICard
          label="Overdue"
          value={`$${overdue.toLocaleString()}`}
          trend="+2.3%"
          trendUp={false}
          icon={TrendingDown}
        />
      </div>

      <div className="dashboard-grid">
        {/* Revenue Chart */}
        <div className="card card-body">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div>
              <div className="card-title">Revenue Overview</div>
              <div className="card-subtitle">Last 6 months performance</div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: 'var(--accent)',
                    display: 'inline-block',
                  }}
                />
                Revenue
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: 'var(--border)',
                    display: 'inline-block',
                  }}
                />
                Prev period
              </span>
            </div>
          </div>
          <MiniBarChart />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 16,
              paddingTop: 12,
              borderTop: '1px solid var(--border)',
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>MRR</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>$24,180</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ARR</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                $290,160
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Churn</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--danger)' }}>2.1%</div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card card-body">
          <div className="card-title" style={{ marginBottom: 16 }}>
            Recent Activity
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {recentActivity.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom:
                    i < recentActivity.length - 1
                      ? '1px solid rgba(64,64,64,0.4)'
                      : 'none',
                }}
              >
                <div
                  className={`avatar avatar-sm ${item.color}`}
                  style={{ flexShrink: 0, marginTop: 1 }}
                >
                  {item.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--text-primary)',
                      fontWeight: 500,
                      lineHeight: 1.4,
                    }}
                  >
                    {item.text}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Recent Invoices</div>
            <div className="card-subtitle">Latest billing activity</div>
          </div>
          <a
            href="/user/admin/invoices"
            style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}
          >
            View all →
          </a>
        </div>
        <div style={{ padding: '0 20px 4px' }}>
          {recentInvoices.map((inv) => (
            <div
              key={inv.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 0',
                borderBottom: '1px solid rgba(64,64,64,0.4)',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                  flexShrink: 0,
                }}
              >
                <FileText size={17} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {inv.number}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {inv.customerName} · Due {inv.dueDate}
                </div>
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  minWidth: 80,
                  textAlign: 'right',
                }}
              >
                ${inv.total.toLocaleString()}
              </div>
              <Badge status={inv.status} />
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
