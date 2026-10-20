import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import ProductCard from '../components/customer/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const FavoritesPage = () => {
  const { user } = useAuth();
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data?.user?.favorites) {
          setFavoriteProducts(response.data.user.favorites);
        }
      } catch (error) {
        console.error('Failed to load favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user?.favorites]);

  if (loading) {
    return <LoadingSpinner message="Retrieving your favorite confections..." />;
  }

  return (
    <div style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link
            to="/menu"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: '1rem',
            }}
          >
            <ArrowLeft size={16} /> Back to Menu
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={28} color="#E11D48" fill="#E11D48" />
            <h1 style={{ fontSize: '2.2rem', color: 'var(--primary-espresso)' }}>Your Favorite Bakes &amp; Brews</h1>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>
            Quickly re-order the pastries, savories, and beverages you love most.
          </p>
        </div>

        {favoriteProducts.length === 0 ? (
          <div
            style={{
              padding: '5rem 1rem',
              textAlign: 'center',
              backgroundColor: '#FFF',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Heart size={44} color="#D4C3B3" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-espresso)', marginBottom: '8px' }}>
              No Favorites Saved Yet
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
              Tap the heart icon on any cake, sandwich, or coffee to bookmark it here for fast re-ordering.
            </p>
            <Link to="/menu" className="btn btn-primary">
              Explore Menu Catalogue
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {favoriteProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
