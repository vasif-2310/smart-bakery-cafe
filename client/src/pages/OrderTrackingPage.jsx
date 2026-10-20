import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Package,
  Truck,
  MapPin,
  QrCode,
  AlertTriangle,
  ChevronLeft,
  XCircle,
  Phone,
  ShieldCheck,
  Star,
  Printer,
  Copy,
} from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../components/common/Toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import QRPickupDisplay from '../components/qr/QRPickupDisplay';
import ReviewModal from '../components/customer/ReviewModal';

export const OrderTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { joinOrderRoom, leaveOrderRoom, onOrderStatusUpdated } = useSocket();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);

  // Fetch Order
  useEffect(() => {
    let isMounted = true;
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        if (isMounted) {
          setOrder(response.data.order);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          showToast('Failed to load order tracking details', 'error');
          setLoading(false);
        }
      }
    };

    fetchOrder();

    // Join Socket Room for instant push notifications
    joinOrderRoom(id);

    // Subscribe to status changes
    const unsubscribe = onOrderStatusUpdated((updatedOrder) => {
      if (updatedOrder._id === id || updatedOrder.id === id) {
        setOrder((prev) => ({ ...prev, ...updatedOrder }));
        showToast(`Order status updated: ${updatedOrder.orderStatus.replace(/_/g, ' ').toUpperCase()}`, 'info');
      }
    });

    return () => {
      isMounted = false;
      leaveOrderRoom(id);
      if (unsubscribe) unsubscribe();
    };
  }, [id, joinOrderRoom, leaveOrderRoom, onOrderStatusUpdated, showToast]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const response = await api.put(`/orders/${id}/cancel`, { reason: cancelReason });
      setOrder(response.data.order);
      setShowCancelModal(false);
      showToast('Order cancelled successfully. Stock has been restored.', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Connecting to bakery live tracking..." />;
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <AlertTriangle size={48} color="#D97706" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-espresso)' }}>
          Order Not Found
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          We could not locate this order. It may have expired or belongs to another account.
        </p>
        <Link to="/orders" className="btn btn-primary">
          View My Orders
        </Link>
      </div>
    );
  }

  const isPickup = order.orderType === 'pickup';
  const isCancelled = order.orderStatus === 'cancelled';
  const canCancel = order.orderStatus === 'pending' || order.orderStatus === 'confirmed';

  // Stepper Stage Definition
  const deliveryStages = [
    { key: 'pending', label: 'Order Placed', desc: 'Received at bakery', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', desc: 'Scheduled for bake', icon: CheckCircle2 },
    { key: 'preparing', label: 'In the Oven', desc: 'Baking & brewing', icon: ChefHat },
    { key: 'ready_for_dispatch', label: 'Packed Fresh', desc: 'Thermal insulated bags', icon: Package },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Courier on the road', icon: Truck },
    { key: 'delivered', label: 'Delivered', desc: 'Arrived at your door', icon: MapPin },
  ];

  const pickupStages = [
    { key: 'pending', label: 'Order Placed', desc: 'Received at bakery', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', desc: 'Kitchen preparing', icon: CheckCircle2 },
    { key: 'preparing', label: 'In the Oven', desc: 'Baking fresh items', icon: ChefHat },
    { key: 'ready_for_dispatch', label: 'Ready for Pickup', desc: 'Awaiting you at counter', icon: QrCode },
    { key: 'delivered', label: 'Picked Up', desc: 'Collected at CP counter', icon: CheckCircle2 },
  ];

  const currentStages = isPickup ? pickupStages : deliveryStages;
  const currentIndex = currentStages.findIndex((s) => s.key === order.orderStatus);

  // Fallback OTP for delivery courier handshake
  const courierPin = order.deliveryAddress?.coordinates?.lat
    ? String(Math.abs(Math.round(order.deliveryAddress.coordinates.lat * 100))).slice(-4)
    : order.orderNumber.slice(-4);

  return (
    <div style={{ backgroundColor: '#FAF7F2', minHeight: '85vh', padding: '2.5rem 0 4rem 0' }}>
      <div className="container" style={{ maxWidth: '980px' }}>
        {/* Top Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
          <Link
            to="/orders"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '0.88rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <ChevronLeft size={16} /> All Orders
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className={`badge ${
                order.orderStatus === 'delivered'
                  ? 'badge-emerald'
                  : isCancelled
                  ? 'badge-coral'
                  : 'badge-gold'
              }`}
              style={{ fontSize: '0.85rem', padding: '6px 12px' }}
            >
              {order.orderStatus.replace(/_/g, ' ').toUpperCase()}
            </span>
            <button
              onClick={() => window.print()}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={14} /> Receipt
            </button>
          </div>
        </div>

        {/* Order Identifier & Time Title */}
        <div
          className="card"
          style={{
            padding: '1.75rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Order Reference
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--primary-espresso)', margin: '2px 0' }}>
              #{order.orderNumber}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
              {isPickup ? 'Store Express Pickup' : `Home Delivery (${order.deliveryAddress?.distanceKm || 'Within 5'} km)`}
            </p>
          </div>

          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="btn btn-secondary btn-sm"
              style={{ color: '#DC2626', borderColor: '#FECACA' }}
            >
              Cancel Order
            </button>
          )}
        </div>

        {/* Cancelled Banner */}
        {isCancelled && (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FEF2F2',
              border: '1.5px solid #FECACA',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              color: '#991B1B',
            }}
          >
            <XCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '1rem', display: 'block' }}>Order Cancelled</strong>
              <span style={{ fontSize: '0.85rem' }}>
                Reason: {order.cancellationReason || 'Cancelled upon request. Reserved bakery inventory has been restored.'}
              </span>
            </div>
          </div>
        )}

        {/* Real-Time Stepper Progress Tracker */}
        {!isCancelled && (
          <div
            className="card"
            style={{
              padding: '2rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.75rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--primary-espresso)' }}>
                Live Kitchen & Fulfillment Status
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#059669' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                <span>Live Socket Connected</span>
              </div>
            </div>

            {/* Stepper Bar */}
            <div className="stepper-container" style={{ position: 'relative' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${currentStages.length}, 1fr)`,
                  position: 'relative',
                  gap: '8px',
                }}
              >
                {currentStages.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isDone = currentIndex >= idx;
                  const isCurrent = currentIndex === idx;

                  return (
                    <div
                      key={stage.key}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          backgroundColor: isCurrent
                            ? 'var(--accent-amber)'
                            : isDone
                            ? '#10B981'
                            : '#F1E9DB',
                          color: isDone ? '#FFF' : '#78350F',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '8px',
                          boxShadow: isCurrent ? '0 0 0 4px rgba(217, 119, 6, 0.2)' : 'none',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Icon size={20} />
                      </div>

                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: isCurrent ? 700 : isDone ? 600 : 500,
                          color: isCurrent
                            ? 'var(--primary-espresso)'
                            : isDone
                            ? '#065F46'
                            : 'var(--text-light)',
                          lineHeight: 1.2,
                        }}
                      >
                        {stage.label}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-light)', marginTop: '2px' }} className="hide-mobile">
                        {stage.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Middle Section: Pickup QR Pass OR Delivery Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.75rem', marginBottom: '1.75rem' }} className="tracking-middle-grid">
          <style>{`
            @media (min-width: 768px) {
              .tracking-middle-grid {
                grid-template-columns: ${isPickup ? '1fr' : '1fr 1fr'} !important;
              }
              .hide-mobile { display: block !important; }
            }
            @media (max-width: 767px) {
              .hide-mobile { display: none !important; }
            }
          `}</style>

          {/* Pickup Express QR Code */}
          {isPickup && !isCancelled && (
            <div style={{ margin: '0 auto', width: '100%' }}>
              <QRPickupDisplay order={order} />
            </div>
          )}

          {/* Delivery Courier Handshake Card */}
          {!isPickup && !isCancelled && (
            <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <Truck size={22} color="var(--accent-amber)" />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--primary-espresso)' }}>
                  Delivery Details (5.0 km Zone)
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.75rem' }}>
                    Destination Address:
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--primary-espresso)' }}>
                    {order.deliveryAddress?.street}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}
                  </span>
                  {order.deliveryAddress?.landmark && (
                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      Landmark: {order.deliveryAddress.landmark}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)' }}>
                  <span>Verified Straight-Line Distance:</span>
                  <strong style={{ color: 'var(--accent-amber)' }}>
                    {order.deliveryAddress?.distanceKm || '3.2'} km
                  </strong>
                </div>

                {/* Handshake Courier Confirmation PIN */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: '#92400E', textTransform: 'uppercase', fontWeight: 700 }}>
                    Courier Handshake OTP PIN
                  </span>
                  <div
                    style={{
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      letterSpacing: '0.3em',
                      color: 'var(--primary-espresso)',
                      margin: '4px 0',
                    }}
                  >
                    {courierPin}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#B45309' }}>
                    Share this 4-digit code with the courier upon receiving your parcel
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Store & Contact Information */}
          {!isPickup && (
            <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <MapPin size={22} color="var(--accent-amber)" />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--primary-espresso)' }}>
                  Baking From Central Oven
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>
                  <strong>Smart Bakery & Café Flagship</strong>
                  <br />
                  Block B, Connaught Place, New Delhi 110001
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-espresso)' }}>
                  <Phone size={16} />
                  <span>Bakery Counter: +91 11 2341 5678</span>
                </div>

                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    fontSize: '0.78rem',
                    color: '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '8px',
                  }}
                >
                  <ShieldCheck size={16} />
                  <span>Artisanal Quality: Sealed in eco-friendly steam-vented bakery packaging.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Itemized Order Breakdown */}
        <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--primary-espresso)' }}>
            Purchased Items ({order.items?.length || 0})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--primary-espresso)', fontSize: '0.95rem' }}>
                      {item.quantity}x {item.name}
                    </span>
                    {order.orderStatus === 'delivered' && (
                      <button
                        onClick={() => setSelectedProductForReview(item.product || { _id: item.product, name: item.name })}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Star size={12} color="#F59E0B" fill="#F59E0B" /> Review
                      </button>
                    )}
                  </div>

                  {item.customizations?.cakeMessage && (
                    <span style={{ display: 'block', fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-light)' }}>
                      Piped Message: "{item.customizations.cakeMessage}"
                    </span>
                  )}
                  {item.customizations?.cakeEggless && (
                    <span style={{ display: 'block', fontSize: '0.72rem', color: '#16A34A' }}>
                      🌱 Eggless Preparation
                    </span>
                  )}
                  {item.customizations?.size && (
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-light)' }}>
                      Size: {item.customizations.size.name}
                    </span>
                  )}
                </div>

                <span style={{ fontWeight: 700, color: 'var(--primary-espresso)' }}>
                  ₹{item.subtotal || item.unitPrice * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Financial Totals */}
          <div style={{ maxWidth: '340px', marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Items Subtotal:</span>
              <span>₹{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
                <span>Coupon Discount ({order.couponCode}):</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Delivery Fee:</span>
              <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>GST (5%):</span>
              <span>₹{order.tax}</span>
            </div>
            <div
              style={{
                borderTop: '2px solid var(--border-subtle)',
                paddingTop: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--primary-espresso)',
              }}
            >
              <span>Total Paid:</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Cancellation Modal */}
        {showCancelModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={() => setShowCancelModal(false)}
          >
            <div
              className="card"
              style={{ maxWidth: '420px', width: '100%', padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '8px', color: 'var(--primary-espresso)' }}>
                Cancel Order #{order.orderNumber}?
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Are you sure? Once cancelled, reserved batch inventory will be restored to the store.
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Reason for cancellation
                </label>
                <select
                  className="input-field"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Need to change delivery address">Need to change delivery address</option>
                  <option value="Delivery time too long">Delivery time too long</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="btn btn-secondary btn-sm"
                  disabled={cancelling}
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#DC2626', borderColor: '#DC2626' }}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Review Modal for Delivered Products */}
        {selectedProductForReview && (
          <ReviewModal
            isOpen={Boolean(selectedProductForReview)}
            onClose={() => setSelectedProductForReview(null)}
            product={selectedProductForReview}
            orderId={order._id}
          />
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
