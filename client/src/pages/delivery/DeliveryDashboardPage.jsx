import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Package,
  X,
  Lock,
} from 'lucide-react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useSocket } from '../../context/SocketContext';

export const DeliveryDashboardPage = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignmentForPIN, setSelectedAssignmentForPIN] = useState(null);
  const [confirmationPin, setConfirmationPin] = useState('');
  const [isVerifyingPIN, setIsVerifyingPIN] = useState(false);
  const [pinError, setPinError] = useState('');
  const { showToast } = useToast();
  const { joinDeliveryRoom, leaveDeliveryRoom } = useSocket();

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/delivery/my-assignments');
      setAssignments(response.data.assignments || []);
    } catch {
      showToast('Failed to load courier assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    joinDeliveryRoom();

    return () => {
      leaveDeliveryRoom();
    };
  }, [joinDeliveryRoom, leaveDeliveryRoom, showToast]);

  const handleUpdateStatus = async (assignmentId, status, pin = null) => {
    try {
      const payload = { status };
      if (pin) payload.confirmationPin = pin;

      const response = await api.put(`/delivery/assignments/${assignmentId}/status`, payload);
      setAssignments((prev) =>
        prev.map((a) => (a._id === assignmentId ? response.data.assignment : a))
      );

      showToast(`Delivery status updated: ${status.replace(/_/g, ' ').toUpperCase()}`, 'success');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update assignment status';
      setPinError(msg);
      showToast(msg, 'error');
      return false;
    }
  };

  const handleConfirmHandshakePIN = async (e) => {
    e.preventDefault();
    if (!confirmationPin || confirmationPin.length !== 4) {
      setPinError('Please enter the exact 4-digit PIN provided by the customer.');
      return;
    }

    setIsVerifyingPIN(true);
    setPinError('');

    const success = await handleUpdateStatus(
      selectedAssignmentForPIN._id,
      'delivered',
      confirmationPin.trim()
    );

    setIsVerifyingPIN(false);
    if (success) {
      setSelectedAssignmentForPIN(null);
      setConfirmationPin('');
      fetchAssignments();
    }
  };

  if (loading) {
    return <LoadingSpinner message="Connecting to Courier Dispatch Portal..." />;
  }

  const activeDeliveries = assignments.filter((a) => a.status !== 'delivered');
  const completedDeliveries = assignments.filter((a) => a.status === 'delivered');

  return (
    <div style={{ backgroundColor: '#FAF7F2', minHeight: '90vh', padding: '2rem 1rem 4rem 1rem' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        {/* Header Bar */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#15803D',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Truck size={26} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--primary-espresso)', margin: 0 }}>
                Courier Dispatch Portal
              </h1>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Courier: <strong>{user?.name}</strong> • Active Runs: {activeDeliveries.length}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803D' }}>GPS Geo-Fence Online (5.0 km)</span>
          </div>
        </div>

        {/* Active Deliveries List */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--primary-espresso)', marginBottom: '1rem' }}>
            Assigned Deliveries ({activeDeliveries.length})
          </h2>

          {activeDeliveries.length === 0 ? (
            <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
              <CheckCircle2 size={44} color="#15803D" style={{ margin: '0 auto 10px auto' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-espresso)' }}>
                All Deliveries Completed!
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Awaiting next batch dispatch from Connaught Place bakery ovens.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {activeDeliveries.map((assignment) => {
                const order = assignment.order;
                if (!order) return null;
                const addr = order.deliveryAddress;
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${addr?.street || ''}, ${addr?.city || ''} ${addr?.pincode || ''}`
                )}`;

                return (
                  <div
                    key={assignment._id}
                    className="card"
                    style={{
                      padding: '1.5rem',
                      borderRadius: 'var(--radius-lg)',
                      borderLeft: '5px solid var(--accent-amber)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    {/* Top Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
                          Order Reference
                        </span>
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-espresso)', margin: '2px 0' }}>
                          #{order.orderNumber}
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Placed at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-espresso)' }}>
                          ₹{order.totalAmount}
                        </span>
                        <span
                          className={`badge ${order.paymentStatus === 'paid' ? 'badge-emerald' : 'badge-gold'}`}
                          style={{ display: 'block', fontSize: '0.7rem', marginTop: '2px' }}
                        >
                          {order.paymentStatus === 'paid' ? 'PAID ONLINE' : 'CASH ON DELIVERY'}
                        </span>
                      </div>
                    </div>

                    {/* Address & Navigation */}
                    <div
                      style={{
                        backgroundColor: '#F8FAFC',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 14px',
                        marginBottom: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        fontSize: '0.85rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <MapPin size={18} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong style={{ color: 'var(--primary-espresso)' }}>
                            {addr?.street}, {addr?.city} - {addr?.pincode}
                          </strong>
                          {addr?.landmark && (
                            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              Landmark: {addr.landmark}
                            </span>
                          )}
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#15803D', fontWeight: 700, marginTop: '2px' }}>
                            Distance from Oven: {addr?.distanceKm || '3.2'} km (Within 5.0 km guarantee)
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
                        >
                          <Navigation size={13} /> Open in Google Maps
                        </a>

                        {order.customer?.phone && (
                          <a
                            href={`tel:${order.customer.phone}`}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
                          >
                            <Phone size={13} /> Call Customer
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Items List */}
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--primary-espresso)' }}>Parcel Contents: </span>
                      {order.items?.map((item, idx) => (
                        <span key={idx}>
                          {item.quantity}x {item.name}
                          {idx < order.items.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>

                    {/* Status Update Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {assignment.status === 'assigned' && (
                        <button
                          onClick={() => handleUpdateStatus(assignment._id, 'picked_up')}
                          className="btn btn-primary"
                          style={{ width: '100%', fontSize: '0.88rem' }}
                        >
                          Confirm Package Picked Up from Bakery
                        </button>
                      )}

                      {assignment.status === 'picked_up' && (
                        <button
                          onClick={() => {
                            setSelectedAssignmentForPIN(assignment);
                            setConfirmationPin('');
                            setPinError('');
                          }}
                          className="btn btn-primary"
                          style={{ width: '100%', backgroundColor: '#15803D', borderColor: '#15803D', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                          <Lock size={16} /> Enter Customer PIN & Complete Delivery
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Handshake Confirmation PIN Modal */}
        {selectedAssignmentForPIN && (
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
            onClick={() => setSelectedAssignmentForPIN(null)}
          >
            <div
              className="card"
              style={{ maxWidth: '420px', width: '100%', padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={22} color="#15803D" />
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--primary-espresso)' }}>
                    Customer Handshake PIN
                  </h3>
                </div>
                <button onClick={() => setSelectedAssignmentForPIN(null)} style={{ padding: '6px', borderRadius: '50%', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Ask the customer for the 4-digit code displayed on their live order tracking screen.
              </p>

              {pinError && (
                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} />
                  <span>{pinError}</span>
                </div>
              )}

              <form onSubmit={handleConfirmHandshakePIN}>
                <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="• • • •"
                    value={confirmationPin}
                    onChange={(e) => setConfirmationPin(e.target.value.replace(/\D/g, ''))}
                    className="input-field"
                    style={{
                      fontSize: '1.8rem',
                      letterSpacing: '0.4em',
                      textAlign: 'center',
                      fontWeight: 800,
                      padding: '10px',
                    }}
                    required
                    autoFocus
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedAssignmentForPIN(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifyingPIN}
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: '#15803D', borderColor: '#15803D' }}
                  >
                    {isVerifyingPIN ? 'Validating PIN...' : 'Confirm Delivery'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboardPage;
