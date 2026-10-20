import React from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import useCart from '../../hooks/useCart';

export const ComboRecommender = ({ combos = [] }) => {
  const { addToCart } = useCart();

  if (!combos || combos.length === 0) return null;

  const handleAddCombo = (combo) => {
    combo.items.forEach((item) => {
      addToCart(item, 1);
    });
  };

  return (
    <section style={{ padding: '3.5rem 0', backgroundColor: 'var(--bg-subtle)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              backgroundColor: '#FEF3C7',
              color: '#B45309',
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            <Sparkles size={14} /> Smart Pairing Combinations
          </div>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--primary-espresso)' }}>
            Chef's Recommended Food &amp; Coffee Pairings
          </h2>
          <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-muted)' }}>
            Carefully curated flavor harmonies designed by our master pastry chefs and baristas.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {combos.map((combo) => {
            const rawPrice = combo.items.reduce((sum, item) => sum + (item.price || 0), 0);
            const discountedPrice = Math.round(rawPrice * (1 - (combo.discountPercent || 10) / 100));

            return (
              <div
                key={combo.id}
                className="card card-interactive"
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#FFF',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-espresso)' }}>{combo.title}</h3>
                  <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                    SAVE {combo.discountPercent}%
                  </span>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  {combo.description}
                </p>

                {/* Items in Combo */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', flex: 1 }}>
                  {combo.items.map((item) => (
                    <div
                      key={item._id}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        backgroundColor: '#FAF6F0',
                        borderRadius: '12px',
                        padding: '10px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = '/placeholder-food.svg';
                        }}
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          marginBottom: '6px',
                        }}
                      />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-espresso)' }}>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price and Action */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-subtle)',
                    marginTop: 'auto',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#9CA3AF', textDecoration: 'line-through', marginRight: '6px' }}>
                      {formatCurrency(rawPrice)}
                    </span>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-espresso)' }}>
                      {formatCurrency(discountedPrice)}
                    </span>
                  </div>

                  <button onClick={() => handleAddCombo(combo)} className="btn btn-primary btn-sm">
                    <Plus size={16} /> Add Pair
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ComboRecommender;
