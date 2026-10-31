import React, { useState } from 'react';
import { Plus, UserX } from 'lucide-react';
import AdminLayout from '../../components/Layout/AdminLayout';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { mockStaff } from '../../data/mockData';
import { StaffMember } from '../../types';

const ROLES = ['Administrator', 'Billing Manager', 'Sales Staff', 'Support Staff'];

interface StaffForm {
  name: string;
  email: string;
  tempPassword: string;
  role: string;
}

const defaultForm: StaffForm = {
  name: '',
  email: '',
  tempPassword: '',
  role: 'Sales Staff',
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(mockStaff);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<StaffForm>(defaultForm);
  const [formError, setFormError] = useState('');

  const openModal = () => {
    setForm(defaultForm);
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(defaultForm);
    setFormError('');
  };

  const handleChange = <K extends keyof StaffForm>(field: K, value: StaffForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const handleCreate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.tempPassword.trim()) {
      setFormError('Name, email and temporary password are required.');
      return;
    }
    const newMember: StaffMember = {
      id: `st${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      status: 'Active',
      lastActive: 'Never',
    };
    setStaff((prev) => [newMember, ...prev]);
    closeModal();
  };

  const handleDeactivate = (memberId: string) => {
    setStaff((prev) =>
      prev.map((m) =>
        m.id === memberId ? { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' } : m
      )
    );
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email', muted: true },
    { key: 'role', label: 'Role' },
    { key: 'lastActive', label: 'Last Active', muted: true },
    {
      key: 'status',
      label: 'Status',
      render: (_val: unknown, row: Record<string, unknown>) => (
        <span
          className={`badge ${row.status === 'Active' ? 'badge-active' : 'badge-expired'}`}
        >
          {String(row.status)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_val: unknown, row: Record<string, unknown>) => (
        <button
          className={`btn ${row.status === 'Active' ? 'btn-danger' : 'btn-secondary'}`}
          style={{ padding: '0.25rem 0.65rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          onClick={(e) => {
            e.stopPropagation();
            handleDeactivate(String(row.id));
          }}
        >
          <UserX size={13} />
          {row.status === 'Active' ? 'Deactivate' : 'Reactivate'}
        </button>
      ),
    },
  ];

  return (
    <AdminLayout title="Staff">
      <div className="page-header">
        <h1 className="page-title">Staff</h1>
        <button className="btn btn-primary" onClick={openModal}>
          <Plus size={15} />
          Add Staff
        </button>
      </div>

      <DataTable
        columns={columns}
        data={staff as unknown as Record<string, unknown>[]}
        searchable
        searchPlaceholder="Search staff..."
        emptyMessage="No staff members yet."
      />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title="Add Staff Member"
        maxWidth={480}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreate}>
              Create Staff
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {formError && (
            <div
              style={{
                padding: '0.6rem 0.85rem',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius)',
                color: 'var(--danger)',
                fontSize: '0.85rem',
              }}
            >
              {formError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              placeholder="e.g. Jane Smith"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="jane@company.com"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Temporary Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Temporary password"
              value={form.tempPassword}
              onChange={(e) => handleChange('tempPassword', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={form.role}
              onChange={(e) => handleChange('role', e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
