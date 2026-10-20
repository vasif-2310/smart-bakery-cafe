import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Truck,
  ShoppingBag,
  CreditCard,
  Banknote,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  ArrowRight,
  ChevronRight,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import { useLocation } from '../context/LocationContext';
import { useToast } from '../components/common/Toast';
import api from '../services/api';
import DeliveryRadiusChecker from '../components/customer/DeliveryRadiusChecker';
import PaymentGatewayModal from '../components/customer/PaymentGatewayModal';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, subtotal, discount, coupon, clearCart, applyCoupon, removeCoupon } = useCart();
  const {
    storeLocation,
    userLocation,
    distanceKm,
    isEligible,
    detectGPSLocation,
    setManualLocation,
  } = useLocation();
  const { showToast } = useToast();

  const [orderType, setOrderType] = useState('delivery'); // 'delivery' | 'pickup'
  const [paymentMethod, setPaymentMethod] = useState('online_gateway'); // 'online_gateway' | 'cash_on_delivery'
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [pendingGatewayData, setPendingGatewayData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [customAddress, setCustomAddress] = useState({
    street: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    landmark: '',
    lat: 28.6315,
    lng: 77.2167,
  });
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [couponInput, setCouponInput] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Sync saved address if available
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0 && useSavedAddress) {
      const addr = user.addresses[selectedAddressIndex] || user.addresses[0];
      if (addr?.coordinates?.lat && addr?.coordinates?.lng) {
        setManualLocation(
          addr.coordinates.lat,
          addr.coordinates.lng,
          `${addr.street}, ${addr.city}`
        );
      }
    }
  }, [user, selectedAddressIndex, useSavedAddress, setManualLocation]);

  // Financial calculations
  const taxRate = 0.05; // 5% GST
  const freeDeliveryThreshold = 500;
  const standardDeliveryFee = 40;
  const deliveryFee =
    orderType === 'pickup' ? 0 : subtotal >= freeDeliveryThreshold ? 0 : standardDeliveryFee;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * taxRate);
  const finalTotal = taxableAmount + deliveryFee + tax;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = await applyCoupon(couponInput.trim());
    if (res.success) {
      showToast(`Coupon ${res.coupon.code} applied: ₹${res.discount} discount!`, 'success');
      setCouponInput('');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleGPSDetect = async () => {
    try {
      const res = await detectGPSLocation();
      if (res && res.lat) {
        setCustomAddress((prev) => ({
          ...prev,
          street: res.address || prev.street,
          lat: res.lat,
          lng: res.lng,
        }));
        setUseSavedAddress(false);
        showToast('GPS coordinates detected and verified!', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handlePlaceOrder = async () => {
    setErrorMessage('');

    // Delivery validation
    let resolvedDeliveryAddress = null;
    if (orderType === 'delivery') {
      if (useSavedAddress && user?.addresses && user.addresses.length > 0) {
        const addr = user.addresses[selectedAddressIndex];
        if (!addr) {
          setErrorMessage('Please select a valid delivery address.');
          return;
        }
        resolvedDeliveryAddress = {
          street: addr.street,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          landmark: addr.landmark,
          coordinates: addr.coordinates || {
            lat: userLocation?.lat || 28.6315,
            lng: userLocation?.lng || 77.2167,
          },
        };
      } else {
        if (!customAddress.street || !customAddress.pincode) {
          setErrorMessage('Please provide a complete street address and PIN code.');
          return;
        }
        resolvedDeliveryAddress = {
          street: customAddress.street,
          city: customAddress.city,
          state: customAddress.state,
          pincode: customAddress.pincode,
          landmark: customAddress.landmark,
          coordinates: {
            lat: customAddress.lat || userLocation?.lat || 28.6315,
            lng: customAddress.lng || userLocation?.lng || 77.2167,
          },
        };
      }

      // Check distance eligibility
      if (isEligible === false) {
        setErrorMessage(
          `Your selected address is ${distanceKm} km away. We strictly deliver within 5.0 km to keep pastries and hot café brews at peak freshness. Please switch to "Store Pickup" or pick an address within 5 km.`
        );
        return;
      }
    }

    setIsPlacingOrder(true);

    try {
      // 1. Prepare items payload
      const orderPayload = {
        orderType,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          customizations: item.customizations || {},
        })),
        deliveryAddress: orderType === 'delivery' ? resolvedDeliveryAddress : undefined,
        paymentMethod,
        couponCode: coupon?.code,
      };

      // 2. Submit Order to Backend
      const response = await api.post('/orders', orderPayload);
      const createdOrder = response.data.order;
      const paymentGateway = response.data.paymentGateway;

      // 3. Handle Payment Method Branching
      if (paymentMethod === 'online_gateway' || paymentMethod === 'razorpay_test') {
        setPendingOrder(createdOrder);
        setPendingGatewayData(paymentGateway);
        navigate(`/payment/${createdOrder._id}`, {
          state: {
            order: createdOrder,
            paymentGateway,
          },
        });
        return;
      }

      // 4. Cash on Delivery / Pay at Counter Completion
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D97706', '#F59E0B', '#10B981', '#78350F'],
        });
      } catch {
        // Fallback if canvas blocked
      }

      // 5. Clear cart and redirect
      clearCart();
      showToast('Order confirmed! Sending details to the bakery kitchen...', 'success');
      navigate(`/order-tracking/${createdOrder._id}`);
    } catch (err) {
      console.error('Order creation error:', err);
      const errorMsg =
        err.response?.data?.message || err.message || 'Order failed. Please verify your details.';
      setErrorMessage(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#FAF7F2', minHeight: '85vh', padding: '2.5rem 0 4rem 0' }}>
      <div className="container">
        {/* Breadcrumb Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '8px' }}>
            <Link to="/cart" style={{ color: 'var(--accent-amber)', textDecoration: 'none' }}>
              Cart
            </Link>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--primary-espresso)', fontWeight: 600 }}>Checkout</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--primary-espresso)' }}>
            Checkout & Confirmation
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Review order type, 5.0 km freshness geo-fence, and payment method.
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: '#FEF2F2',
              border: '1.5px solid #FECACA',
              borderRadius: 'var(--radius-md)',
              color: '#DC2626',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              fontSize: '0.9rem',
            }}
          >
            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '2px' }}>Order Attention Required:</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="checkout-grid">
          <style>{`
            @media (min-width: 992px) {
              .checkout-grid {
                grid-template-columns: 1.6fr 1fr !important;
              }
            }
          `}</style>

          {/* Left Column: Fulfillment & Payment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Step 1: Order Type Selector */}
            <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-serif)', marginBottom: '1rem', color: 'var(--primary-espresso)' }}>
                1. Select Fulfillment Mode
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${orderType === 'delivery' ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
                    backgroundColor: orderType === 'delivery' ? '#FFFBEB' : '#FFF',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Truck size={28} color={orderType === 'delivery' ? 'var(--accent-amber)' : 'var(--text-muted)'} />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-espresso)' }}>
                    Home Delivery
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textAlign: 'center' }}>
                    Strict 5.0 km Geo-Fence (~45 min)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType('pickup')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${orderType === 'pickup' ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
                    backgroundColor: orderType === 'pickup' ? '#FFFBEB' : '#FFF',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ShoppingBag size={28} color={orderType === 'pickup' ? 'var(--accent-amber)' : 'var(--text-muted)'} />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-espresso)' }}>
                    Store Pickup
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textAlign: 'center' }}>
                    Free • Connaught Place Counter
                  </span>
                </button>
              </div>

              {/* Informational Banner */}
              {orderType === 'pickup' ? (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    fontSize: '0.85rem',
                    color: '#065F46',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                  <span>
                    No distance limit! We will generate a secure HMAC QR code pass for express counter pickup at {storeLocation.address}.
                  </span>
                </div>
              ) : (
                <div style={{ marginTop: '1.25rem' }}>
                  <DeliveryRadiusChecker compact={true} />
                </div>
              )}
            </div>

            {/* Step 2: Address Section (Only for Delivery) */}
            {orderType === 'delivery' && (
              <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-espresso)' }}>
                    2. Delivery Address & GPS Coordinates
                  </h3>

                  <button
                    type="button"
                    onClick={handleGPSDetect}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
                  >
                    <Navigation size={14} /> Detect via GPS
                  </button>
                </div>

                {/* Saved addresses picker */}
                {user?.addresses && user.addresses.length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                      Choose Saved Address:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {user.addresses.map((addr, idx) => (
                        <label
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-sm)',
                            border: `1.5px solid ${useSavedAddress && selectedAddressIndex === idx ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
                            backgroundColor: useSavedAddress && selectedAddressIndex === idx ? '#FFFBEB' : '#FFF',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="radio"
                            name="delivery_address"
                            checked={useSavedAddress && selectedAddressIndex === idx}
                            onChange={() => {
                              setSelectedAddressIndex(idx);
                              setUseSavedAddress(true);
                            }}
                            style={{ marginTop: '3px' }}
                          />
                          <div>
                            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--primary-espresso)' }}>
                              {addr.label || 'Home'}: {addr.street}
                            </span>
                            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)' }}>
                              {addr.city}, {addr.state} - {addr.pincode}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setUseSavedAddress(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-amber)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginTop: '8px',
                        padding: 0,
                      }}
                    >
                      + Or Enter a New Custom Address
                    </button>
                  </div>
                )}

                {/* Custom Address Input Form */}
                {(!useSavedAddress || !user?.addresses?.length) && (
                  <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Street Address / Apartment / Flat No.
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. Flat 302, Green Avenue, Barakhamba Road"
                        value={customAddress.street}
                        onChange={(e) => setCustomAddress({ ...customAddress, street: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                          City
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          value={customAddress.city}
                          onChange={(e) => setCustomAddress({ ...customAddress, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                          PIN Code
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="110001"
                          value={customAddress.pincode}
                          onChange={(e) => setCustomAddress({ ...customAddress, pincode: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Nearby Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. Near Metro Gate No. 2"
                        value={customAddress.landmark}
                        onChange={(e) => setCustomAddress({ ...customAddress, landmark: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Payment Method */}
            <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-serif)', marginBottom: '1rem', color: 'var(--primary-espresso)' }}>
                {orderType === 'delivery' ? '3.' : '2.'} Payment Method
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Online Payment Gateway */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${paymentMethod === 'online_gateway' ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
                    backgroundColor: paymentMethod === 'online_gateway' ? '#FFFBEB' : '#FFF',
                    cursor: 'pointer',
                    boxShadow: paymentMethod === 'online_gateway' ? '0 2px 8px rgba(217, 119, 6, 0.12)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="online_gateway"
                    checked={paymentMethod === 'online_gateway'}
                    onChange={() => setPaymentMethod('online_gateway')}
                  />
                  <CreditCard size={24} color="var(--accent-amber)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--primary-espresso)' }}>
                        Online Payment Gateway
                      </span>
                      <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                        INSTANT VERIFIED
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', display: 'block' }}>
                      UPI (GPay, PhonePe, Paytm), Credit/Debit Cards (Visa, MC, RuPay) & Net Banking
                    </span>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.68rem', backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                        📱 UPI QR & ID
                      </span>
                      <span style={{ fontSize: '0.68rem', backgroundColor: '#ECFDF5', color: '#047857', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                        💳 3D Secure Card
                      </span>
                      <span style={{ fontSize: '0.68rem', backgroundColor: '#F5F3FF', color: '#6D28D9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                        🏛️ NetBanking
                      </span>
                      <span style={{ fontSize: '0.68rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                        ⚡ Razorpay
                      </span>
                    </div>
                  </div>
                </label>

                {/* Cash on Delivery / Counter */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${paymentMethod === 'cash_on_delivery' ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
                    backgroundColor: paymentMethod === 'cash_on_delivery' ? '#FFFBEB' : '#FFF',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="cash_on_delivery"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={() => setPaymentMethod('cash_on_delivery')}
                  />
                  <Banknote size={22} color="var(--accent-gold)" />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary-espresso)', display: 'block' }}>
                      {orderType === 'pickup' ? 'Pay at Bakery Counter' : 'Cash on Delivery (COD)'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                      Pay via cash, UPI, or card upon physical handover
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout Trigger */}
          <div>
            <div
              className="card"
              style={{
                padding: '1.75rem',
                borderRadius: 'var(--radius-lg)',
                position: 'sticky',
                top: 'calc(var(--nav-height) + 20px)',
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', marginBottom: '1.25rem', color: 'var(--primary-espresso)' }}>
                Order Summary
              </h3>

              {/* Items List Snapshot */}
              <div
                style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {cartItems.map((item) => (
                  <div key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--primary-espresso)' }}>
                        {item.quantity}x {item.name}
                      </span>
                      {item.customizations?.cakeEggless && (
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#16A34A' }}>
                          🌱 Eggless
                        </span>
                      )}
                      {item.customizations?.cakeMessage && (
                        <span style={{ display: 'block', fontSize: '0.72rem', fontStyle: 'italic', color: 'var(--text-light)' }}>
                          "{item.customizations.cakeMessage}"
                        </span>
                      )}
                      {item.customizations?.size && (
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-light)' }}>
                          Size: {item.customizations.size.name}
                        </span>
                      )}
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      ₹{item.finalPrice * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Promo Code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  style={{ textTransform: 'uppercase', padding: '8px 12px', fontSize: '0.85rem' }}
                />
                <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '8px 14px' }}>
                  Apply
                </button>
              </form>

              {coupon && (
                <div
                  style={{
                    backgroundColor: '#FEF3C7',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                    color: '#92400E',
                    marginBottom: '1rem',
                  }}
                >
                  <span>🎉 Code {coupon.code} (-₹{discount})</span>
                  <button
                    onClick={removeCoupon}
                    style={{ background: 'none', border: 'none', color: '#B45309', cursor: 'pointer', fontWeight: 700 }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Items Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
                    <span>Coupon Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Delivery Charge</span>
                  <span>
                    {orderType === 'pickup'
                      ? '₹0 (Store Pickup)'
                      : deliveryFee === 0
                      ? 'FREE (Above ₹500)'
                      : `₹${deliveryFee}`}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Taxes (5% GST)</span>
                  <span>₹{tax}</span>
                </div>

                <div
                  style={{
                    borderTop: '2px dashed var(--border-subtle)',
                    paddingTop: '10px',
                    marginTop: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: 'var(--primary-espresso)',
                  }}
                >
                  <span>Total Amount</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || (orderType === 'delivery' && isEligible === false)}
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <Lock size={18} />
                {isPlacingOrder
                  ? 'Initiating Secure Gateway...'
                  : orderType === 'delivery' && isEligible === false
                  ? 'Address Outside 5.0 km'
                  : paymentMethod === 'online_gateway'
                  ? `Proceed to Payment & Pay via QR • ₹${finalTotal}`
                  : `Place Order (COD) • ₹${finalTotal}`}
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  color: 'var(--text-light)',
                  marginTop: '12px',
                }}
              >
                <ShieldCheck size={14} color="#15803D" />
                <span>Protected by 256-bit SSL & Freshness Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Bank-Grade Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          showToast('Payment window closed. Order reference preserved.', 'warning');
          if (pendingOrder?._id) {
            navigate(`/order-tracking/${pendingOrder._id}`);
          }
        }}
        order={pendingOrder}
        paymentGateway={pendingGatewayData}
        user={user}
        onPaymentSuccess={(paymentRes) => {
          setShowPaymentModal(false);
          clearCart();
          showToast('Payment verified successfully! Bakery kitchen is preparing your order.', 'success');
          navigate(`/order-tracking/${pendingOrder?._id}`);
        }}
      />
    </div>
  );
};

export default CheckoutPage;
