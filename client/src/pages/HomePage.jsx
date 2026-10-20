import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  Award,
  Star,
  Coffee,
  Croissant,
  UtensilsCrossed,
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/customer/ProductCard';
import ComboRecommender from '../components/customer/ComboRecommender';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DeliveryRadiusChecker from '../components/customer/DeliveryRadiusChecker';

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await api.get('/products/meta/featured-and-combos');
        if (response.data) {
          setFeaturedProducts(response.data.featured || []);
          setCombos(response.data.combos || []);
        }
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div>
      {/* 1. Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '5rem 0 6rem 0',
          background: 'linear-gradient(135deg, #FAF6F0 0%, #F5EBE1 100%)',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: '3.5rem',
          }}
        >
          {/* Left Column: Headline & CTAs */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '20px',
                backgroundColor: '#FEF3C7',
                color: '#B45309',
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '1.25rem',
              }}
            >
              <Sparkles size={16} /> Artisanal Bakery &amp; Specialty Café
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
                color: 'var(--primary-espresso)',
                marginBottom: '1.25rem',
                lineHeight: 1.15,
              }}
            >
              Baked with Passion. <br />
              <span style={{ color: 'var(--accent-gold)' }}>Sipped with Delight.</span>
            </h1>

            <p
              style={{
                fontSize: '1.1rem',
                color: 'var(--text-muted)',
                marginBottom: '2rem',
                lineHeight: 1.6,
                maxWidth: '520px',
              }}
            >
              Indulge in handcrafted European croissants, custom designer cakes, savory chicken brioche burgers, and slow-pulled Arabica espresso. Delivered oven-fresh strictly within our 5.0 km radius.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '2.5rem' }}>
              <Link to="/menu" className="btn btn-primary btn-lg">
                Explore Full Menu <ArrowRight size={20} />
              </Link>
              <a href="#delivery-zone" className="btn btn-secondary btn-lg">
                <MapPin size={20} color="var(--accent-amber)" /> Check 5km Delivery
              </a>
            </div>

            {/* Quick Guarantees */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1.5rem',
              }}
            >
              <div>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-espresso)', display: 'block' }}>
                  30+
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Fresh Daily Items</span>
              </div>
              <div>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-espresso)', display: 'block' }}>
                  5.0 KM
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Strict Fresh Radius</span>
              </div>
              <div>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-espresso)', display: 'block' }}>
                  4.9 ★
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>From 1,200+ Reviews</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Food Collage */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(44, 24, 16, 0.18)',
                border: '6px solid #FFF',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80"
                alt="Belgian Chocolate Cake"
                style={{ width: '100%', height: '420px', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  right: '20px',
                  padding: '14px 20px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase' }}>
                    Signature Masterpiece
                  </span>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--primary-espresso)' }}>
                    Belgian Dark Chocolate Ganache
                  </h4>
                </div>
                <Link to="/menu?category=Bakery" className="btn btn-primary btn-sm">
                  Customize
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Three Pillar Categories Section */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase' }}>
              Taste The Craft
            </span>
            <h2 style={{ fontSize: '2.4rem', color: 'var(--primary-espresso)', marginTop: '4px' }}>
              Explore Our Three Signature Menus
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* Category 1: Bakery */}
            <Link
              to="/menu?category=Bakery"
              className="card card-interactive"
              style={{
                padding: '2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#FFF',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#FEF3C7',
                  color: '#B45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Croissant size={32} />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>Artisanal Bakery</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Designer chocolate cakes, buttery French croissants, berry muffins, and savory garlic breads.
              </p>
              <span style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
                10 Fresh Items →
              </span>
            </Link>

            {/* Category 2: Non-Vegetarian */}
            <Link
              to="/menu?category=Non-Vegetarian"
              className="card card-interactive"
              style={{
                padding: '2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#FFF',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#FEE2E2',
                  color: '#B91C1C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <UtensilsCrossed size={32} />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>Savory Non-Veg</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Juicy chicken brioche burgers, stone-baked chicken pizzas, wraps, tikka sandwiches, and crispy nuggets.
              </p>
              <span style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
                10 Savory Treats →
              </span>
            </Link>

            {/* Category 3: Café */}
            <Link
              to="/menu?category=Cafe"
              className="card card-interactive"
              style={{
                padding: '2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#FFF',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#E0F2FE',
                  color: '#0369A1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Coffee size={32} />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>Gourmet Café</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Specialty Arabica espresso, iced lattes, rich mocha, thick chocolate milkshakes, and masala chai.
              </p>
              <span style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
                10 Handcrafted Brews →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Featured Bestsellers Grid */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#FFF', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '2.5rem',
              gap: '1rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase' }}>
                Trending Right Now
              </span>
              <h2 style={{ fontSize: '2.4rem', color: 'var(--primary-espresso)', marginTop: '4px' }}>
                Featured Confections &amp; Brews
              </h2>
            </div>
            <Link to="/menu" className="btn btn-secondary">
              View All 30 Items <ArrowRight size={18} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching freshly baked delights..." />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.75rem',
              }}
            >
              {featuredProducts.slice(0, 6).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Smart Combo Pairings */}
      <ComboRecommender combos={combos} />

      {/* 5. 5 KM Delivery Radius Zone Explainer */}
      <section
        id="delivery-zone"
        style={{
          padding: '5rem 0',
          backgroundColor: '#2C1810',
          color: '#FFF',
          borderTop: '4px solid var(--accent-gold)',
        }}
      >
        <div className="container" style={{ textAlign: 'center', maxWidth: '820px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'rgba(217, 119, 6, 0.2)',
              border: '2px solid var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
            }}
          >
            <ShieldCheck size={32} color="var(--accent-gold)" />
          </div>

          <h2 style={{ fontSize: '2.5rem', color: '#FFF', marginBottom: '1rem' }}>
            The 5.0 KM Fresh Delivery Guarantee
          </h2>

          <p style={{ color: '#D4C3B3', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            To ensure pastry flakiness, piping-hot coffee, and melt-free ganache, we enforce a strict <strong>5.0 km straight-line radius</strong> from our kitchen at Connaught Place, New Delhi. Every order is mathematically verified using the spherical Haversine formula on our servers before confirmation.
          </p>

          {/* Interactive Live Delivery Radius Checker Widget */}
          <div style={{ margin: '2rem auto 2.5rem auto', textAlign: 'left', color: 'var(--text-main)' }}>
            <DeliveryRadiusChecker />
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            <Link to="/menu" className="btn btn-primary btn-lg">
              Start Your Fresh Order
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
