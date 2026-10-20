import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Truck,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/common/Toast';
import { useSocket } from '../../context/SocketContext';

// Legal state machine transitions
const NEXT_STATUS_MAP = {
  pending: { next: 'confirmed', label: 'Confirm Order' },
  confirmed: { next: 'preparing', label: 'Send to Oven' },
  preparing: { next: 'ready_for_dispatch', label: 'Mark Ready' },
  ready_for_dispatch: { next: 'out_for_delivery', label: 'Dispatch Courier' },
  out_for_delivery: { next: 'delivered', label: 'Mark Delivered' },
};

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [deliveryAgents, setDeliveryAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrderForCourier, setSelectedOrderForCourier] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [showQRVerifyModal, setShowQRVerifyModal] = useState(false);
  const [scannedQRToken, setScannedQRToken] = useState('');
  const [isVerifyingQR, setIsVerifyingQR] = useState(false);

  const { showToast } = useToast();
  const { onOrderStatusUpdated, onNewOrder } = useSocket();

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data.orders || []);
    } catch {
      showToast('Failed to retrieve orders list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryAgents = async () => {
    try {
      const response = await api.get('/admin/delivery-agents');
      setDeliveryAgents(response.data.agents || []);
    } catch (err) {
      console.warn('Could not load delivery agents:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchDeliveryAgents();

    // Listen for live new orders or status updates
    const unsubStatus = onOrderStatusUpdated((updated) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id || o.id === updated._id ? { ...o, ...updated } : o))
      );
    });

    const unsubNew = onNewOrder((newOrd) => {
      setOrders((prev) => [newOrd, ...prev]);
      showToast(`🔔 New Order #${newOrd.orderNumber} placed!`, 'info');
    });

    return () => {
      if (unsubStatus) unsubStatus();
      if (unsubNew) unsubNew();
    };
  }, [onOrderStatusUpdated, onNewOrder, showToast]);

  const handleAdvanceStatus = async (orderId, targetStatus) => {
    try {
      const response = await api.put(`/admin/orders/${orderId}/status`, { status: targetStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? response.data.order : o))
      );
      showToast(`Order status updated to ${targetStatus.replace(/_/g, ' ').toUpperCase()}`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Status transition denied by rule', 'error');
    }
  };

  const handleAssignCourier = async (e) => {
    e.preventDefault();
    if (!selectedAgentId) {
      showToast('Please select a delivery agent', 'error');
      return;
    }

    setIsAssigning(true);
    try {
      const response = await api.post(`/admin/orders/${selectedOrderForCourier._id}/assign-delivery`, {
        agentId: selectedAgentId,
        notes: 'Hand over insulated bakery bag with hot coffee pack.',
      });

      setOrders((prev) =>
        prev.map((o) => (o._id === selectedOrderForCourier._id ? response.data.order : o))
      );
      showToast(`Assigned courier successfully to Order #${selectedOrderForCourier.orderNumber}!`, 'success');
      setSelectedOrderForCourier(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to assign courier', 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleVerifyQRToken = async (e) => {
    e.preventDefault();
    if (!scannedQRToken.trim()) {
      showToast('Please enter the token string from customer pass', 'error');
      return;
    }

    setIsVerifyingQR(true);
    try {
      const response = await api.post('/orders/verify-pickup', { token: scannedQRToken.trim() });
      showToast(response.data.message || 'Counter pickup verified!', 'success');
      setScannedQRToken('');
      setShowQRVerifyModal(false);
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid or expired QR token', 'error');
    } finally {
      setIsVerifyingQR(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.deliveryAddress?.city?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - var(--nav-height))', backgroundColor: '#FBF9F5' }} className="admin-layout">
      <AdminSidebar />

      <main style={{ flex: 1, padding: '2rem' }} className="admin-main">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--primary-espresso)' }}>
              Orders & Dispatch Management
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Live lifecycle supervision, courier dispatch, and express QR counter scanning.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowQRVerifyModal(true)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <QrCode size={16} /> Verify Counter QR Pass
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search by Order # or Customer..."
              className="input-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
            />
          </div>

          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'preparing', label: 'In Oven' },
              { id: 'ready_for_dispatch', label: 'Ready' },
              { id: 'out_for_delivery', label: 'Out for Delivery' },
              { id: 'delivered', label: 'Delivered' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: statusFilter === tab.id ? 'var(--accent-amber)' : '#FFF',
                  color: statusFilter === tab.id ? '#FFF' : 'var(--text-main)',
                  fontWeight: statusFilter === tab.id ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <LoadingSpinner message="Retrieving orders..." />
        ) : (
          <div className="card" style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-light)' }}>
                  <th style={{ padding: '12px 10px' }}>Order Ref</th>
                  <th style={{ padding: '12px 10px' }}>Customer & Destination</th>
                  <th style={{ padding: '12px 10px' }}>Type</th>
                  <th style={{ padding: '12px 10px' }}>Total Amount</th>
                  <th style={{ padding: '12px 10px' }}>Status</th>
                  <th style={{ padding: '12px 10px' }}>Courier</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => {
                  const transition = NEXT_STATUS_MAP[ord.orderStatus];
                  const isPickup = ord.orderType === 'pickup';
                  const isDelivered = ord.orderStatus === 'delivered';
                  const isCancelled = ord.orderStatus === 'cancelled';

                  return (
                    <tr key={ord._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {/* Order Ref */}
                      <td style={{ padding: '12px 10px' }}>
                        <strong style={{ display: 'block', color: 'var(--primary-espresso)' }}>
                          #{ord.orderNumber}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                          {ord.items?.length || 0} items
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--primary-espresso)', display: 'block' }}>
                          {ord.customer?.name || 'Customer'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {isPickup
                            ? 'Flagship Counter Pickup'
                            : `${ord.deliveryAddress?.street || 'Connaught Place'}, ${ord.deliveryAddress?.city || 'Delhi'}`}
                        </span>
                      </td>

                      {/* Fulfillment Type */}
                      <td style={{ padding: '12px 10px' }}>
                        <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                          {isPickup ? 'Store Pickup' : `${ord.deliveryAddress?.distanceKm || '5.0'} km`}
                        </span>
                      </td>

                      {/* Total */}
                      <td style={{ padding: '12px 10px' }}>
                        <strong style={{ color: 'var(--primary-espresso)' }}>₹{ord.totalAmount}</strong>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: ord.paymentStatus === 'paid' ? '#15803D' : '#D97706' }}>
                          {ord.paymentStatus?.toUpperCase()} ({ord.paymentMethod?.toUpperCase()})
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 10px' }}>
                        <span
                          className={`badge ${
                            isDelivered
                              ? 'badge-emerald'
                              : isCancelled
                              ? 'badge-coral'
                              : 'badge-gold'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {ord.orderStatus?.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>

                      {/* Courier Assignment */}
                      <td style={{ padding: '12px 10px' }}>
                        {!isPickup && !isDelivered && !isCancelled && (
                          ord.deliveryAssignment ? (
                            <span style={{ fontSize: '0.78rem', color: '#15803D', fontWeight: 600 }}>
                              ✓ Courier Assigned
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedOrderForCourier(ord);
                                setSelectedAgentId(deliveryAgents[0]?._id || '');
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Truck size={12} /> Assign Agent
                            </button>
                          )
                        )}
                        {isPickup && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                            Counter Pickup
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        {transition && !isCancelled ? (
                          <button
                            onClick={() => handleAdvanceStatus(ord._id, transition.next)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          >
                            {transition.label} →
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Courier Assignment Modal */}
        {selectedOrderForCourier && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              zIndex: 1100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={() => setSelectedOrderForCourier(null)}
          >
            <div
              className="card"
              style={{ maxWidth: '420px', width: '100%', padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '8px', color: 'var(--primary-espresso)' }}>
                Assign Delivery Courier
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Order #{selectedOrderForCourier.orderNumber} ({selectedOrderForCourier.deliveryAddress?.distanceKm || '3.5'} km)
              </p>

              <form onSubmit={handleAssignCourier}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Select Courier Agent
                  </label>
                  <select
                    className="input-field"
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Courier --</option>
                    {deliveryAgents.map((ag) => (
                      <option key={ag._id} value={ag._id}>
                        🛵 {ag.name} ({ag.phone || 'Ready'})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedOrderForCourier(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAssigning}
                    className="btn btn-primary btn-sm"
                  >
                    {isAssigning ? 'Assigning...' : 'Dispatch Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Counter QR Pass Verification Modal */}
        {showQRVerifyModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              zIndex: 1100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={() => setShowQRVerifyModal(false)}
          >
            <div
              className="card"
              style={{ maxWidth: '440px', width: '100%', padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <QrCode size={24} color="var(--accent-amber)" />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--primary-espresso)' }}>
                  Verify Counter Pickup Pass
                </h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Enter the HMAC encrypted token string from the customer's phone QR pass to confirm pickup.
              </p>

              <form onSubmit={handleVerifyQRToken}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Scanned Token String
                  </label>
                  <textarea
                    rows={3}
                    className="input-field"
                    placeholder="Paste signed QR token payload here..."
                    value={scannedQRToken}
                    onChange={(e) => setScannedQRToken(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowQRVerifyModal(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifyingQR}
                    className="btn btn-primary btn-sm"
                  >
                    {isVerifyingQR ? 'Verifying...' : 'Confirm Handover'}
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

export default AdminOrdersPage;
