import React, { useState } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import useCart from '../../hooks/useCart';

export const CakeBuilderModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const options = product.customizationOptions || {};

  const sizes = options.sizes || [{ name: '500g (Serves 4-5)', priceDelta: 0 }];
  const flavors = options.flavors || ['Classic Belgian Truffle', 'Dutch Dark Truffle'];
  const frostings = options.frostings || ['Rich Dark Ganache', 'Whipped Buttercream'];

  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [selectedFlavor, setSelectedFlavor] = useState(flavors[0]);
  const [selectedFrosting, setSelectedFrosting] = useState(frostings[0]);
  const [customMessage, setCustomMessage] = useState('');

  const currentPrice = product.price + (selectedSize.priceDelta || 0);

  const handleAddToCart = () => {
    addToCart(product, 1, {
      size: selectedSize,
      flavor: selectedFlavor,
      frosting: selectedFrosting,
      customMessage: customMessage.trim(),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', padding: '1.75rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase' }}>
              Personalized Cake Studio
            </span>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-espresso)' }}>{product.name}</h2>
          </div>
          <button onClick={onClose} style={{ padding: '6px', borderRadius: '50%', backgroundColor: '#F3ECE2' }}>
            <X size={20} />
          </button>
        </div>

        {/* Live Visual Cake Preview Card */}
        <div
          style={{
            position: 'relative',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #3E2419, #1C1917)',
            padding: '1.75rem',
            textAlign: 'center',
            color: '#FFF',
            marginBottom: '1.5rem',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.4)',
          }}
        >
          <div
            style={{
              width: '100px',
              height: '100px',
              margin: '0 auto 12px auto',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #D97706 0%, #78350F 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '4px solid #FDFBF7',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          >
            <Sparkles size={36} color="#FFFBEB" />
          </div>

          <p style={{ fontSize: '0.85rem', color: '#D4C3B3', marginBottom: '4px' }}>
            Selected: <strong>{selectedFlavor}</strong> with <strong>{selectedFrosting}</strong>
          </p>

          {/* Custom Message Piping Preview */}
          <div
            style={{
              minHeight: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 14px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              margin: '8px auto 0 auto',
              maxWidth: '85%',
              border: '1px dashed rgba(245, 158, 11, 0.6)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '1.05rem',
                color: '#FEF3C7',
                letterSpacing: '0.02em',
              }}
            >
              {customMessage.trim() ? `"${customMessage}"` : 'Your custom message piped here in gold cream'}
            </span>
          </div>
        </div>

        {/* Option 1: Choose Size */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
            1. Select Cake Size &amp; Weight
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
            {sizes.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => setSelectedSize(s)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: `2px solid ${selectedSize.name === s.name ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                  backgroundColor: selectedSize.name === s.name ? '#FEF3C7' : '#FFF',
                  color: selectedSize.name === s.name ? '#B45309' : 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'left',
                }}
              >
                <span>{s.name}</span>
                {s.priceDelta > 0 && <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>+{formatCurrency(s.priceDelta)}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Option 2: Sponge Flavor */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
            2. Choose Sponge Flavor
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {flavors.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedFlavor(f)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: `1.5px solid ${selectedFlavor === f ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                  backgroundColor: selectedFlavor === f ? 'var(--accent-gold)' : '#FFF',
                  color: selectedFlavor === f ? '#FFF' : 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Option 3: Cream Frosting */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
            3. Choose Frosting Finish
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {frostings.map((fr) => (
              <button
                key={fr}
                type="button"
                onClick={() => setSelectedFrosting(fr)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: `1.5px solid ${selectedFrosting === fr ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                  backgroundColor: selectedFrosting === fr ? 'var(--accent-gold)' : '#FFF',
                  color: selectedFrosting === fr ? '#FFF' : 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                {fr}
              </button>
            ))}
          </div>
        </div>

        {/* Option 4: Message on Cake */}
        {options.allowCustomMessage && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="form-label">4. Custom Piping Message on Cake (Optional)</label>
              <span style={{ fontSize: '0.75rem', color: customMessage.length > 35 ? '#DC2626' : 'var(--text-light)' }}>
                {customMessage.length} / 35 chars
              </span>
            </div>
            <input
              type="text"
              maxLength={35}
              placeholder="e.g., Happy Birthday Aarav!"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="form-input"
            />
          </div>
        )}

        {/* Bottom Total & Add to Cart */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block' }}>Total Customized Price</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-espresso)' }}>
              {formatCurrency(currentPrice)}
            </span>
          </div>

          <button onClick={handleAddToCart} className="btn btn-primary btn-lg">
            <Check size={18} /> Add Custom Cake to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CakeBuilderModal;
