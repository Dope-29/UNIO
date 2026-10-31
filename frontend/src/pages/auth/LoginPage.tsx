import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function Logo() {
  return (
    <div className="logo">
      <div className="logo-mark"><span /></div>
      <strong>unio</strong>
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      const lower = email.toLowerCase();
      if (lower.includes('admin')) navigate('/user/admin');
      else if (lower.includes('staff')) navigate('/user/staff');
      else navigate('/user/portal');
    } catch {
      setError('Login failed. Please try again.');
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
          <p className="auth-art-eyebrow">Subscription Operations, Simplified</p>
          <h1 className="auth-art-headline">
            Everything your<br />business needs to<br /><em>grow together.</em>
          </h1>
          <p className="auth-art-desc">
            Unify subscriptions, customers and revenue workflows in one calm, clear workspace.
          </p>
          <div className="auth-art-stat">
            <div className="auth-art-stat-icon">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="auth-art-stat-value">+28.4%</div>
              <div className="auth-art-stat-label">revenue growth this month</div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-box">
          <p className="auth-eyebrow">Unio Workspace</p>
          <h2 className="auth-heading">Welcome back</h2>
          <p className="auth-subheading">Sign in to manage your subscription operations.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                type="email"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="auth-forgot-link">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            {error && <p className="form-error" style={{ marginBottom: 8 }}>{error}</p>}
            <button className="btn btn-primary auth-submit-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="auth-footer">
            New to Unio?{' '}
            <Link to="/signup">Create an account</Link>
          </div>

          <div style={{ marginTop: 24, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Demo credentials:</p>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Admin: <strong>admin@unio.com</strong></p>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Staff: <strong>staff@unio.com</strong></p>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Customer: <strong>user@example.com</strong></p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Any password works</p>
          </div>
        </div>
      </div>
    </div>
  );
}

