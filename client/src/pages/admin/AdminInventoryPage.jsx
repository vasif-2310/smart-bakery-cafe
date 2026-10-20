import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Layers,
} from 'lucide-react';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import BatchModal from '../../components/admin/BatchModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/common/Toast';

export const AdminInventoryPage = () => {
  const [inventoryData, setInventoryData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchInventory = async () => {
    try {
      const [invRes, prodRes] = await Promise.all([
        api.get('/admin/inventory'),
        api.get('/products'),
      ]);
      setInventoryData(invRes.data);
      setProducts(prodRes.data.products || []);
    } catch {
      showToast('Failed to load inventory batches', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Auditing bakery batch freshness (FEFO)..." />;
  }

  const {
    lowStockProducts = [],
    batches = [],
    totalBatches = 0,
    expiredBatches = 0,
  } = inventoryData || {};

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - var(--nav-height))', backgroundColor: '#FBF9F5' }} className="admin-layout">
      <AdminSidebar />

      <main style={{ flex: 1, padding: '2rem' }} className="admin-main">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--primary-espresso)' }}>
              Inventory & Freshness Control (FEFO)
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              First-Expired-First-Out automated batch allocation prevents pastry wastage and maintains supreme freshness.
            </p>
          </div>

          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> Add Freshness Batch
          </button>
        </div>

        {/* 3 Overview Stat Chips */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 600 }}>Active Tracked Batches</span>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--primary-espresso)', margin: '4px 0' }}>{totalBatches}</h3>
            <span style={{ fontSize: '0.75rem', color: '#15803D' }}>Strict expiry auditing enabled</span>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 600 }}>Low Stock Alerts</span>
            <h3 style={{ fontSize: '1.6rem', color: lowStockProducts.length > 0 ? '#DC2626' : '#15803D', margin: '4px 0' }}>
              {lowStockProducts.length}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Items with &lt; 20 units available</span>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 600 }}>Expired / Depleted Batches</span>
            <h3 style={{ fontSize: '1.6rem', color: expiredBatches > 0 ? '#D97706' : '#15803D', margin: '4px 0' }}>
              {expiredBatches}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automatically de-listed</span>
          </div>
        </div>

        {/* Low Stock Urgent Replenishment Banner */}
        {lowStockProducts.length > 0 && (
          <div
            className="card"
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#FEF2F2',
              border: '1.5px solid #FECACA',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <AlertTriangle size={22} color="#DC2626" />
              <h3 style={{ fontSize: '1.15rem', color: '#991B1B', fontFamily: 'var(--font-serif)' }}>
                Low Stock Urgent Attention Required ({lowStockProducts.length} Items)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              {lowStockProducts.map((p) => (
                <div
                  key={p._id}
                  style={{
                    backgroundColor: '#FFF',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #FCA5A5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--primary-espresso)', display: 'block' }}>
                      {p.name}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {p.category}
                    </span>
                  </div>
                  <span style={{ fontWeight: 800, color: '#DC2626', fontSize: '1rem' }}>
                    {p.stockQuantity} left
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FEFO Batches Table */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="var(--accent-amber)" />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--primary-espresso)' }}>
                Active Lots in FEFO Deduction Order
              </h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Ordered by earliest expiration
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-light)' }}>
                  <th style={{ padding: '12px 10px' }}>Batch Lot #</th>
                  <th style={{ padding: '12px 10px' }}>Product</th>
                  <th style={{ padding: '12px 10px' }}>Units (Remaining / Total)</th>
                  <th style={{ padding: '12px 10px' }}>Baking Date</th>
                  <th style={{ padding: '12px 10px' }}>Expiry Date</th>
                  <th style={{ padding: '12px 10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => {
                  const now = new Date();
                  const exp = new Date(batch.expiryDate);
                  const daysLeft = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
                  const isExpired = daysLeft <= 0;
                  const pct = Math.round((batch.remainingQuantity / batch.quantity) * 100);

                  return (
                    <tr key={batch._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--primary-espresso)' }}>
                        {batch.batchNumber}
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--primary-espresso)' }}>
                          {batch.product?.name || 'Artisanal Bake'}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {batch.product?.category}
                        </span>
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700 }}>
                            {batch.remainingQuantity} / {batch.quantity}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                            ({pct}%)
                          </span>
                        </div>
                        <div style={{ width: '90px', height: '5px', backgroundColor: '#F1E9DB', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct > 25 ? '#10B981' : '#DC2626' }} />
                        </div>
                      </td>

                      <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                        {new Date(batch.manufacturingDate).toLocaleDateString()}
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ fontWeight: 600, color: isExpired ? '#DC2626' : daysLeft <= 1 ? '#D97706' : '#15803D' }}>
                          {exp.toLocaleDateString()}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-light)' }}>
                          {isExpired ? 'Expired' : `${daysLeft} day(s) left`}
                        </span>
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        <span
                          className={`badge ${
                            batch.status === 'active' && !isExpired
                              ? 'badge-emerald'
                              : 'badge-coral'
                          }`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {isExpired ? 'EXPIRED' : batch.status?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Batch Modal */}
        {isBatchModalOpen && (
          <BatchModal
            isOpen={isBatchModalOpen}
            onClose={() => setIsBatchModalOpen(false)}
            products={products}
            onBatchCreated={() => fetchInventory()}
          />
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

export default AdminInventoryPage;
