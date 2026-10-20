import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ChefHat,
  Truck,
  Plus,
  ArrowRight,
  Download,
  CheckCircle2,
  Package,
} from 'lucide-react';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/common/Toast';

export const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/admin/analytics');
        setAnalytics(response.data);
      } catch (err) {
        showToast('Failed to load administrative analytics', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [showToast]);

  const handleExportCSV = async () => {
    try {
      showToast('Generating comprehensive sales report...', 'info');
      const response = await api.get('/admin/analytics/export-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `smart-bakery-sales-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Sales report downloaded successfully!', 'success');
    } catch {
      showToast('Failed to export CSV report', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calculating real-time bakery metrics..." />;
  }

  const {
    totalRevenue = 0,
    totalOrders = 0,
    deliveredOrders = 0,
    cancelledOrders = 0,
    avgOrderValue = 0,
    topSellingProducts = [],
    recentOrders = [],
    categorySales = [],
  } = analytics || {};

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - var(--nav-height))', backgroundColor: '#FBF9F5' }} className="admin-layout">
      <AdminSidebar />

      <main style={{ flex: 1, padding: '2rem' }} className="admin-main">
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--primary-espresso)' }}>
              Operational Overview
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Live metrics across oven throughput, 5km geo-deliveries, and sales performance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleExportCSV}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={15} /> Export CSV Report
            </button>
            <Link
              to="/kitchen"
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#0284C7', borderColor: '#0284C7' }}
            >
              <ChefHat size={15} /> Open Kitchen KDS
            </Link>
          </div>
        </div>

        {/* 4 Key Stat Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          {/* Revenue */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Total Paid Revenue
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-espresso)', margin: '4px 0' }}>
                  ₹{totalRevenue.toLocaleString()}
                </h2>
                <span style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: 600 }}>
                  Avg Order: ₹{avgOrderValue}
                </span>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={20} color="var(--accent-amber)" />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Orders Processed
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-espresso)', margin: '4px 0' }}>
                  {totalOrders}
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {deliveredOrders} Delivered • {cancelledOrders} Cancelled
                </span>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={20} color="#0284C7" />
              </div>
            </div>
          </div>

          {/* Fulfillment Success Rate */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Delivery Radius Limit
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#15803D', margin: '4px 0' }}>
                  5.0 km
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Haversine Straight-Line Active
                </span>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={20} color="#10B981" />
              </div>
            </div>
          </div>

          {/* Quick Action - Inventory */}
          <Link
            to="/admin/inventory"
            className="card card-interactive"
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#FFFBEB',
              border: '1.5px dashed var(--accent-gold)',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={22} color="var(--accent-amber)" />
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-espresso)', display: 'block' }}>
                  Manage Inventory
                </span>
                <span style={{ fontSize: '0.75rem', color: '#854D0E' }}>
                  Add Batches & Track FEFO Expiry →
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Middle Two-Column Grid: Category Split & Bestsellers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Category Distribution */}
          <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', marginBottom: '1.25rem', color: 'var(--primary-espresso)' }}>
              Revenue by Category
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {categorySales.map((cat, i) => {
                const colors = ['#D97706', '#DC2626', '#0284C7'];
                const color = colors[i % colors.length];
                const pct = totalRevenue > 0 ? Math.round((cat.revenue / totalRevenue) * 100) : 33;

                return (
                  <div key={cat._id || i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--primary-espresso)' }}>
                        {cat._id || 'Unassigned'}
                      </span>
                      <span style={{ fontWeight: 700 }}>₹{cat.revenue?.toLocaleString() || 0} ({pct}%)</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#F1E9DB', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', marginBottom: '1.25rem', color: 'var(--primary-espresso)' }}>
              Top Selling Delights
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topSellingProducts.slice(0, 5).map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--accent-gold)', width: '18px' }}>
                      #{idx + 1}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--primary-espresso)' }}>
                      {item.name}
                    </span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
                    {item.totalSold} sold
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--primary-espresso)' }}>
              Recent Customer Orders
            </h3>
            <Link
              to="/admin/orders"
              style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View All Orders <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-light)' }}>
                  <th style={{ padding: '10px' }}>Order #</th>
                  <th style={{ padding: '10px' }}>Customer</th>
                  <th style={{ padding: '10px' }}>Type</th>
                  <th style={{ padding: '10px' }}>Total</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
                  <tr key={ord._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--primary-espresso)' }}>
                      #{ord.orderNumber}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      {ord.customer?.name || 'Guest User'}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                        {ord.orderType?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: 700 }}>
                      ₹{ord.totalAmount}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span
                        className={`badge ${
                          ord.orderStatus === 'delivered'
                            ? 'badge-emerald'
                            : ord.orderStatus === 'cancelled'
                            ? 'badge-coral'
                            : 'badge-gold'
                        }`}
                        style={{ fontSize: '0.72rem' }}
                      >
                        {ord.orderStatus?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <Link to="/admin/orders" className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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

export default AdminDashboardPage;
