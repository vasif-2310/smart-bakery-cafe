import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Heart,
  Plus,
  SlidersHorizontal,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatPrepTime, formatDate } from '../utils/formatters';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import { useToast } from '../components/common/Toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CakeBuilderModal from '../components/customer/CakeBuilderModal';
import BeverageCustomizerModal from '../components/customer/BeverageCustomizerModal';

export const ProductDetailPage = () => {
  const { identifier } = useParams();
  const { user, toggleFavorite } = useAuth();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCakeModal, setShowCakeModal] = useState(false);
  const [showBeverageModal, setShowBeverageModal] = useState(false);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        const prodRes = await api.get(`/products/${identifier}`);
        if (prodRes.data?.product) {
          const currentProd = prodRes.data.product;
          setProduct(currentProd);

          // Fetch reviews for this product
          const revRes = await api.get(`/reviews/product/${currentProd._id}`);
          if (revRes.data?.reviews) {
            setReviews(revRes.data.reviews);
          }
        }
      } catch (error) {
        console.error('Failed to load product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [identifier]);

  if (loading) {
    return <LoadingSpinner message="Plating confections..." />;
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <p style={{ margin: '1rem 0' }}>The confections you are looking for may have been retired or renamed.</p>
        <Link to="/menu" className="btn btn-primary">
          Back to Menu Catalogue
        </Link>
      </div>
    );
  }

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

  const handleAddToCart = () => {
    if (isCake) {
      setShowCakeModal(true);
    } else if (isCustomizableBeverage) {
      setShowBeverageModal(true);
    } else {
      addToCart(product, 1);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      addToast('Please enter review comments', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      // Find a delivered customer order containing this product
      const ordersRes = await api.get('/orders/my-orders');
      const deliveredOrders = ordersRes.data?.orders || [];
      const eligibleOrder = deliveredOrders.find(
        (o) =>
          o.orderStatus === 'delivered' &&
          o.items.some((i) => (i.product?._id || i.product).toString() === product._id.toString())
      );

      if (!eligibleOrder) {
        addToast(
          'Verified Purchase Required: You can only review products from orders that have been successfully delivered to you.',
          'error'
        );
        return;
      }

      const res = await api.post('/reviews', {
        productId: product._id,
        orderId: eligibleOrder._id,
        rating: reviewRating,
        comment: reviewComment,
      });

      addToast('Review submitted successfully!', 'success');
      setReviews([res.data.review, ...reviews]);
      setReviewComment('');
    } catch (err) {
      addToast(err.message || 'Could not submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div style={{ padding: '2rem 0 5rem 0' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/menu"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
            }}
          >
            <ArrowLeft size={16} /> Back to Menu Catalogue
          </Link>
        </div>

        {/* Product Hero Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            backgroundColor: '#FFF',
            borderRadius: '24px',
            border: '1px solid var(--border-subtle)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '3rem',
          }}
        >
          {/* Left: Product Image */}
          <div style={{ position: 'relative', borderRadius: '18px', overflow: 'hidden', height: '420px' }}>
            <img
              src={product.imageUrl}
              alt={product.name}
              onError={(e) => {
                e.target.src = '/placeholder-food.svg';
              }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {user && (
              <button
                onClick={() => toggleFavorite(product._id)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <Heart
                  size={22}
                  color={isFavorite ? '#E11D48' : '#78716C'}
                  fill={isFavorite ? '#E11D48' : 'none'}
                />
              </button>
            )}
          </div>

          {/* Right: Product Details & Controls */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className={`badge ${product.isVegetarian ? 'badge-veg' : 'badge-nonveg'}`}>
                {product.isVegetarian ? 'Pure Vegetarian' : 'Non-Vegetarian'}
              </span>
              <span className="badge badge-gold">{product.category}</span>
            </div>

            <h1 style={{ fontSize: '2.4rem', color: 'var(--primary-espresso)', marginBottom: '8px' }}>
              {product.name}
            </h1>

            {/* Ratings & Prep Time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706', fontWeight: 700 }}>
                <Star size={18} fill="#D97706" />
                <span>{product.averageRating || 4.8}</span>
                <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>({reviews.length} reviews)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                <Clock size={16} />
                <span>Preparation: {formatPrepTime(product.preparationTime)}</span>
              </div>
            </div>

            {/* Price */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Starting from</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-espresso)' }}>
                {formatCurrency(product.price)}
              </div>
            </div>

            {/* Description */}
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {product.description}
            </p>

            {/* Ingredients */}
            {product.ingredients?.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--primary-espresso)', marginBottom: '6px' }}>
                  Ingredients:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {product.ingredients.map((ing) => (
                    <span
                      key={ing}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        backgroundColor: '#F3ECE2',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: 'var(--text-main)',
                      }}
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Allergen Warning */}
            {product.allergens?.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  color: '#92400E',
                  fontSize: '0.85rem',
                  marginBottom: '2rem',
                }}
              >
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Allergen Notice:</strong> Contains {product.allergens.join(', ')}.
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
              <button onClick={handleAddToCart} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                {isCake ? (
                  <>
                    <SlidersHorizontal size={20} /> Open Cake Builder
                  </>
                ) : isCustomizableBeverage ? (
                  <>
                    <SlidersHorizontal size={20} /> Customize Brew
                  </>
                ) : (
                  <>
                    <Plus size={20} /> Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section
          style={{
            backgroundColor: '#FFF',
            borderRadius: '24px',
            border: '1px solid var(--border-subtle)',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <MessageSquare size={22} color="var(--accent-amber)" />
            <h3 style={{ fontSize: '1.6rem', color: 'var(--primary-espresso)' }}>Verified Customer Reviews</h3>
          </div>

          {/* Review Submission Form (Only for logged-in users) */}
          {user ? (
            <form
              onSubmit={handleReviewSubmit}
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2rem',
              }}
            >
              <h4 style={{ fontSize: '1.05rem', color: 'var(--primary-espresso)', marginBottom: '10px' }}>
                Share Your Experience
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '12px' }}>
                Note: Reviews are verified against your past delivered purchase orders.
              </p>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    style={{ padding: '2px', display: 'flex' }}
                  >
                    <Star
                      size={22}
                      color="#D97706"
                      fill={star <= reviewRating ? '#D97706' : 'none'}
                    />
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                placeholder="How was the crumb, aroma, and flavor profile?..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="form-textarea"
                style={{ marginBottom: '12px' }}
                required
              />

              <button type="submit" disabled={submittingReview} className="btn btn-primary btn-sm">
                {submittingReview ? 'Verifying Purchase...' : 'Post Verified Review'}
              </button>
            </form>
          ) : (
            <div style={{ padding: '1rem', backgroundColor: '#F3ECE2', borderRadius: '12px', marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Please <Link to="/login" style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>Log In</Link> to submit a review for your verified delivered purchases.
              </p>
            </div>
          )}

          {/* Existing Reviews List */}
          {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No customer reviews yet. Be the first to taste and review!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '14px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: '#FAF6F0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary-espresso)' }}>
                      {rev.customer?.name || 'Customer'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                      {formatDate(rev.createdAt)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} size={15} color="#D97706" fill="#D97706" />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modals */}
      {showCakeModal && (
        <CakeBuilderModal product={product} onClose={() => setShowCakeModal(false)} />
      )}
      {showBeverageModal && (
        <BeverageCustomizerModal product={product} onClose={() => setShowBeverageModal(false)} />
      )}
    </div>
  );
};

export default ProductDetailPage;
