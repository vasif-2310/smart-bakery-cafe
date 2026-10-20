import React, { useState } from 'react';
import { Star, X, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../common/Toast';

export const ReviewModal = ({ isOpen, onClose, product, orderId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { showToast } = useToast();

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setErrorMsg('Please select a star rating.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await api.post('/reviews', {
        productId: product._id || product.id,
        orderId,
        rating,
        comment: comment.trim(),
      });

      showToast('Thank you! Your verified review has been published.', 'success');
      if (onReviewSubmitted) onReviewSubmitted(response.data);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit review.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#FFF',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          padding: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-espresso)' }}>
              Write a Verified Review
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {product.name}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              padding: '6px',
              borderRadius: '50%',
              color: 'var(--text-muted)',
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {errorMsg && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Star Rating Select */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
              Your Overall Rating
            </label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    transition: 'transform 0.15s ease',
                  }}
                  onFocus={() => {}}
                >
                  <Star
                    size={32}
                    color={
                      (hoverRating || rating) >= star ? '#F59E0B' : '#E2E8F0'
                    }
                    fill={
                      (hoverRating || rating) >= star ? '#F59E0B' : 'none'
                    }
                    style={{
                      transform: (hoverRating || rating) >= star ? 'scale(1.15)' : 'scale(1)',
                      transition: 'transform 0.15s ease',
                    }}
                  />
                </button>
              ))}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
              {rating === 5 && 'Outstanding! Loved every bite & sip.'}
              {rating === 4 && 'Very tasty, high quality bake.'}
              {rating === 3 && 'Average experience, room to improve.'}
              {rating === 2 && 'Disappointing texture or taste.'}
              {rating === 1 && 'Poor, not as described.'}
            </span>
          </div>

          {/* Review Text */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Detailed Feedback (Optional)
            </label>
            <textarea
              className="input-field"
              rows={4}
              placeholder="Tell others about the aroma, texture, crust crispiness, or beverage roast..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Verified purchase note */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#F0FDF4',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.78rem',
              color: '#15803D',
              marginBottom: '1.5rem',
            }}
          >
            <CheckCircle2 size={16} />
            <span>Verified Purchase: Confirmed delivered from Order #{orderId.substring(0, 8)}</span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
