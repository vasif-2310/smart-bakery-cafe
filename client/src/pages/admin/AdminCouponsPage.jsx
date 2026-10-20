import React, { useState, useEffect } from 'react';
import {
  TicketPercent,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  Tag,
} from 'lucide-react';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/common/Toast';

export const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 15,
    minimumOrderAmount: 300,
    maxDiscountAmount: 150,
    usageLimit: 200,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });

  const fetchCoupons = async () => {
    try {
      const response = await api.get('/coupons');
      setCoupons(response.data.coupons || []);
    } catch {
      showToast('Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) {
      setFormError('Please enter a coupon code and discount value.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await api.post('/coupons', {
        code: formData.code.toUpperCase().trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minimumOrderAmount: Number(formData.minimumOrderAmount),
        maxDiscountAmount: Number(formData.maxDiscountAmount),
        usageLimit: Number(formData.usageLimit),
        validUntil: formData.validUntil,
      });

      showToast(`Promo code '${formData.code.toUpperCase()}' created!`, 'success');
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create coupon';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (coupon) => {
    if (window.confirm(`Are you sure you want to deactivate code '${coupon.code}'?`)) {
      try {
        await api.delete(`/coupons/${coupon._id}`);
        setCoupons((prev) => prev.filter((c) => c._id !== coupon._id));
        showToast(`Coupon '${coupon.code}' deleted.`, 'info');
      } catch {
        showToast('Could not delete coupon', 'error');
      }
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - var(--nav-height))', backgroundColor: '#FBF9F5' }} className="admin-layout">
      <AdminSidebar />

      <main style={{ flex: 1, padding: '2rem' }} className="admin-main">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--primary-espresso)' }}>
              Coupons & Promotional Rules
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Configure automatic discount thresholds, percentage caps, and seasonal campaign codes.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> Create New Promo Code
          </button>
        </div>

        {/* Coupons Table */}
        {loading ? (
          <LoadingSpinner message="Loading active coupons..." />
        ) : (
          <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-light)' }}>
                  <th style={{ padding: '12px 10px' }}>Coupon Code</th>
                  <th style={{ padding: '12px 10px' }}>Discount</th>
                  <th style={{ padding: '12px 10px' }}>Min Order</th>
                  <th style={{ padding: '12px 10px' }}>Max Cap</th>
                  <th style={{ padding: '12px 10px' }}>Times Used</th>
                  <th style={{ padding: '12px 10px' }}>Valid Till</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const isExpired = new Date(c.validUntil) < new Date();

                  return (
                    <tr key={c._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Tag size={16} color="var(--accent-amber)" />
                          <strong style={{ fontSize: '0.95rem', color: 'var(--primary-espresso)' }}>
                            {c.code}
                          </strong>
                        </div>
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ fontWeight: 700, color: '#15803D' }}>
                          {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                        </span>
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        ₹{c.minimumOrderAmount || 0}
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        {c.maxDiscountAmount ? `₹${c.maxDiscountAmount}` : 'No Cap'}
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        {c.timesUsed || 0} / {c.usageLimit || '∞'}
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ color: isExpired ? '#DC2626' : 'var(--text-main)', fontWeight: 600 }}>
                          {new Date(c.validUntil).toLocaleDateString()}
                        </span>
                        {isExpired && (
                          <span style={{ display: 'block', fontSize: '0.68rem', color: '#DC2626' }}>
                            Expired
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteCoupon(c)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px', color: '#DC2626', borderColor: '#FECACA' }}
                          title="Delete Coupon"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Coupon Modal */}
        {isModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.65)',
              zIndex: 1100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="card"
              style={{ maxWidth: '480px', width: '100%', padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--primary-espresso)' }}>
                  Create Promotional Code
                </h3>
                <button onClick={() => setIsModalOpen(false)} style={{ padding: '6px', borderRadius: '50%', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              {formError && (
                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateCoupon}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Coupon Code (Uppercase) *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. FESTIVE25"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Discount Type
                    </label>
                    <select
                      className="input-field"
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed INR (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      min="1"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Min Order Value (₹)
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      min="0"
                      value={formData.minimumOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minimumOrderAmount: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      min="0"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      min="1"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      className="input-field"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary btn-sm"
                  >
                    {isSubmitting ? 'Creating...' : 'Save Promo Code'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @media (max-width: 900px) {
          .admin-layout { flex-direction: column !important; }
          .admin-main { padding: 1rem !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminCouponsPage;
