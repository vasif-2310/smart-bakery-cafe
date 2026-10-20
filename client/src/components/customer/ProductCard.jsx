import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, Plus, Sparkles, SlidersHorizontal } from 'lucide-react';
import { formatCurrency, formatPrepTime } from '../../utils/formatters';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import CakeBuilderModal from './CakeBuilderModal';
import BeverageCustomizerModal from './BeverageCustomizerModal';

export const ProductCard = ({ product }) => {
  const { user, toggleFavorite } = useAuth();
  const { addToCart } = useCart();
  const [showCakeModal, setShowCakeModal] = useState(false);
  const [showBeverageModal, setShowBeverageModal] = useState(false);

  const isFavorite = user?.favorites?.some(
    (fav) => (fav._id || fav).toString() === product._id.toString()
  );

  const isCake =
    product.category === 'Bakery' &&
    product.customizationOptions?.sizes?.length > 0 &&
    product.customizationOptions?.allowCustomMessage;

  const isCustomizableBeverage =
    product.category === 'Cafe' &&
    (product.customizationOptions?.sizes?.length > 0 ||
      product.customizationOptions?.beverageAddons?.length > 0);

  const handleActionClick = () => {
    if (isCake) {
      setShowCakeModal(true);
    } else if (isCustomizableBeverage) {
      setShowBeverageModal(true);
    } else {
      addToCart(product, 1);
    }
  };

  const isOutOfStock = !product.isAvailable || product.stockQuantity <= 0;

  return (
    <>
      <div className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Product Image & Badges Container */}
        <div style={{ position: 'relative', height: '210px', overflow: 'hidden', backgroundColor: '#F3ECE2' }}>
          <Link to={`/product/${product.slug || product._id}`}>
            <img
              src={product.imageUrl}
              alt={product.name}
              onError={(e) => {
                e.target.src = '/placeholder-food.svg';
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.4s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          </Link>

          {/* Veg / Non-Veg Indicator Badge */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              display: 'flex',
              gap: '6px',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                border: `2px solid ${product.isVegetarian ? '#15803D' : '#B91C1C'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              title={product.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: product.isVegetarian ? '50%' : '2px',
                  backgroundColor: product.isVegetarian ? '#15803D' : '#B91C1C',
                }}
              />
            </div>

            {product.isFeatured && (
              <span className="badge badge-gold" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Sparkles size={11} /> Chef's Pick
              </span>
            )}
          </div>

          {/* Favorite Heart Button */}
          {user && (
            <button
              onClick={() => toggleFavorite(product._id)}
              aria-label="Add to favorites"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s',
              }}
            >
              <Heart
                size={18}
                color={isFavorite ? '#E11D48' : '#78716C'}
                fill={isFavorite ? '#E11D48' : 'none'}
              />
            </button>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(44, 24, 16, 0.7)',
                backdropFilter: 'blur(2px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Sold Out for Today
            </div>
          )}
        </div>

        {/* Product Details */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-amber)', textTransform: 'uppercase' }}>
              {product.category}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-light)' }}>
              <Clock size={13} />
              <span>{formatPrepTime(product.preparationTime)}</span>
            </div>
          </div>

          <Link to={`/product/${product.slug || product._id}`}>
            <h3
              style={{
                fontSize: '1.15rem',
                marginBottom: '6px',
                color: 'var(--primary-espresso)',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {product.name}
            </h3>
          </Link>

          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginBottom: '1rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              flex: 1,
            }}
          >
            {product.description}
          </p>

          {/* Price & Action Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
              marginTop: 'auto',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', lineHeight: 1 }}>
                {isCake ? 'Starting at' : 'Price'}
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-espresso)' }}>
                {formatCurrency(product.price)}
              </span>
            </div>

            <button
              onClick={handleActionClick}
              disabled={isOutOfStock}
              className={`btn btn-sm ${isOutOfStock ? 'btn-secondary' : 'btn-primary'}`}
              style={{
                opacity: isOutOfStock ? 0.6 : 1,
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              }}
            >
              {isCake ? (
                <>
                  <SlidersHorizontal size={14} /> Customize
                </>
              ) : isCustomizableBeverage ? (
                <>
                  <SlidersHorizontal size={14} /> Customize
                </>
              ) : (
                <>
                  <Plus size={15} /> Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Customization Modals */}
      {showCakeModal && (
        <CakeBuilderModal product={product} onClose={() => setShowCakeModal(false)} />
      )}
      {showBeverageModal && (
        <BeverageCustomizerModal product={product} onClose={() => setShowBeverageModal(false)} />
      )}
    </>
  );
};

export default ProductCard;
