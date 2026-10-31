import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../../components/Layout/PortalLayout';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { mockInvoices } from '../../data/mockData';
import { ArrowRight, DollarSign, Download } from 'lucide-react';

export default function MyInvoicesPage() {
  const navigate = useNavigate();

  // In customer portal, only Acme Corporation (c1) invoices, and 'Draft' is hidden!
  const myInvoices = mockInvoices.filter(
    (i) => i.status !== 'Draft'
  );

  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = myInvoices.filter((i) => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Unpaid') return i.status === 'Confirmed' && i.balance > 0;
    return i.status === statusFilter;
  });

  const columns = [
    {
      key: 'number',
      label: 'Invoice #',
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
          {String(row.number)}
        </span>
      ),
    },
    {
      key: 'issueDate',
      label: 'Issue Date',
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          {String(row.issueDate)}
        </span>
      ),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          {String(row.dueDate)}
        </span>
      ),
    },
    {
      key: 'total',
      label: 'Total Amount',
      amount: true,
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          ${Number(row.total).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'balance',
      label: 'Balance Due',
      amount: true,
      render: (_: unknown, row: Record<string, unknown>) => {
        const bal = Number(row.balance);
        return (
          <span style={{ fontWeight: 700, color: bal > 0 ? 'var(--danger)' : 'var(--success)' }}>
            ${bal.toLocaleString()}
          </span>
        );
      },
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
      render: (_: unknown, row: Record<string, unknown>) => {
        const bal = Number(row.balance);
        return (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            {bal > 0 && row.status === 'Confirmed' && (
              <button
                className="btn btn-primary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/user/portal/payment?invoice=${row.id}`);
                }}
              >
                Pay Now
              </button>
            )}
            <a className="btn btn-secondary btn-sm" href={`${import.meta.env.VITE_API_URL ?? ''}/api/portal/invoices/${encodeURIComponent(String(row.id))}/pdf`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}><Download size={14} /> PDF</a>
            <button
              className="btn btn-secondary btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/user/portal/invoices/${row.id}`);
              }}
            >
              View <ArrowRight size={13} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <PortalLayout title="My Invoices">
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing & Invoices</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 14 }}>
            View statement history, download official tax invoices and settle open balances.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
        {['All', 'Unpaid', 'Paid'].map((st) => (
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
          data={filtered as unknown as Record<string, unknown>[]}
          searchPlaceholder="Search invoices..."
          onRowClick={(row) => navigate(`/user/portal/invoices/${row.id}`)}
        />
      </div>
    </PortalLayout>
  );
}

