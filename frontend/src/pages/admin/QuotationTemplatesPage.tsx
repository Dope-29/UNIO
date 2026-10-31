import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/Layout/AdminLayout';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { mockTemplates, mockPlans } from '../../data/mockData';
import { QuotationTemplate } from '../../types';

interface ProductLine {
  id: string;
  product: string;
  variant: string;
  qty: number;
}

interface TemplateForm {
  name: string;
  validityDays: number;
  planId: string;
  lines: ProductLine[];
}

const defaultForm: TemplateForm = {
  name: '',
  validityDays: 30,
  planId: '',
  lines: [],
};

export default function QuotationTemplatesPage() {
  const [templates, setTemplates] = useState<QuotationTemplate[]>(mockTemplates);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<TemplateForm>(defaultForm);

  const openModal = () => {
    setForm(defaultForm);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(defaultForm);
  };

  const handleFormChange = (field: keyof Omit<TemplateForm, 'lines'>, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addLine = () => {
    setForm((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        { id: `line-${Date.now()}`, product: '', variant: '', qty: 1 },
      ],
    }));
  };

  const updateLine = (idx: number, field: keyof ProductLine, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.map((l, i) => (i === idx ? { ...l, [field]: value } : l)),
    }));
  };

  const removeLine = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.planId) return;
    const selectedPlan = mockPlans.find((p) => p.id === form.planId);
    const newTemplate: QuotationTemplate = {
      id: `qt${Date.now()}`,
      name: form.name.trim(),
      validityDays: Number(form.validityDays),
      planId: form.planId,
      lines: form.lines.map((l) => ({
        id: l.id,
        product: l.product,
        variant: l.variant,
        qty: Number(l.qty),
      })),
    };
    setTemplates((prev) => [...prev, newTemplate]);
    closeModal();
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'validityDays', label: 'Validity Days' },
    {
      key: 'planId',
      label: 'Plan',
      render: (_val: unknown, row: Record<string, unknown>) => {
        const plan = mockPlans.find((p) => p.id === row.planId);
        return <span>{plan ? plan.name : String(row.planId)}</span>;
      },
    },
    {
      key: 'lines',
      label: 'Products',
      render: (_val: unknown, row: Record<string, unknown>) => {
        const lines = row.lines as { product: string; variant: string; qty: number }[];
        return (
          <span className="text-muted" style={{ fontSize: '0.82rem' }}>
            {lines.length === 0 ? '—' : lines.map((l) => `${l.product}${l.variant ? ` (${l.variant})` : ''} ×${l.qty}`).join(', ')}
          </span>
        );
      },
    },
  ];

  return (
    <AdminLayout title="Quotation Templates">
      <div className="page-header">
        <h1 className="page-title">Quotation Templates</h1>
        <button className="btn btn-primary" onClick={openModal}>
          <Plus size={15} />
          New Template
        </button>
      </div>

      <DataTable
        columns={columns}
        data={templates as unknown as Record<string, unknown>[]}
        searchable
        searchPlaceholder="Search templates..."
        emptyMessage="No quotation templates yet."
      />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title="New Quotation Template"
        maxWidth={640}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save Template
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Template Name</label>
            <input
              className="form-input"
              placeholder="e.g. Enterprise Annual Template"
              value={form.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Validity Days</label>
              <input
                className="form-input"
                type="number"
                min={1}
                value={form.validityDays}
                onChange={(e) => handleFormChange('validityDays', Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Plan</label>
              <select
                className="form-select"
                value={form.planId}
                onChange={(e) => handleFormChange('planId', e.target.value)}
              >
                <option value="">Select a plan…</option>
                {mockPlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Product Lines</label>
              <button className="btn btn-secondary" style={{ padding: '0.25rem 0.65rem', fontSize: '0.82rem' }} onClick={addLine}>
                <Plus size={13} /> Add Line
              </button>
            </div>

            {form.lines.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
                No product lines added yet.
              </div>
            ) : (
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Variant</th>
                    <th>Qty</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {form.lines.map((line, idx) => (
                    <tr key={line.id}>
                      <td>
                        <input
                          className="form-input"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                          placeholder="Product name"
                          value={line.product}
                          onChange={(e) => updateLine(idx, 'product', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="form-input"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                          placeholder="Variant"
                          value={line.variant}
                          onChange={(e) => updateLine(idx, 'variant', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="form-input"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem', width: '70px' }}
                          type="number"
                          min={1}
                          value={line.qty}
                          onChange={(e) => updateLine(idx, 'qty', Number(e.target.value))}
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.3rem 0.5rem' }}
                          onClick={() => removeLine(idx)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
