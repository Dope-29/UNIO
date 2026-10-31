import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { mockCustomers } from '../../data/mockData';
import { Customer } from '../../types';
import { UserPlus, Mail, Phone, ArrowRight } from 'lucide-react';

export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [billingAddress, setBillingAddress] = useState('');

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newCust: Customer = {
      id: `c-${Date.now()}`,
      name,
      email,
      phone: phone || '+1 (555) 000-0000',
      billingAddress: billingAddress || 'Corporate HQ',
      activeSubscriptions: 0,
      outstandingAmount: 0,
      status: 'Active',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setCustomers([newCust, ...customers]);
    setName('');
    setEmail('');
    setPhone('');
    setBillingAddress('');
    setIsModalOpen(false);
  };

  const columns = [
    {
      key: 'name',
      label: 'Customer',
      render: (_: unknown, row: Record<string, unknown>) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {String(row.name)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Joined {String(row.createdAt)}
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Contact',
      render: (_: unknown, row: Record<string, unknown>) => (
        <div>
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Mail size={12} color="var(--text-muted)" /> {String(row.email)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Phone size={11} /> {String(row.phone)}
          </div>
        </div>
      ),
    },
    {
      key: 'activeSubscriptions',
      label: 'Active Subs',
      render: (_: unknown, row: Record<string, unknown>) => (
        <span
          style={{
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-primary)',
            color: Number(row.activeSubscriptions) > 0 ? 'var(--accent)' : 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}
        >
          {Number(row.activeSubscriptions)}
        </span>
      ),
    },
    {
      key: 'outstandingAmount',
      label: 'Outstanding',
      amount: true,
      render: (_: unknown, row: Record<string, unknown>) => {
        const amt = Number(row.outstandingAmount);
        return (
          <span style={{ fontWeight: 600, color: amt > 0 ? 'var(--danger)' : 'var(--success)' }}>
            ${amt.toLocaleString()}
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
      render: (_: unknown, row: Record<string, unknown>) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/user/admin/subscriptions?customer=${encodeURIComponent(String(row.name))}`);
            }}
          >
            Subscriptions <ArrowRight size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Customers">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 14 }}>
            Accounts, active subscriber volumes, and outstanding invoices.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={16} /> New Customer
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        <DataTable
          columns={columns}
          data={customers as unknown as Record<string, unknown>[]}
          searchPlaceholder="Search customer name, email..."
          onRowClick={(row) =>
            navigate(`/user/admin/subscriptions?customer=${encodeURIComponent(String(row.name))}`)
          }
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Customer"
        maxWidth={500}
      >
        <form onSubmit={handleCreateCustomer}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Full Name / Company Name</label>
              <input
                className="input"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Corporation"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Billing Email Address</label>
              <input
                type="email"
                className="input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="billing@company.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Billing Address</label>
              <textarea
                className="input"
                rows={3}
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                placeholder="Street address, City, State, ZIP..."
              />
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Customer
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}

