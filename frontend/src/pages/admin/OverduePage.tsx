import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { mockInvoices } from '../../data/mockData';
import { Bell, DollarSign, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function OverduePage() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<Record<string, string>>({});
  const [notif, setNotif] = useState<string | null>(null);

  const overdueInvoices = mockInvoices
    .filter((i) => i.status === 'Overdue' || (i.balance > 0 && new Date(i.dueDate) < new Date()))
    .map((inv) => {
      const due = new Date(inv.dueDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - due.getTime());
      const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...inv,
        daysOverdue,
      };
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue);

  const totalOverdueBalance = overdueInvoices.reduce((sum, i) => sum + i.balance, 0);

  const handleSendReminder = (e: React.MouseEvent, invNumber: string) => {
    e.stopPropagation();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setReminders({ ...reminders, [invNumber]: time });
    setNotif(`Payment reminder dispatched to ${invNumber}`);
    setTimeout(() => setNotif(null), 3000);
  };

  const columns = [
    {
      key: 'number',
      label: 'Invoice #',
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ fontWeight: 700, color: 'var(--danger)' }}>
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
      key: 'dueDate',
      label: 'Due Date',
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          {String(row.dueDate)}
        </span>
      ),
    },
    {
      key: 'daysOverdue',
      label: 'Aging',
      render: (_: unknown, row: Record<string, unknown>) => (
        <span
          style={{
            fontWeight: 700,
            fontSize: 12,
            padding: '3px 8px',
            borderRadius: 4,
            background: 'rgba(255, 85, 85, 0.15)',
            color: 'var(--danger)',
            border: '1px solid rgba(255, 85, 85, 0.3)',
          }}
        >
          {String(row.daysOverdue)} days late
        </span>
      ),
    },
    {
      key: 'balance',
      label: 'Unpaid Balance',
      amount: true,
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ fontWeight: 800, color: 'var(--danger)', fontSize: 15 }}>
          ${Number(row.balance).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'reminder',
      label: 'Reminder Status',
      render: (_: unknown, row: Record<string, unknown>) => {
        const num = String(row.number);
        const sentTime = reminders[num];
        return sentTime ? (
          <span style={{ fontSize: 11, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={12} /> Sent at {sentTime}
          </span>
        ) : (
          <button
            className="btn btn-secondary btn-sm"
            onClick={(e) => handleSendReminder(e, num)}
          >
            <Bell size={13} /> Send Reminder
          </button>
        );
      },
    },
    {
      key: 'actions',
      label: '',
      render: (_: unknown, row: Record<string, unknown>) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/user/admin/payments/record?invoice=${row.id}`);
            }}
          >
            <DollarSign size={13} /> Pay
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/user/admin/invoices/${row.id}`);
            }}
          >
            <ArrowRight size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Overdue Invoices">
      <div className="page-header">
        <div>
          <h1 className="page-title">Overdue Receivables</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 14 }}>
            Track defaulted payments, aging metrics and trigger automated dunning notices.
          </p>
        </div>
      </div>

      {notif && (
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
          <span>{notif}</span>
        </div>
      )}

      <div
        style={{
          marginTop: 20,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Overdue Balance
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--danger)', marginTop: 4 }}>
            ${totalOverdueBalance.toLocaleString()}
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Overdue Invoices Count
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--warning)', marginTop: 4 }}>
            {overdueInvoices.length}
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Average Delay
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
            18 Days
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <DataTable
          columns={columns}
          data={overdueInvoices as unknown as Record<string, unknown>[]}
          searchPlaceholder="Search overdue accounts or invoice #..."
          onRowClick={(row) => navigate(`/user/admin/invoices/${row.id}`)}
        />
      </div>
    </AdminLayout>
  );
}

