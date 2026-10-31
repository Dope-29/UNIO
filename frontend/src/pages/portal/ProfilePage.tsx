import React, { useState } from 'react';
import PortalLayout from '../../components/Layout/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { Check, CheckCircle2, Lock, User, Phone, MapPin } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  // Profile details state
  const [name, setName] = useState(user?.name || 'Acme Corporation');
  const [email] = useState(user?.email || 'finance@acme.co');
  const [phone, setPhone] = useState('+1 (555) 100-2000');
  const [billingAddress, setBillingAddress] = useState(
    '123 Enterprise Park, Suite 400\nSan Francisco, CA 94105'
  );

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('Password must contain at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9!@#$%^&*]/.test(newPassword)) {
      setPasswordError('Password must contain uppercase, lowercase and a number/special character.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  return (
    <PortalLayout title="Account Settings & Profile">
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div className="page-header" style={{ marginBottom: 24 }}>
          <div>
            <h1 className="page-title">Company Profile & Security</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 14 }}>
              Maintain billing entity details, contacts and account credentials.
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="card" style={{ padding: 28, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Company Details</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
            These details are printed automatically on all future subscription tax invoices.
          </p>

          {profileSaved && (
            <div
              style={{
                marginBottom: 16,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(220, 252, 124, 0.15)',
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle2 size={16} /> Profile changes saved successfully.
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Company / Account Legal Name</label>
                <input
                  className="input"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Billing Notification Email</label>
                <input
                  className="input"
                  disabled
                  value={email}
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Contact staff to update primary account identifier.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Finance Contact Phone</label>
                <input
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Tax Billing Address</label>
                <textarea
                  className="input"
                  rows={3}
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} /> Save Profile Changes
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Change Password</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
            Ensure your account uses a secure passphrase with minimum 8 characters.
          </p>

          {passwordSaved && (
            <div
              style={{
                marginBottom: 16,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(220, 252, 124, 0.15)',
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle2 size={16} /> Password updated successfully!
            </div>
          )}

          {passwordError && (
            <div
              style={{
                marginBottom: 16,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 85, 85, 0.15)',
                border: '1px solid var(--danger)',
                color: 'var(--danger)',
                fontSize: 13,
              }}
            >
              {passwordError}
            </div>
          )}

          <form onSubmit={handleUpdatePassword}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="input"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••"
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="input"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="input"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="submit" className="btn btn-secondary">
                  <Lock size={15} /> Update Password
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </PortalLayout>
  );
}

