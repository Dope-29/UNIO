import React, { useState } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { mockPlans } from '../../data/mockData';
import { Plan, BillingPeriod } from '../../types';
import { Plus, Check, X, ShieldAlert } from 'lucide-react';

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>(mockPlans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState(199);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('Monthly');
  const [minQty, setMinQty] = useState(1);
  const [availableFrom, setAvailableFrom] = useState('2025-01-01');
  const [availableUntil, setAvailableUntil] = useState('2026-12-31');
  const [closeAuto, setCloseAuto] = useState(false);
  const [allowEarlyClose, setAllowEarlyClose] = useState(true);
  const [allowPause, setAllowPause] = useState(true);
  const [allowRenew, setAllowRenew] = useState(true);

  const openCreateModal = () => {
    setEditingPlan(null);
    setName('');
    setPrice(99);
    setBillingPeriod('Monthly');
    setMinQty(1);
    setAvailableFrom(new Date().toISOString().slice(0, 10));
    setAvailableUntil('2026-12-31');
    setCloseAuto(false);
    setAllowEarlyClose(true);
    setAllowPause(true);
    setAllowRenew(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Plan) => {
    setEditingPlan(p);
    setName(p.name);
    setPrice(p.price);
    setBillingPeriod(p.billingPeriod);
    setMinQty(p.minQty);
    setAvailableFrom(p.availableFrom);
    setAvailableUntil(p.availableUntil);
    setCloseAuto(p.closeAuto);
    setAllowEarlyClose(p.allowEarlyClose);
    setAllowPause(p.allowPause);
    setAllowRenew(p.allowRenew);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingPlan) {
      setPlans(
        plans.map((p) =>
          p.id === editingPlan.id
            ? {
                ...p,
                name,
                price: Number(price),
                billingPeriod,
                minQty: Number(minQty),
                availableFrom,
                availableUntil,
                closeAuto,
                allowEarlyClose,
                allowPause,
                allowRenew,
              }
            : p
        )
      );
    } else {
      const newPlan: Plan = {
        id: `pl-${Date.now()}`,
        name,
        price: Number(price),
        billingPeriod,
        minQty: Number(minQty),
        availableFrom,
        availableUntil,
        closeAuto,
        allowEarlyClose,
        allowPause,
        allowRenew,
        status: 'Active',
      };
      setPlans([newPlan, ...plans]);
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    setPlans(
      plans.map((p) =>
        p.id === id ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' } : p
      )
    );
  };

  const columns = [
    {
      key: 'name',
      label: 'Plan Name',
      render: (_: unknown, row: Record<string, unknown>) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {String(row.name)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Available: {String(row.availableFrom)} to {String(row.availableUntil)}
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price & Period',
      amount: true,
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
          ${Number(row.price).toLocaleString()}
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>
            {' '}/ {String(row.billingPeriod).toLowerCase()}
          </span>
        </span>
      ),
    },
    {
      key: 'minQty',
      label: 'Min Qty',
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ color: 'var(--text-secondary)' }}>{String(row.minQty)}</span>
      ),
    },
    {
      key: 'rules',
      label: 'Plan Rules',
      render: (_: unknown, row: Record<string, unknown>) => {
        const p = row as unknown as Plan;
        return (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {p.allowPause && (
              <span
                style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'rgba(220, 252, 124, 0.1)',
                  color: 'var(--accent)',
                  border: '1px solid rgba(220, 252, 124, 0.3)',
                }}
              >
                Pause
              </span>
            )}
            {p.allowRenew && (
              <span
                style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'rgba(100, 181, 246, 0.1)',
                  color: 'var(--info)',
                  border: '1px solid rgba(100, 181, 246, 0.3)',
                }}
              >
                Renew
              </span>
            )}
            {p.allowEarlyClose && (
              <span
                style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'rgba(255, 184, 77, 0.1)',
                  color: 'var(--warning)',
                  border: '1px solid rgba(255, 184, 77, 0.3)',
                }}
              >
                Early close
              </span>
            )}
            {p.closeAuto && (
              <span
                style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}
              >
                Auto close
              </span>
            )}
          </div>
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
      label: 'Actions',
      render: (_: unknown, row: Record<string, unknown>) => {
        const p = row as unknown as Plan;
        return (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => openEditModal(p)}
            >
              Edit
            </button>
            <button
              className={`btn btn-sm ${p.status === 'Active' ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => handleToggleStatus(p.id)}
            >
              {p.status === 'Active' ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <AdminLayout title="Subscription Plans">
      <div className="page-header">
        <div>
          <h1 className="page-title">Subscription Plans</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 14 }}>
            Define billing periods, pricing rules and customer self-service actions.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> New Plan
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        <DataTable
          columns={columns}
          data={plans as unknown as Record<string, unknown>[]}
          searchPlaceholder="Search plans..."
        />
      </div>

      {/* Plan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? 'Edit Plan' : 'Create New Subscription Plan'}
        maxWidth={580}
      >
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Plan Name</label>
              <input
                className="input"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Enterprise Annual"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Price ($)</label>
              <input
                type="number"
                className="input"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Billing Period</label>
              <select
                className="select"
                value={billingPeriod}
                onChange={(e) => setBillingPeriod(e.target.value as BillingPeriod)}
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Min Quantity</label>
              <input
                type="number"
                className="input"
                min={1}
                value={minQty}
                onChange={(e) => setMinQty(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Available From</label>
              <input
                type="date"
                className="input"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Available Until</label>
              <input
                type="date"
                className="input"
                value={availableUntil}
                onChange={(e) => setAvailableUntil(e.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              padding: 16,
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--accent)',
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Rules & Capabilities
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={allowPause}
                  onChange={(e) => setAllowPause(e.target.checked)}
                />
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                  Allow Pause / Resume (skips billing while paused)
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={allowRenew}
                  onChange={(e) => setAllowRenew(e.target.checked)}
                />
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                  Allow Renewal (extends expiry date)
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={allowEarlyClose}
                  onChange={(e) => setAllowEarlyClose(e.target.checked)}
                />
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                  Allow Early Close (customer or staff can cancel early)
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={closeAuto}
                  onChange={(e) => setCloseAuto(e.target.checked)}
                />
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                  Close automatically when plan period ends
                </span>
              </label>
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} /> Save Plan
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}

