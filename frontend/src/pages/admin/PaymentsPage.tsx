import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import DataTable from '../../components/common/DataTable';
import { mockPayments } from '../../data/mockData';
import { Payment } from '../../types';
import { Download, ArrowRight } from 'lucide-react';

export default function PaymentsPage() {
  const navigate = useNavigate();
  const [payments] = useState<Payment[]>(mockPayments);
  const [methodFilter, setMethodFilter] = useState('All');

  const filtered = payments.filter((p) => {
    if (methodFilter === 'All') return true;
    return p.method === methodFilter;
  });

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Date,Invoice,Customer,Method,Amount,Note']
        .concat(
          filtered.map(
            (p) =>
              `${p.date},${p.invoiceNumber},"${p.customerName}",${p.method},${p.amount},"${p.note}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'admin_payments_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          {String(row.date)}
        </span>
      ),
    },
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
          {String(row.invoiceNumber)}
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
      key: 'method',
      label: 'Method',
      render: (_: unknown, row: Record<string, unknown>) => (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: 4,
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          }}
        >
          {String(row.method)}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount Paid',
      amount: true,
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ fontWeight: 700, color: 'var(--success)' }}>
          +${Number(row.amount).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'note',
      label: 'Notes & Reference',
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {String(row.note)}
        </span>
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
              navigate(`/user/admin/invoices/${row.invoiceId}`);
            }}
          >
            Invoice <ArrowRight size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Payments">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments Log</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 14 }}>
            Historical transactions, offline reconciliations and gateway remittances.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={handleExportCSV}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['All', 'Card', 'Bank Transfer', 'UPI', 'Cheque'].map((m) => (
          <button
            key={m}
            className={`btn btn-sm ${methodFilter === m ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMethodFilter(m)}
          >
            {m}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <DataTable
          columns={columns}
          data={filtered as unknown as Record<string, unknown>[]}
          searchPlaceholder="Search payments, invoice #, customer..."
          onRowClick={(row) => navigate(`/user/admin/invoices/${row.invoiceId}`)}
        />
      </div>
    </AdminLayout>
  );
}

