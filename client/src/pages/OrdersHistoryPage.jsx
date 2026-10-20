import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  QrCode,
  ArrowRight,
  RotateCcw,
  Star,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import useCart from '../hooks/useCart';
import { useToast } from '../components/common/Toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ReviewModal from '../components/customer/ReviewModal';

export const OrdersHistoryPage = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'delivered' | 'cancelled'
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/my-orders');
        setOrders(response.data.orders || []);
      } catch (err) {
        showToast('Failed to retrieve order history', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [showToast]);

  const handleReorder = (order) => {
    let count = 0;
    order.items.forEach((item) => {
      if (item.product) {
        addItem(item.product, item.quantity, item.customizations);
        count++;
      }
    });
    showToast(`Added ${count} items from Order #${order.orderNumber} to your cart!`, 'success');
    navigate('/cart');
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') {
      return ['pending', 'confirmed', 'preparing', 'ready_for_dispatch', 'out_for_delivery'].includes(
        order.orderStatus
      );
    }
    if (activeTab === 'delivered') return order.orderStatus === 'delivered';
    if (activeTab === 'cancelled') return order.orderStatus === 'cancelled';
    return true;
  });

  if (loading) {
    return <LoadingSpinner message="Retrieving your past bakery orders..." />;
  }

  return (
    <div style={{ backgroundColor: '#FAF7F2', minHeight: '85vh', padding: '2.5rem 0 4rem 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--primary-espresso)' }}>
            My Orders & Tracking
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Track live bake preparation, view express QR passes, and re-order your favorites.
          </p>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '2px solid var(--border-subtle)',
            paddingBottom: '8px',
            marginBottom: '1.5rem',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'all', label: `All Orders (${orders.length})` },
            {
              id: 'active',
              label: `In Progress (${
                orders.filter((o) =>
                  ['pending', 'confirmed', 'preparing', 'ready_for_dispatch', 'out_for_delivery'].includes(
                    o.orderStatus
                  )
                ).length
              })`,
            },
            {
              id: 'delivered',
              label: `Delivered (${orders.filter((o) => o.orderStatus === 'delivered').length})`,
            },
            {
              id: 'cancelled',
              label: `Cancelled (${orders.filter((o) => o.orderStatus === 'cancelled').length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                backgroundColor: activeTab === tab.id ? 'var(--accent-amber)' : 'transparent',
                color: activeTab === tab.id ? '#FFF' : 'var(--text-main)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '3.5rem 1.5rem',
              textAlign: 'center',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <ShoppingBag size={48} color="var(--accent-gold)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-espresso)' }}>
              No Orders Found in this Category
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Fresh pastries, savory patties, and artisan espresso are waiting for you in our catalogue.
            </p>
            <Link to="/menu" className="btn btn-primary">
              Explore Bakery Menu
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredOrders.map((order) => {
              const isDelivered = order.orderStatus === 'delivered';
              const isCancelled = order.orderStatus === 'cancelled';
              const isPickup = order.orderType === 'pickup';

              return (
                <div
                  key={order._id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'box-shadow 0.2s ease',
                  }}
                >
                  {/* Order Card Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid var(--border-subtle)',
                      paddingBottom: '12px',
                      marginBottom: '14px',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '1rem', color: 'var(--primary-espresso)' }}>
                          #{order.orderNumber}
                        </strong>
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
                          {order.orderStatus.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                        Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-espresso)' }}>
                        ₹{order.totalAmount}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {isPickup ? 'Store Pickup' : `Delivery (${order.deliveryAddress?.distanceKm || '5'} km)`}
                      </span>
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                    {order.items?.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.85rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--primary-espresso)' }}>
                            {item.quantity}x {item.name}
                          </span>
                          {item.customizations?.cakeEggless && (
                            <span style={{ fontSize: '0.7rem', color: '#16A34A' }}>🌱 Eggless</span>
                          )}
                          {item.customizations?.cakeMessage && (
                            <span style={{ fontSize: '0.72rem', fontStyle: 'italic', color: 'var(--text-light)' }}>
                              "{item.customizations.cakeMessage}"
                            </span>
                          )}
                        </div>

                        {/* Review trigger for delivered items */}
                        {isDelivered && (
                          <button
                            onClick={() => {
                              setSelectedProductForReview(item.product || { _id: item.product, name: item.name });
                              setSelectedOrderForReview(order._id);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '2px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Star size={12} color="#F59E0B" fill="#F59E0B" /> Review
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Card Actions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '12px',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <button
                      onClick={() => handleReorder(order)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
                    >
                      <RotateCcw size={14} /> Re-Order All Items
                    </button>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isPickup && (
                        <Link
                          to={`/order-tracking/${order._id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
                        >
                          <QrCode size={14} /> Pickup Pass
                        </Link>
                      )}

                      <Link
                        to={`/order-tracking/${order._id}`}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
                      >
                        Track Status <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal for Verified Reviews */}
        {selectedProductForReview && (
          <ReviewModal
            isOpen={Boolean(selectedProductForReview)}
            onClose={() => {
              setSelectedProductForReview(null);
              setSelectedOrderForReview(null);
            }}
            product={selectedProductForReview}
            orderId={selectedOrderForReview}
          />
        )}
      </div>
    </div>
  );
};

export default OrdersHistoryPage;
