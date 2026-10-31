import React from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../../components/Layout/PortalLayout';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { mockSubscriptions } from '../../data/mockData';
import { ArrowRight, Calendar } from 'lucide-react';

export default function MySubscriptionsPage() {
  const navigate = useNavigate();

  // In customer portal, only Acme Corporation (id c1) subscriptions are returned
  const mySubscriptions = mockSubscriptions.filter((s) => s.customerId === 'c1');

  const columns = [
    {
      key: 'number',
      label: 'Subscription #',
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
          {String(row.number)}
        </span>
      ),
    },
    {
      key: 'planName',
      label: 'Plan',
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {String(row.planName)}
        </span>
      ),
    },
    {
      key: 'nextBillingDate',
      label: 'Next Billing',
      render: (_: unknown, row: Record<string, unknown>) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
          <Calendar size={13} color="var(--accent)" />
          {String(row.nextBillingDate)}
        </div>
      ),
    },
    {
      key: 'expiryDate',
      label: 'Contract Expiry',
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          {String(row.expiryDate)}
        </span>
      ),
    },
    {
      key: 'total',
      label: 'Billing Amount',
      amount: true,
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          ${Number(row.total).toLocaleString()}
        </span>
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
      key: 'actions',
      label: '',
      render: (_: unknown, row: Record<string, unknown>) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/user/portal/subscriptions/${row.id}`);
            }}
          >
            Manage <ArrowRight size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PortalLayout title="My Subscriptions">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Subscriptions</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 14 }}>
            Review your active service plans, contract renewals and billing rules.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <DataTable
          columns={columns}
          data={mySubscriptions as unknown as Record<string, unknown>[]}
          searchPlaceholder="Search subscriptions..."
          onRowClick={(row) => navigate(`/user/portal/subscriptions/${row.id}`)}
        />
      </div>
    </PortalLayout>
  );
}

