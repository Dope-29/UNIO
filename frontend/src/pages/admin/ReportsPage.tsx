import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import KPICard from '../../components/common/KPICard';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { mockSubscriptions, mockInvoices, mockPayments, mockCustomers } from '../../data/mockData';
import {
  WalletCards, CircleDollarSign, AlertCircle, Clock, Download,
} from 'lucide-react';

export default function ReportsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Summary' | 'Subscriptions' | 'Payments' | 'Invoices' | 'Overdue'>('Summary');

  const activeSubsCount = mockSubscriptions.filter((s) => s.status === 'Active').length;
  const totalRevenue = mockPayments.reduce((sum, p) => sum + p.amount, 0);
  const stillOwed = mockInvoices
    .filter((i) => i.status !== 'Paid')
    .reduce((sum, i) => sum + i.balance, 0);
  const overdueCount = mockInvoices.filter((i) => i.status === 'Overdue').length;

  const handleExportCSV = () => {
    alert(`Exporting ${activeTab} report to CSV...`);
  };

  return (
    <AdminLayout title="Reports & Analytics">
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Reports</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 14 }}>
            Cash flow breakdowns, subscriber churn metrics and revenue projections.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={handleExportCSV}>
          <Download size={15} /> Export {activeTab} CSV
        </button>
      </div>

      <div className="stats-grid" style={{ marginTop: 20 }}>
        <KPICard
          label="Active Subscriptions"
          value={activeSubsCount.toString()}
          trend="+12%"
          trendUp={true}
          icon={WalletCards}
        />
        <KPICard
          label="Revenue Collected"
          value={`$${totalRevenue.toLocaleString()}`}
          trend="+18.4%"
          trendUp={true}
          icon={CircleDollarSign}
        />
        <KPICard
          label="Outstanding Receivables"
          value={`$${stillOwed.toLocaleString()}`}
          trend="-4.2%"
          trendUp={false}
          icon={Clock}
        />
        <KPICard
          label="Overdue Invoices"
          value={overdueCount.toString()}
          trend="+1"
          trendUp={false}
          icon={AlertCircle}
        />
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
        {(['Summary', 'Subscriptions', 'Payments', 'Invoices', 'Overdue'] as const).map((tab) => (
          <button
            key={tab}
            className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        {activeTab === 'Summary' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Revenue by Payment Method</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { method: 'Card (Stripe / Razorpay)', amount: '$13,392', pct: '74%' },
                  { method: 'Direct Bank Wire (ACH)', amount: '$990', pct: '18%' },
                  { method: 'Instant UPI', amount: '$500', pct: '8%' },
                ].map((item) => (
                  <div key={item.method}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span>{item.method}</span>
                      <strong>{item.amount} ({item.pct})</strong>
                    </div>
                    <div style={{ width: '100%', height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: item.pct, height: '100%', background: 'var(--accent)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Top Customer Accounts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {mockCustomers.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      background: 'var(--bg-primary)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.email}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--accent)' }}>
                        {c.activeSubscriptions} plans
                      </div>
                      <div style={{ fontSize: 11, color: c.outstandingAmount > 0 ? 'var(--danger)' : 'var(--success)' }}>
                        ${c.outstandingAmount} unpaid
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Subscriptions' && (
          <div className="card" style={{ padding: 20 }}>
            <DataTable
              columns={[
                { key: 'number', label: 'Subscription #' },
                { key: 'customerName', label: 'Customer' },
                { key: 'planName', label: 'Plan' },
                { key: 'startDate', label: 'Start Date' },
                { key: 'status', label: 'Status', render: (_: unknown, r) => <Badge status={String(r.status)} /> },
                { key: 'total', label: 'Value ($)', amount: true, render: (_: unknown, r) => `$${Number(r.total).toLocaleString()}` },
              ]}
              data={mockSubscriptions as unknown as Record<string, unknown>[]}
              searchPlaceholder="Search subscriptions..."
              onRowClick={(row) => navigate(`/user/admin/subscriptions/${row.id}`)}
            />
          </div>
        )}

        {activeTab === 'Payments' && (
          <div className="card" style={{ padding: 20 }}>
            <DataTable
              columns={[
                { key: 'date', label: 'Date' },
                { key: 'invoiceNumber', label: 'Invoice #' },
                { key: 'customerName', label: 'Customer' },
                { key: 'method', label: 'Method' },
                { key: 'amount', label: 'Amount', amount: true, render: (_: unknown, r) => `+$${Number(r.amount).toLocaleString()}` },
              ]}
              data={mockPayments as unknown as Record<string, unknown>[]}
              searchPlaceholder="Search payments..."
              onRowClick={(row) => navigate(`/user/admin/invoices/${row.invoiceId}`)}
            />
          </div>
        )}

        {activeTab === 'Invoices' && (
          <div className="card" style={{ padding: 20 }}>
            <DataTable
              columns={[
                { key: 'number', label: 'Invoice #' },
                { key: 'customerName', label: 'Customer' },
                { key: 'dueDate', label: 'Due Date' },
                { key: 'total', label: 'Total ($)', amount: true, render: (_: unknown, r) => `$${Number(r.total).toLocaleString()}` },
                { key: 'balance', label: 'Balance ($)', amount: true, render: (_: unknown, r) => `$${Number(r.balance).toLocaleString()}` },
                { key: 'status', label: 'Status', render: (_: unknown, r) => <Badge status={String(r.status)} /> },
              ]}
              data={mockInvoices as unknown as Record<string, unknown>[]}
              searchPlaceholder="Search invoices..."
              onRowClick={(row) => navigate(`/user/admin/invoices/${row.id}`)}
            />
          </div>
        )}

        {activeTab === 'Overdue' && (
          <div className="card" style={{ padding: 20 }}>
            <DataTable
              columns={[
                { key: 'number', label: 'Invoice #' },
                { key: 'customerName', label: 'Customer' },
                { key: 'dueDate', label: 'Due Date' },
                { key: 'balance', label: 'Unpaid Balance', amount: true, render: (_: unknown, r) => <span style={{ color: 'var(--danger)', fontWeight: 700 }}>${Number(r.balance).toLocaleString()}</span> },
                { key: 'status', label: 'Status', render: (_: unknown, r) => <Badge status={String(r.status)} /> },
              ]}
              data={mockInvoices.filter((i) => i.status === 'Overdue') as unknown as Record<string, unknown>[]}
              searchPlaceholder="Search overdue..."
              onRowClick={(row) => navigate(`/user/admin/invoices/${row.id}`)}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

