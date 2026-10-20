import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Coffee, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useToast } from '../components/common/Toast';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ email, password });
      addToast('Welcome back to Smart Bakery & Café!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      addToast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Demo auto-fill helpers
  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div style={{ padding: '3.5rem 1rem', minHeight: 'calc(100vh - var(--nav-height) - 150px)', display: 'flex', alignItems: 'center' }}>
      <div
        className="container"
        style={{
          maxWidth: '480px',
          backgroundColor: '#FFF',
          borderRadius: '24px',
          border: '1px solid var(--border-subtle)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Brand Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'var(--primary-espresso)',
              color: 'var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              boxShadow: '0 4px 14px rgba(44, 24, 16, 0.25)',
            }}
          >
            <Coffee size={28} />
          </div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-espresso)' }}>Sign In to Your Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Access your order history, delivery addresses, and saved favorites.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                color="#78716C"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="#78716C"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginBottom: '1.5rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Demo Credentials Quick-Fill Buttons */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            Demo / Evaluator Quick Fill:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
            <button
              type="button"
              onClick={() => fillCredentials('customer@smartbakery.com', 'CustomerPass123!')}
              style={{
                padding: '8px 6px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1E40AF',
                fontSize: '0.72rem',
                fontWeight: 700,
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              🍰 Customer
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@smartbakery.com', 'AdminSecurePassword123!')}
              style={{
                padding: '8px 6px',
                borderRadius: '8px',
                backgroundColor: '#FEF3C7',
                border: '1px solid #FDE68A',
                color: '#92400E',
                fontSize: '0.72rem',
                fontWeight: 700,
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('delivery@smartbakery.com', 'DeliverySecurePass123!')}
              style={{
                padding: '8px 6px',
                borderRadius: '8px',
                backgroundColor: '#DCFCE7',
                border: '1px solid #BBF7D0',
                color: '#166534',
                fontSize: '0.72rem',
                fontWeight: 700,
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              🛵 Courier
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
