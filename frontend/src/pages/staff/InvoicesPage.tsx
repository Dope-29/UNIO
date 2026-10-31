import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffLayout from '../../components/Layout/StaffLayout';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { mockInvoices } from '../../data/mockData';
import { Invoice } from '../../types';
import { Play, CheckCircle2, Calendar, DollarSign, Download } from 'lucide-react';

export default function InvoicesPage({ basePath = '/user/staff' }: { basePath?: string }) {
  const navigate = useNavigate();
  const [invoices] = useState<Invoice[]>(mockInvoices);
  const [statusFilter, setStatusFilter] = useState('All');
  const [billingResult, setBillingResult] = useState<string | null>(null);

  const handleRunBilling = () => {
    setBillingResult('Billing engine executed: 2 invoices generated, 4 skipped (period already billed).');
    setTimeout(() => setBillingResult(null), 5000);
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Overdue') return inv.status === 'Overdue';
    if (statusFilter === 'Unpaid') return inv.balance > 0;
    return inv.status === statusFilter;
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
      key: 'customerName',
      label: 'Customer',
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {String(row.customerName)}
        </span>
      ),
    },
    {
      key: 'dates',
      label: 'Issue / Due Date',
      render: (_: unknown, row: Record<string, unknown>) => (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          <div>Issued: {String(row.issueDate)}</div>
          <div style={{ color: row.status === 'Overdue' ? 'var(--danger)' : 'var(--text-muted)' }}>
            Due: {String(row.dueDate)}
          </div>
        </div>
      ),
    },
    {
      key: 'total',
      label: 'Total ($)',
      amount: true,
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          ${Number(row.total).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'paid',
      label: 'Paid ($)',
      amount: true,
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ color: Number(row.paid) > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
          ${Number(row.paid).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'balance',
      label: 'Balance ($)',
      amount: true,
      render: (_: unknown, row: Record<string, unknown>) => {
        const bal = Number(row.balance);
        return (
          <span style={{ fontWeight: 600, color: bal > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
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
  ];

  return (
    <StaffLayout title="Invoices">
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 14 }}>
            System-generated billing invoices, collection statuses and receivables.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleRunBilling}>
          <Play size={15} /> Run Billing Now (All Due)
        </button>
      </div>

      {billingResult && (
        <div
          style={{
            marginTop: 16,
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
          <span>{billingResult}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['All', 'Unpaid', 'Overdue', 'Confirmed', 'Paid'].map((st) => (
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
          data={filteredInvoices as unknown as Record<string, unknown>[]}
          searchPlaceholder="Search invoice #, customer name..."
          onRowClick={(row) => navigate(`${basePath}/invoices/${row.id}`)}
        />
      </div>
    </StaffLayout>
  );
}

