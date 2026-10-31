import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffLayout from '../../components/Layout/StaffLayout';
import { mockCustomers, mockPlans, mockProducts, mockTemplates, mockTaxes } from '../../data/mockData';
import { SubscriptionLine } from '../../types';
import { ArrowLeft, Plus, Trash2, Check, Sparkles } from 'lucide-react';

export default function NewSubscriptionPage({ basePath = '/user/staff' }: { basePath?: string }) {
  const navigate = useNavigate();

  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customerId, setCustomerId] = useState(mockCustomers[0]?.id || '');
  const [planId, setPlanId] = useState(mockPlans[0]?.id || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState('2026-03-24');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');

  const [lines, setLines] = useState<SubscriptionLine[]>([
    {
      id: 'l-1',
      product: mockProducts[0]?.name || 'Platform Access',
      qty: 10,
      unitPrice: 199,
      taxIds: ['t1'],
      amount: 1990,
    },
  ]);

  const handleTemplateSelect = (tplId: string) => {
    setSelectedTemplate(tplId);
    const tpl = mockTemplates.find((t) => t.id === tplId);
    if (!tpl) return;

    setPlanId(tpl.planId);
    // Calculate expiry based on validity days
    const exp = new Date();
    exp.setDate(exp.getDate() + tpl.validityDays);
    setExpiryDate(exp.toISOString().slice(0, 10));

    if (tpl.lines.length > 0) {
      setLines(
        tpl.lines.map((tl, idx) => ({
          id: `l-${Date.now()}-${idx}`,
          product: tl.variant ? `${tl.product} (${tl.variant})` : tl.product,
          qty: tl.qty,
          unitPrice: 199,
          taxIds: ['t1'],
          amount: tl.qty * 199,
        }))
      );
    }
  };

  const addLine = () => {
    setLines([
      ...lines,
      {
        id: `l-${Date.now()}`,
        product: mockProducts[0]?.name || 'Platform Access',
        qty: 1,
        unitPrice: 199,
        taxIds: ['t1'],
        amount: 199,
      },
    ]);
  };

  const removeLine = (lineId: string) => {
    setLines(lines.filter((l) => l.id !== lineId));
  };

  const updateLine = (lineId: string, field: keyof SubscriptionLine, value: any) => {
    setLines(
      lines.map((l) => {
        if (l.id !== lineId) return l;
        const updated = { ...l, [field]: value };
        if (field === 'qty' || field === 'unitPrice') {
          updated.amount = Number(updated.qty) * Number(updated.unitPrice);
        }
        return updated;
      })
    );
  };

  const untaxedSubtotal = lines.reduce((sum, l) => sum + (l.amount || 0), 0);
  const taxRate = 8.25;
  const taxAmount = Math.round(untaxedSubtotal * (taxRate / 100));
  const discountPreview = untaxedSubtotal > 3000 ? Math.round(untaxedSubtotal * 0.05) : 0;
  const total = untaxedSubtotal - discountPreview + taxAmount;

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate creation
    navigate(`${basePath}/subscriptions/s1`);
  };

  return (
    <StaffLayout title="New Subscription">
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onClick={() => navigate(`${basePath}/subscriptions`)}
        >
          <ArrowLeft size={16} /> Back to Subscriptions
        </button>

        <div className="page-header" style={{ marginBottom: 20 }}>
          <div>
            <h1 className="page-title">New Subscription / Quotation</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 14 }}>
              Start from a saved quotation template or configure custom plan terms.
            </p>
          </div>
        </div>

        {/* Template Quick Loader */}
        <div
          className="card"
          style={{
            marginBottom: 20,
            padding: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(220, 252, 124, 0.1)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Start from Quotation Template</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Auto-fills plan, line items and expiry terms
              </div>
            </div>
          </div>
          <select
            className="select"
            style={{ width: 260 }}
            value={selectedTemplate}
            onChange={(e) => handleTemplateSelect(e.target.value)}
          >
            <option value="">-- Choose a template --</option>
            {mockTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.validityDays}d)
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSaveDraft}>
          {/* Header Details Card */}
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Subscription Terms</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Customer</label>
                <select
                  className="select"
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  {mockCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subscription Plan</label>
                <select
                  className="select"
                  required
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                >
                  {mockPlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ${p.price} / {p.billingPeriod.toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Contract Start Date</label>
                <input
                  type="date"
                  className="input"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contract Expiry Date</label>
                <input
                  type="date"
                  className="input"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Payment Terms</label>
                <select
                  className="select"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                >
                  <option value="Immediate">Immediate / Due upon receipt</option>
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Net 30">Net 30 Days</option>
                  <option value="Net 60">Net 60 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lines Table Card */}
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600 }}>Product Line Items</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                  Specify services, quantities and taxes for automated billing.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={addLine}
              >
                <Plus size={14} /> Add Line Item
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '38%' }}>Product / Service</th>
                    <th style={{ width: '15%' }}>Quantity</th>
                    <th style={{ width: '18%' }}>Unit Price ($)</th>
                    <th style={{ width: '15%' }}>Taxes</th>
                    <th style={{ width: '14%', textAlign: 'right' }}>Amount ($)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <input
                          className="input"
                          value={l.product}
                          onChange={(e) => updateLine(l.id, 'product', e.target.value)}
                          placeholder="Service name"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="input"
                          min={1}
                          value={l.qty}
                          onChange={(e) => updateLine(l.id, 'qty', Number(e.target.value))}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="input"
                          min={0}
                          value={l.unitPrice}
                          onChange={(e) => updateLine(l.id, 'unitPrice', Number(e.target.value))}
                        />
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 11,
                            padding: '4px 8px',
                            background: 'var(--bg-primary)',
                            borderRadius: 4,
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          GST 8.25%
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        ${(l.amount || 0).toLocaleString()}
                      </td>
                      <td style={{ width: 40, textAlign: 'center' }}>
                        {lines.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => removeLine(l.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Summary */}
            <div
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Untaxed Subtotal:</span>
                  <span>${untaxedSubtotal.toLocaleString()}</span>
                </div>
                {discountPreview > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--accent)' }}>Volume Discount (5%):</span>
                    <span style={{ color: 'var(--accent)' }}>-${discountPreview.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated Tax:</span>
                  <span>${taxAmount.toLocaleString()}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 16,
                    fontWeight: 700,
                    paddingTop: 8,
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <span>Total Amount:</span>
                  <span style={{ color: 'var(--accent)' }}>${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`${basePath}/subscriptions`)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} /> Save as Draft
            </button>
          </div>
        </form>
      </div>
    </StaffLayout>
  );
}

