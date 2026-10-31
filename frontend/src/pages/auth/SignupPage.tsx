import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Logo() {
  return (
    <div className="logo">
      <div className="logo-mark"><span /></div>
      <strong>unio</strong>
    </div>
  );
}

export default function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/user/portal');
    } catch {
      setError('Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-art">
        <div className="auth-art-bg" />
        <Logo />
        <div className="auth-art-content">
          <p className="auth-art-eyebrow">Join Unio Today</p>
          <h1 className="auth-art-headline">
            Start managing<br />your subscriptions<br /><em>with clarity.</em>
          </h1>
          <p className="auth-art-desc">
            Create your account and start managing customer relationships in one place.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-box">
          <p className="auth-eyebrow">Create Account</p>
          <h2 className="auth-heading">Get started</h2>
          <p className="auth-subheading">Create your Unio account to get started.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input
                className="form-input"
                type="text"
                placeholder="Alex Morgan"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
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
            <button className="btn btn-primary auth-submit-btn" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

