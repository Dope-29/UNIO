import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { messageFrom } from '../../lib/api';

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
      const user = await login(email, password);
      if (user.role === 'ADMIN') navigate('/user/admin');
      else if (user.role === 'STAFF') navigate('/user/staff');
      else navigate('/user/portal');
    } catch (err) {
      setError(messageFrom(err));
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

        </div>
      </div>
    </div>
  );
}

