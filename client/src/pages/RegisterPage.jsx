import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Coffee, User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useToast } from '../components/common/Toast';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      addToast('Account created successfully! Welcome to Smart Bakery & Café.', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 1rem', minHeight: 'calc(100vh - var(--nav-height) - 150px)', display: 'flex', alignItems: 'center' }}>
      <div
        className="container"
        style={{
          maxWidth: '500px',
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
          <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-espresso)' }}>Join the Bakers Club</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Register to save your delivery addresses and earn welcome discounts.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                color="#78716C"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                name="name"
                required
                placeholder="Aarav Sharma"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

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
                name="email"
                required
                placeholder="aarav@example.com"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">10-Digit Mobile Phone</label>
            <div style={{ position: 'relative' }}>
              <Phone
                size={18}
                color="#78716C"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="tel"
                name="phone"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Password (Min. 6 characters)</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="#78716C"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="password"
                name="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
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
            {loading ? 'Creating Account...' : 'Register Account'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Link to Login */}
        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
