import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { mockProducts } from '../../data/mockData';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Product } from '../../types';
import { del, messageFrom } from '../../lib/api';
import { useLiveData } from '../../context/LiveDataContext';

export default function ProductsPage() {
  const navigate = useNavigate();
  const { reload } = useLiveData();
  const remove = async (id: string, name: string) => {
    if (!window.confirm(`Deactivate product "${name}"?`)) return;
    try { await del(`/products/${id}`); await reload(); } catch (error) { window.alert(messageFrom(error)); }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {String(row.name)}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (_: unknown, row: Record<string, unknown>) => (
        <span
          style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 4,
            background: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          {String(row.type)}
        </span>
      ),
    },
    {
      key: 'salesPrice',
      label: 'Sales Price',
      amount: true,
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          ${Number(row.salesPrice).toLocaleString()}
        </span>
      ),
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
      render: (_: unknown, row: Record<string, unknown>) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button
            className="btn btn-ghost btn-icon"
            title="Edit product"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/user/admin/products/${row.id}/edit`);
            }}
          >
            <Pencil size={15} />
          </button>
          <button
            className="btn btn-ghost btn-icon"
            title="Delete product"
            style={{ color: 'var(--danger)' }}
            onClick={(e) => {
              e.stopPropagation();
              void remove(String(row.id), String(row.name));
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  const tableData = mockProducts.map((p: Product) => ({ ...p } as unknown as Record<string, unknown>));

  return (
    <AdminLayout title="Products">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your product catalog</p>
        </div>
        <div className="page-header-right">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/user/admin/products/new')}
          >
            <Plus size={16} />
            New Product
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={tableData}
        searchPlaceholder="Search products..."
        emptyMessage="No products found. Create your first product."
        onRowClick={(row) => navigate(`/user/admin/products/${row.id}/edit`)}
      />
    </AdminLayout>
  );
}
