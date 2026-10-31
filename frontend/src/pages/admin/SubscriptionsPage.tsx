import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { mockSubscriptions } from '../../data/mockData';
import { Subscription } from '../../types';
import { Plus, Calendar } from 'lucide-react';

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCustomer = searchParams.get('customer') || '';

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [subscriptions] = useState<Subscription[]>(mockSubscriptions);

  const filteredData = subscriptions.filter((sub) => {
    if (initialCustomer && !sub.customerName.toLowerCase().includes(initialCustomer.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'All' && sub.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const columns = [
    {
      key: 'number',
      label: 'Subscription #',
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.5px' }}>
          {String(row.number)}
        </span>
      ),
    },
    {
      key: 'customerName',
      label: 'Customer',
      render: (_: unknown, row: Record<string, unknown>) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {String(row.customerName)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Terms: {String(row.paymentTerms)}
          </div>
        </div>
      ),
    },
    {
      key: 'planName',
      label: 'Plan',
      render: (_: unknown, row: Record<string, unknown>) => (
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          }}
        >
          {String(row.planName)}
        </span>
      ),
    },
    {
      key: 'dates',
      label: 'Period & Expiry',
      render: (_: unknown, row: Record<string, unknown>) => (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          <div>Start: {String(row.startDate)}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
            Exp: {String(row.expiryDate)}
          </div>
        </div>
      ),
    },
    {
      key: 'nextBillingDate',
      label: 'Next Billing',
      render: (_: unknown, row: Record<string, unknown>) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
          <Calendar size={13} color="var(--accent)" />
          {String(row.nextBillingDate)}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: Record<string, unknown>) => (
        <Badge status={String(row.status)} />
      ),
    },
    {
      key: 'total',
      label: 'Total Value',
      amount: true,
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          ${Number(row.total).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout title="Subscriptions">
      <div className="page-header">
        <div>
          <h1 className="page-title">Subscriptions</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 14 }}>
            Monitor active contracts, draft quotations, recurring schedules and renewals.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/user/admin/subscriptions/new')}
        >
          <Plus size={16} /> New Subscription
        </button>
      </div>

      {initialCustomer && (
        <div
          style={{
            marginTop: 16,
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
          }}
        >
          <span>Filtered by customer: <strong>{initialCustomer}</strong></span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/user/admin/subscriptions')}
            style={{ padding: '2px 8px' }}
          >
            Clear filter
          </button>
        </div>
      )}

      <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['All', 'Active', 'Quotation', 'Draft', 'Paused', 'Closed'].map((st) => (
          <button
            key={st}
            className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter(st)}
          >
            {st}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <DataTable
          columns={columns}
          data={filteredData as unknown as Record<string, unknown>[]}
          searchPlaceholder="Search subscription #, customer, plan..."
          onRowClick={(row) => navigate(`/user/admin/subscriptions/${row.id}`)}
        />
      </div>
    </AdminLayout>
  );
}

