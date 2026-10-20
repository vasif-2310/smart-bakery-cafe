import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  CreditCard,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import useCart from '../hooks/useCart';

export const CartPage = () => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discount,
    deliveryFee,
    tax,
    total,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    await applyCouponCode(couponInput.trim().toUpperCase());
    setCouponLoading(false);
    setCouponInput('');
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#F3ECE2',
            color: 'var(--accent-amber)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
          }}
        >
          <ShoppingBag size={40} />
        </div>
        <h2 style={{ fontSize: '2rem', color: 'var(--primary-espresso)', marginBottom: '8px' }}>
          Your Basket is Fresh &amp; Empty
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '420px', margin: '0 auto 2rem auto' }}>
          Looks like you haven't selected any treats yet. Discover artisanal chocolate cakes, warm croissants, and handcrafted coffees.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/menu" className="btn btn-primary btn-lg">
            Explore Fresh Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        {/* Title */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase' }}>
            Review Selections
          </span>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--primary-espresso)' }}>Your Shopping Cart</h1>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Cart Line Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                {items.length} Unique {items.length === 1 ? 'Delight' : 'Delights'} in Cart
              </span>
              <button
                onClick={clearCart}
                style={{ color: '#DC2626', fontSize: '0.85rem', fontWeight: 600 }}
              >
                Clear Cart
              </button>
            </div>

            {items.map((item) => (
              <div
                key={item.itemKey}
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: '16px',
                  border: '1px solid var(--border-subtle)',
                  padding: '1.25rem',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {/* Thumbnail */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = '/placeholder-food.svg';
                  }}
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />

                {/* Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-espresso)' }}>{item.name}</h3>
                    <button
                      onClick={() => removeFromCart(item.itemKey)}
                      aria-label="Remove item"
                      style={{ color: '#9CA3AF', padding: '4px' }}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
                    {item.category}
                  </span>

                  {/* Render Customizations */}
                  {item.customizations && (
                    <div style={{ margin: '4px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {item.customizations.size && <div>Size: {item.customizations.size.name}</div>}
                      {item.customizations.flavor && <div>Flavor: {item.customizations.flavor}</div>}
                      {item.customizations.frosting && <div>Frosting: {item.customizations.frosting}</div>}
                      {item.customizations.customMessage && (
                        <div style={{ fontStyle: 'italic', color: '#B45309' }}>
                          Piping: "{item.customizations.customMessage}"
                        </div>
                      )}
                      {item.customizations.temperature && <div>Temp: {item.customizations.temperature}</div>}
                      {item.customizations.sweetness && <div>Sweetness: {item.customizations.sweetness}</div>}
                      {item.customizations.beverageAddons?.map((a) => (
                        <div key={a.name}>Add-on: {a.name}</div>
                      ))}
                    </div>
                  )}

                  {/* Price & Quantity Controls */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '8px',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary-espresso)' }}>
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>

                    {/* Quantity modifier buttons */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        backgroundColor: '#FAF6F0',
                        borderRadius: '20px',
                        padding: '4px 8px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}
                        style={{ display: 'flex', padding: '2px' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', minWidth: '18px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}
                        style={{ display: 'flex', padding: '2px' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Order Summary & Coupon Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Coupon Code Section */}
            <div
              style={{
                backgroundColor: '#FFF',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h4 style={{ fontSize: '1rem', color: 'var(--primary-espresso)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={16} color="var(--accent-amber)" /> Apply Promo Voucher
              </h4>

              {appliedCoupon ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#DCFCE7',
                    border: '1px solid #86EFAC',
                    color: '#15803D',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} /> {appliedCoupon.code} (Saved ₹{appliedCoupon.discount})
                  </span>
                  <button onClick={removeCoupon} style={{ color: '#15803D', display: 'flex' }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="e.g. WELCOME50, BAKERY100"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-subtle)',
                      outline: 'none',
                      fontSize: '0.85rem',
                      textTransform: 'uppercase',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="btn btn-secondary btn-sm"
                  >
                    {couponLoading ? 'Checking...' : 'Apply'}
                  </button>
                </form>
              )}
            </div>

            {/* Financial Breakdown Card */}
            <div
              style={{
                backgroundColor: '#FFF',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-espresso)', marginBottom: '1.25rem' }}>
                Price Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Items Subtotal</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803D' }}>
                    <span>Coupon Discount</span>
                    <span style={{ fontWeight: 600 }}>-{formatCurrency(discount)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated Delivery Fee (within 5 km)</span>
                  <span style={{ fontWeight: 600 }}>
                    {deliveryFee === 0 ? <span style={{ color: '#15803D' }}>FREE</span> : formatCurrency(deliveryFee)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Taxes &amp; GST (5%)</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(tax)}</span>
                </div>
              </div>

              {/* Free Delivery Bar */}
              {subtotal < 500 && (
                <div
                  style={{
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  Add <strong>{formatCurrency(500 - subtotal)}</strong> more for <strong>FREE Delivery</strong>!
                </div>
              )}

              {/* Grand Total */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  paddingTop: '1rem',
                  borderTop: '2px solid var(--border-subtle)',
                  marginBottom: '1.5rem',
                }}
              >
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-espresso)' }}>
                  Grand Total
                </span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-espresso)' }}>
                  {formatCurrency(total)}
                </span>
              </div>

              <button
                onClick={() => navigate('/payment')}
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                Proceed to Checkout <ArrowRight size={20} />
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  color: 'var(--text-light)',
                  marginTop: '6px',
                }}
              >
                <ShieldCheck size={14} color="#15803D" />
                <span>Strict 5.0 km Freshness Guarantee &bull; 256-bit Secure UPI Pay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
