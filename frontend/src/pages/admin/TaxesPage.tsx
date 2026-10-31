import React, { useState } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import DataTable from '../../components/common/DataTable';
import { mockTaxes } from '../../data/mockData';
import { Tax } from '../../types';
import { post, messageFrom } from '../../lib/api';
import { useLiveData } from '../../context/LiveDataContext';

interface TaxForm {
  name: string;
  rate: number;
  appliesTo: string;
  active: boolean;
}

const defaultForm: TaxForm = {
  name: '',
  rate: 0,
  appliesTo: '',
  active: true,
};

export default function TaxesPage() {
  const [taxes, setTaxes] = useState<Tax[]>(mockTaxes);
  const [form, setForm] = useState<TaxForm>(defaultForm);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const { reload } = useLiveData();

  const handleChange = <K extends keyof TaxForm>(field: K, value: TaxForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    try {
      await post('/taxes', { name: form.name.trim(), ratePercent: Number(form.rate), isActive: form.active });
      await reload(); setForm(defaultForm); setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (err) { setError(messageFrom(err)); }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'rate',
      label: 'Rate',
      render: (_val: unknown, row: Record<string, unknown>) => (
        <span>{String(row.rate)}%</span>
      ),
    },
    { key: 'appliesTo', label: 'Applies To', muted: true },
    {
      key: 'active',
      label: 'Active',
      render: (_val: unknown, row: Record<string, unknown>) => (
        <span
          style={{
            color: row.active ? 'var(--success)' : 'var(--text-muted)',
            fontWeight: 500,
            fontSize: '0.85rem',
          }}
        >
          {row.active ? 'Yes' : 'No'}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout title="Taxes">
      <div className="page-header">
        <h1 className="page-title">Taxes</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Form card */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 600 }}>Add Tax</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Tax Name</label>
              <input
                className="form-input"
                placeholder="e.g. US Standard"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rate (%)</label>
              <input
                className="form-input"
                type="number"
                min={0}
                step={0.01}
                placeholder="0.00"
                value={form.rate}
                onChange={(e) => handleChange('rate', Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Applies To</label>
              <input
                className="form-input"
                placeholder="e.g. All Products"
                value={form.appliesTo}
                onChange={(e) => handleChange('appliesTo', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => handleChange('active', e.target.checked)}
                  style={{ accentColor: 'var(--accent)', width: '15px', height: '15px' }}
                />
                Active
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>
                Save Tax
              </button>
              {saved && (
                <span style={{ color: 'var(--success)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                  ✓ Saved
                </span>
              )}
            </div>
            {error && <p className="form-error">{error}</p>}
          </div>
        </div>

        {/* Right: Table */}
        <DataTable
          columns={columns}
          data={taxes as unknown as Record<string, unknown>[]}
          searchable
          searchPlaceholder="Search taxes..."
          emptyMessage="No taxes configured yet."
        />
      </div>
    </AdminLayout>
  );
}
