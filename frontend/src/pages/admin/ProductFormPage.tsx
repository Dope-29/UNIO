import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import { mockProducts } from '../../data/mockData';
import { ProductVariant } from '../../types';
import { Plus, Trash2, ArrowLeft, Check } from 'lucide-react';
import { post, patch, del, messageFrom } from '../../lib/api';
import { useLiveData } from '../../context/LiveDataContext';

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const existing = id ? mockProducts.find((p) => p.id === id) : null;

  const [name, setName] = useState(existing?.name || '');
  const [type, setType] = useState(existing?.type || 'Digital service');
  const [salesPrice, setSalesPrice] = useState(existing?.salesPrice || 0);
  const [costPrice, setCostPrice] = useState(existing?.costPrice || 0);
  const [notes, setNotes] = useState(existing?.notes || '');
  const [variants, setVariants] = useState<ProductVariant[]>(
    existing?.variants || []
  );
  const [error, setError] = useState('');
  const { reload } = useLiveData();

  const addVariantRow = () => {
    setVariants([
      ...variants,
      { id: crypto.randomUUID(), attribute: '', value: '', extraPrice: 0 },
    ]);
  };

  const removeVariant = (varId: string) => {
    setVariants(variants.filter((v) => v.id !== varId));
  };

  const updateVariant = (varId: string, field: keyof ProductVariant, val: string | number) => {
    setVariants(
      variants.map((v) => (v.id === varId ? { ...v, [field]: val } : v))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { name, type, salesPrice: Number(salesPrice), costPrice: Number(costPrice), notes: notes || undefined };
      const saved = id ? await patch<{ data: { id: string } }>(`/products/${id}`, payload) : await post<{ data: { id: string } }>('/products', payload);
      const productId = saved.data.id;
      const originalIds = new Set((existing?.variants ?? []).map((v) => v.id));
      await Promise.all((existing?.variants ?? []).filter((v) => !variants.some((now) => now.id === v.id)).map((v) => del(`/products/${productId}/variants/${v.id}`)));
      await Promise.all(variants.filter((v) => v.attribute && v.value).map((v) => originalIds.has(v.id)
        ? patch(`/products/${productId}/variants/${v.id}`, { attribute: v.attribute, value: v.value, extraPrice: Number(v.extraPrice) })
        : post(`/products/${productId}/variants`, { attribute: v.attribute, value: v.value, extraPrice: Number(v.extraPrice) })));
      await reload(); navigate('/user/admin/products');
    } catch (err) { setError(messageFrom(err)); }
  };

  return (
    <AdminLayout title={existing ? 'Edit Product' : 'New Product'}>
      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onClick={() => navigate('/user/admin/products')}
        >
          <ArrowLeft size={16} /> Back to Products
        </button>

        <div className="page-header" style={{ marginBottom: 20 }}>
          <div>
            <h1 className="page-title">{existing ? 'Edit Product' : 'Create Product'}</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 14 }}>
              Set prices, product categories, and optional variant options.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          {error && <p className="form-error">{error}</p>}
          <div className="card" style={{ marginBottom: 24, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>General Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Product Name</label>
                <input
                  className="input"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Enterprise License"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Product Type</label>
                <select
                  className="select"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                >
                  <option value="Digital service">Digital service</option>
                  <option value="Physical">Physical</option>
                  <option value="Add-on">Add-on</option>
                  <option value="One-time">One-time</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Sales Price ($)</label>
                <input
                  type="number"
                  className="input"
                  min={0}
                  required
                  value={salesPrice}
                  onChange={(e) => setSalesPrice(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cost Price ($)</label>
                <input
                  type="number"
                  className="input"
                  min={0}
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Internal Notes / Description</label>
                <textarea
                  className="input"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional product specs or invoicing details..."
                />
              </div>
            </div>
          </div>

          {/* Variants section */}
          <div className="card" style={{ marginBottom: 24, padding: 24 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>Product Variants</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                  Attributes that modify the final sales price (e.g. Tier | Pro | +$50)
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={addVariantRow}
              >
                <Plus size={14} /> Add Variant Row
              </button>
            </div>

            {variants.length === 0 ? (
              <div
                style={{
                  padding: 24,
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  border: '1px dashed var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                No variants configured yet for this product.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {variants.map((v) => (
                  <div
                    key={v.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 140px 40px',
                      gap: 12,
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <input
                        className="input"
                        placeholder="Attribute (e.g. Brand, Tier)"
                        value={v.attribute}
                        onChange={(e) => updateVariant(v.id, 'attribute', e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        className="input"
                        placeholder="Value (e.g. Pro, Premium)"
                        value={v.value}
                        onChange={(e) => updateVariant(v.id, 'value', e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        className="input"
                        placeholder="+ Extra ($)"
                        value={v.extraPrice}
                        onChange={(e) =>
                          updateVariant(v.id, 'extraPrice', Number(e.target.value))
                        }
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      onClick={() => removeVariant(v.id)}
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/user/admin/products')}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} /> Save Product
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

