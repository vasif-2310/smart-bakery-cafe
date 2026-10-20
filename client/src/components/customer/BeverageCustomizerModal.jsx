import React, { useState } from 'react';
import { X, Check, Coffee } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import useCart from '../../hooks/useCart';

export const BeverageCustomizerModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const options = product.customizationOptions || {};

  const sizes = options.sizes || [{ name: 'Regular Cup', priceDelta: 0 }];
  const sweetnessLevels = options.sweetnessLevels || ['Unsweetened', 'Less Sweet', 'Regular Sweet'];
  const temperatures = options.temperatureOptions || ['Hot', 'Iced'];
  const addons = options.beverageAddons || [];

  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [selectedTemp, setSelectedTemp] = useState(temperatures[0] || 'Hot');
  const [selectedSweetness, setSelectedSweetness] = useState(sweetnessLevels[0] || 'Regular Sweet');
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Calculate live dynamic price
  const addonsPriceDelta = selectedAddons.reduce((sum, a) => sum + (a.priceDelta || 0), 0);
  const currentPrice = product.price + (selectedSize.priceDelta || 0) + addonsPriceDelta;

  const toggleAddon = (addon) => {
    if (selectedAddons.some((a) => a.name === addon.name)) {
      setSelectedAddons(selectedAddons.filter((a) => a.name !== addon.name));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, 1, {
      size: selectedSize,
      temperature: selectedTemp,
      sweetness: selectedSweetness,
      beverageAddons: selectedAddons,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', padding: '1.75rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase' }}>
              Handcrafted Brew Customizer
            </span>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-espresso)' }}>{product.name}</h2>
          </div>
          <button onClick={onClose} style={{ padding: '6px', borderRadius: '50%', backgroundColor: '#F3ECE2' }}>
            <X size={20} />
          </button>
        </div>

        {/* Cup Size */}
        {sizes.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
              Cup Size
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
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
                  }}
                >
                  <span>{s.name}</span>
                  {s.priceDelta > 0 && <span>+{formatCurrency(s.priceDelta)}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Temperature */}
        {temperatures.length > 1 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
              Temperature
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {temperatures.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTemp(t)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: `1.5px solid ${selectedTemp === t ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                    backgroundColor: selectedTemp === t ? 'var(--accent-gold)' : '#FFF',
                    color: selectedTemp === t ? '#FFF' : 'var(--text-main)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sweetness */}
        {sweetnessLevels.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
              Sweetness Preference
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {sweetnessLevels.map((sw) => (
                <button
                  key={sw}
                  type="button"
                  onClick={() => setSelectedSweetness(sw)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '20px',
                    border: `1.5px solid ${selectedSweetness === sw ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                    backgroundColor: selectedSweetness === sw ? 'var(--accent-gold)' : '#FFF',
                    color: selectedSweetness === sw ? '#FFF' : 'var(--text-main)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  {sw}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Beverage Add-ons */}
        {addons.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
              Artisan Add-ons &amp; Milk Substitutes
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {addons.map((addon) => {
                const isSelected = selectedAddons.some((a) => a.name === addon.name);
                return (
                  <button
                    key={addon.name}
                    type="button"
                    onClick={() => toggleAddon(addon)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: `1.5px solid ${isSelected ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                      backgroundColor: isSelected ? '#FEF3C7' : '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      color: isSelected ? '#B45309' : 'var(--text-main)',
                    }}
                  >
                    <span>{addon.name}</span>
                    <span style={{ fontWeight: 700 }}>+{formatCurrency(addon.priceDelta)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Total & Action */}
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
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block' }}>Total Beverage Price</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-espresso)' }}>
              {formatCurrency(currentPrice)}
            </span>
          </div>

          <button onClick={handleAddToCart} className="btn btn-primary">
            <Check size={18} /> Add Customized Drink
          </button>
        </div>
      </div>
    </div>
  );
};

export default BeverageCustomizerModal;
