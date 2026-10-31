import React, { useState } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import DataTable from '../../components/common/DataTable';
import { mockDiscounts } from '../../data/mockData';
import { Discount } from '../../types';

interface DiscountForm {
  name: string;
  type: 'Percentage' | 'Fixed';
  value: number;
  minPurchase: number;
  minQty: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  appliesTo: string;
}

const defaultForm: DiscountForm = {
  name: '',
  type: 'Percentage',
  value: 0,
  minPurchase: 0,
  minQty: 1,
  startDate: '',
  endDate: '',
  usageLimit: 0,
  appliesTo: '',
};

function statusBadgeClass(status: string) {
  switch (status) {
    case 'Active':
      return 'badge badge-active';
    case 'Expired':
      return 'badge badge-expired';
    case 'Exhausted':
      return 'badge badge-exhausted';
    case 'Scheduled':
      return 'badge badge-scheduled';
    default:
      return 'badge';
  }
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>(mockDiscounts);
  const [form, setForm] = useState<DiscountForm>(defaultForm);
  const [saved, setSaved] = useState(false);

  const handleChange = <K extends keyof DiscountForm>(field: K, value: DiscountForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;

    const now = new Date();
    const start = form.startDate ? new Date(form.startDate) : null;
    const end = form.endDate ? new Date(form.endDate) : null;

    let status: Discount['status'] = 'Active';
    if (start && start > now) {
      status = 'Scheduled';
    } else if (end && end < now) {
      status = 'Expired';
    }

    const newDiscount: Discount = {
      id: `d${Date.now()}`,
      name: form.name.trim(),
      type: form.type,
      value: Number(form.value),
      minPurchase: Number(form.minPurchase),
      minQty: Number(form.minQty),
      startDate: form.startDate,
      endDate: form.endDate,
      usageLimit: Number(form.usageLimit),
      usageCount: 0,
      appliesTo: form.appliesTo,
      status,
    };

    setDiscounts((prev) => [newDiscount, ...prev]);
    setForm(defaultForm);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'type',
      label: 'Type',
      render: (_val: unknown, row: Record<string, unknown>) => (
        <span style={{ fontSize: '0.85rem' }}>{String(row.type)}</span>
      ),
    },
    {
      key: 'value',
      label: 'Value',
      render: (_val: unknown, row: Record<string, unknown>) => (
        <span>
          {row.type === 'Percentage' ? `${row.value}%` : `$${row.value}`}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_val: unknown, row: Record<string, unknown>) => (
        <span className={statusBadgeClass(String(row.status))}>
          {String(row.status)}
        </span>
      ),
    },
    {
      key: 'appliesTo',
      label: 'Applies To',
      muted: true,
    },
    {
      key: 'usageCount',
      label: 'Used',
      render: (_val: unknown, row: Record<string, unknown>) => (
        <span>
          {String(row.usageCount)}{row.usageLimit ? ` / ${row.usageLimit}` : ''}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout title="Discounts">
      <div className="page-header">
        <h1 className="page-title">Discounts</h1>
      </div>

      {/* Form card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <span style={{ fontWeight: 600 }}>New Discount</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                className="form-input"
                placeholder="Discount name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={form.type}
                onChange={(e) => handleChange('type', e.target.value as 'Percentage' | 'Fixed')}
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed">Fixed ($)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Value</label>
              <input
                className="form-input"
                type="number"
                min={0}
                placeholder="0"
                value={form.value}
                onChange={(e) => handleChange('value', Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Min Purchase ($)</label>
              <input
                className="form-input"
                type="number"
                min={0}
                placeholder="0"
                value={form.minPurchase}
                onChange={(e) => handleChange('minPurchase', Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Min Qty</label>
              <input
                className="form-input"
                type="number"
                min={1}
                placeholder="1"
                value={form.minQty}
                onChange={(e) => handleChange('minQty', Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                className="form-input"
                type="date"
                value={form.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                className="form-input"
                type="date"
                value={form.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Usage Limit</label>
              <input
                className="form-input"
                type="number"
                min={0}
                placeholder="0 = unlimited"
                value={form.usageLimit}
                onChange={(e) => handleChange('usageLimit', Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Applies To</label>
              <input
                className="form-input"
                placeholder="e.g. All Plans"
                value={form.appliesTo}
                onChange={(e) => handleChange('appliesTo', e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={handleSave}>
              Save Discount
            </button>
            {saved && (
              <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>
                ✓ Discount saved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={discounts as unknown as Record<string, unknown>[]}
        searchable
        searchPlaceholder="Search discounts..."
        emptyMessage="No discounts configured yet."
      />
    </AdminLayout>
  );
}
