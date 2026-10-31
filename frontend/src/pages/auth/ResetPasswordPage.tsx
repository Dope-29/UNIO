import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { post, messageFrom } from '../../lib/api';
import PasswordRules, { validPassword } from '../../components/common/PasswordRules';

function Logo() {
  return (
    <div className="logo">
      <div className="logo-mark"><span /></div>
      <strong>unio</strong>
    </div>
  );
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.password) {
      setError('Please enter a new password.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!validPassword(form.password)) { setError('Password constraints not matching. Please check the requirements below.'); return; }
    const token = searchParams.get('token');
    if (!token) {
      setError('This reset link is invalid or incomplete.');
      return;
    }
    setError('');
    try {
      await post('/auth/reset', { token, password: form.password });
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(messageFrom(err));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-art">
        <div className="auth-art-bg" />
        <Logo />
        <div className="auth-art-content">
          <p className="auth-art-eyebrow">Account Security</p>
          <h1 className="auth-art-headline">
            Set a new<br /><em>secure password.</em>
          </h1>
          <p className="auth-art-desc">
            Choose a strong password to keep your account safe.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-box">
          <p className="auth-eyebrow">Reset Password</p>
          <h2 className="auth-heading">New password</h2>
          <p className="auth-subheading">Choose a secure password for your Unio account.</p>

          {done ? (
            <div className="auth-success-box">
              <CheckCircle size={22} />
              <div className="auth-success-title">Password updated!</div>
              <div className="auth-success-desc">Redirecting you to sign in…</div>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">New password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <PasswordRules password={form.password} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••••••"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                />
              </div>
              {error && <p className="form-error" style={{ marginBottom: 8 }}>{error}</p>}
              <button className="btn btn-primary auth-submit-btn" type="submit">
                Reset password
              </button>
            </form>
          )}

          <div className="auth-footer">
            <Link to="/login">Back to sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

