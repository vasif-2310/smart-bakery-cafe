import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, MapPin, Clock, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#1E120B',
        color: '#E8DDD0',
        paddingTop: '4rem',
        paddingBottom: '2rem',
        marginTop: 'auto',
        borderTop: '4px solid var(--accent-gold)',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Column 1: Brand Info & 5km Notice */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                }}
              >
                <Coffee size={20} />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#FFF',
                }}
              >
                Smart Bakery <span style={{ color: 'var(--accent-gold)' }}>& Café</span>
              </span>
            </div>
            <p style={{ color: '#B8A898', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Artisanal breads, custom designer cakes, and slow-pulled Arabica espresso crafted daily with pure butter and natural ingredients.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(217, 119, 6, 0.15)',
                border: '1px solid rgba(217, 119, 6, 0.4)',
                color: '#FBBF24',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={16} /> Strict 5.0 km Fresh Delivery Radius
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4
              style={{
                color: '#FFF',
                fontSize: '1.05rem',
                marginBottom: '1.25rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
              }}
            >
              Our Offerings
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li>
                <Link to="/menu?category=Bakery" style={{ color: '#D4C3B3' }}>
                  Artisanal Cakes & Pastries
                </Link>
              </li>
              <li>
                <Link to="/menu?category=Non-Vegetarian" style={{ color: '#D4C3B3' }}>
                  Gourmet Burgers & Wraps
                </Link>
              </li>
              <li>
                <Link to="/menu?category=Cafe" style={{ color: '#D4C3B3' }}>
                  Specialty Coffee & Shakes
                </Link>
              </li>
              <li>
                <Link to="/menu" style={{ color: '#D4C3B3' }}>
                  Personalized Cake Customizer
                </Link>
              </li>
              <li>
                <Link to="/login" style={{ color: '#D4C3B3' }}>
                  Partner & Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Store Hours & Location */}
          <div>
            <h4
              style={{
                color: '#FFF',
                fontSize: '1.05rem',
                marginBottom: '1.25rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
              }}
            >
              Bakery & Café Hub
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#D4C3B3' }}>
                <MapPin size={18} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Shop 14, Inner Circle, Connaught Place, New Delhi 110001</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#D4C3B3' }}>
                <Clock size={18} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                <span>Open Daily: 08:00 AM – 10:00 PM</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#D4C3B3' }}>
                <Phone size={18} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                <span>+91 98765 43210</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#D4C3B3' }}>
                <Mail size={18} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                <span>hello@smartbakery.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4
              style={{
                color: '#FFF',
                fontSize: '1.05rem',
                marginBottom: '1.25rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
              }}
            >
              Fresh Batch Alerts
            </h4>
            <p style={{ color: '#B8A898', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Subscribe to get notifications when morning croissants exit the oven and seasonal specials drop.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for subscribing to Smart Bakery fresh batch alerts!');
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                required
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #3E2419',
                  backgroundColor: '#2C1810',
                  color: '#FFF',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Join Bakers Club
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid #2C1810',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.85rem',
            color: '#8A7A6D',
          }}
        >
          <p>© {new Date().getFullYear()} Smart Bakery & Café. Handcrafted with passion.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Baked fresh with <Heart size={14} color="#E11D48" fill="#E11D48" /> for pastry & coffee connoisseurs.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
