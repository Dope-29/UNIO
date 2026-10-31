import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

function Logo() {
  return (
    <div className="logo">
      <div className="logo-mark"><span /></div>
      <strong>unio</strong>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-art">
        <div className="auth-art-bg" />
        <Logo />
        <div className="auth-art-content">
          <p className="auth-art-eyebrow">Account Recovery</p>
          <h1 className="auth-art-headline">
            Reset your<br />password<br /><em>securely.</em>
          </h1>
          <p className="auth-art-desc">
            We'll send you a reset link to your email address.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-box">
          <p className="auth-eyebrow">Password Reset</p>
          <h2 className="auth-heading">Forgot password?</h2>
          <p className="auth-subheading">Enter your email and we'll send you a reset link.</p>

          {submitted ? (
            <div className="auth-success-box">
              <CheckCircle size={22} />
              <div className="auth-success-title">Check your inbox</div>
              <div className="auth-success-desc">
                We've sent a password reset link to <strong>{email}</strong>.
                Please check your email.
              </div>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button className="btn btn-primary auth-submit-btn" type="submit">
                Send reset link
              </button>
            </form>
          )}

          <div className="auth-footer">
            Remember your password?{' '}
            <Link to="/login">Back to sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

