import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RotateCcw, SlidersHorizontal } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/customer/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [dietFilter, setDietFilter] = useState('all'); // 'all', 'veg', 'nonveg'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Sync category param if URL changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Fetch products with backend filtering and sorting
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          limit: 50,
          sortBy,
          maxPrice,
        };

        if (selectedCategory !== 'All') {
          params.category = selectedCategory;
        }

        if (dietFilter === 'veg') {
          params.isVegetarian = 'true';
        } else if (dietFilter === 'nonveg') {
          params.isVegetarian = 'false';
        }

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (onlyAvailable) {
          params.availableOnly = 'true';
        }

        const response = await api.get('/products', { params });
        if (response.data?.products) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error('Error fetching menu products:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedCategory, dietFilter, searchQuery, sortBy, maxPrice, onlyAvailable]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: cat });
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setDietFilter('all');
    setSearchQuery('');
    setSortBy('popular');
    setMaxPrice(1000);
    setOnlyAvailable(false);
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase' }}>
            Artisanal Confections &amp; Savories
          </span>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--primary-espresso)', marginTop: '4px' }}>
            Our Complete Fresh Menu
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Browse exactly 30 freshly prepared delicacies across Bakery, Non-Vegetarian Savories, and Handcrafted Café Brews.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div
          style={{
            backgroundColor: '#FFF',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Top Row: Search & Category Pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
              <Search
                size={18}
                color="#78716C"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search products by name (e.g. Croissant, Burger, Latte)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: '24px',
                  border: '1.5px solid var(--border-subtle)',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            {/* Category Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['All', 'Bakery', 'Non-Vegetarian', 'Cafe'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    backgroundColor: selectedCategory === cat ? 'var(--primary-espresso)' : '#F3ECE2',
                    color: selectedCategory === cat ? '#FFF' : 'var(--text-main)',
                    transition: 'all 0.2s',
                  }}
                >
                  {cat === 'All' ? 'All (30)' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Filter Controls: Diet Filter, Sort, Price & Reset */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              alignItems: 'center',
              borderTop: '1px solid #F3ECE2',
              paddingTop: '0.85rem',
              fontSize: '0.875rem',
            }}
          >
            {/* Diet Filter Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-light)' }}>Diet:</span>
              <button
                onClick={() => setDietFilter('all')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  backgroundColor: dietFilter === 'all' ? '#E8DDD0' : 'transparent',
                }}
              >
                All
              </button>
              <button
                onClick={() => setDietFilter('veg')}
                className="badge badge-veg"
                style={{ cursor: 'pointer', opacity: dietFilter === 'veg' ? 1 : 0.6 }}
              >
                Pure Veg
              </button>
              <button
                onClick={() => setDietFilter('nonveg')}
                className="badge badge-nonveg"
                style={{ cursor: 'pointer', opacity: dietFilter === 'nonveg' ? 1 : 0.6 }}
              >
                Non-Veg
              </button>
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-light)' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: '#FFF',
                  outline: 'none',
                  fontSize: '0.85rem',
                }}
              >
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="prep_time">Fastest Preparation</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>

            {/* Max Price Range Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '180px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-light)', whiteSpace: 'nowrap' }}>
                Max: ₹{maxPrice}
              </span>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
              />
            </div>

            {/* In Stock Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                style={{ accentColor: 'var(--accent-gold)' }}
              />
              <span style={{ fontWeight: 500 }}>In-Stock Only</span>
            </label>

            {/* Reset Button */}
            <button
              onClick={handleResetFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: '#DC2626',
                fontWeight: 600,
                fontSize: '0.8rem',
                marginLeft: 'auto',
              }}
            >
              <RotateCcw size={14} /> Reset Filters
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <LoadingSpinner message="Filtering confections..." />
        ) : products.length === 0 ? (
          <div
            style={{
              padding: '4rem 1rem',
              textAlign: 'center',
              backgroundColor: '#FFF',
              borderRadius: '16px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-espresso)', marginBottom: '8px' }}>
              No Fresh Items Matched Your Filter
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Try adjusting your price slider, search keyword, or dietary preferences.
            </p>
            <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
              View All 30 Items
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
