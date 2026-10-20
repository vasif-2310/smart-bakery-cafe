import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Croissant,
  UtensilsCrossed,
  Coffee,
  AlertTriangle,
} from 'lucide-react';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import ProductFormModal from '../../components/admin/ProductFormModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/common/Toast';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const { showToast } = useToast();

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.products || []);
    } catch {
      showToast('Failed to load menu products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleAvailability = async (product) => {
    try {
      const updatedStatus = !product.isAvailable;
      await api.put(`/products/${product._id}`, { isAvailable: updatedStatus });
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, isAvailable: updatedStatus } : p))
      );
      showToast(`'${product.name}' is now ${updatedStatus ? 'Available' : 'Unavailable'}`, 'info');
    } catch {
      showToast('Could not update product availability', 'error');
    }
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Are you sure you want to remove '${product.name}' from the bakery catalogue?`)) {
      try {
        await api.delete(`/products/${product._id}`);
        setProducts((prev) => prev.filter((p) => p._id !== product._id));
        showToast(`'${product.name}' was removed from the catalogue.`, 'info');
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to delete product', 'error');
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subcategory?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - var(--nav-height))', backgroundColor: '#FBF9F5' }} className="admin-layout">
      <AdminSidebar />

      <main style={{ flex: 1, padding: '2rem' }} className="admin-main">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--primary-espresso)' }}>
              Menu Catalogue Management
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Total items: {products.length} (Active and available across 3 departments)
            </p>
          </div>

          <button
            onClick={() => {
              setProductToEdit(null);
              setIsModalOpen(true);
            }}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> Add New Product
          </button>
        </div>

        {/* Filter Controls */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Search bar */}
          <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search products by title..."
              className="input-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px', fontSize: '0.88rem' }}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Items' },
              { id: 'Bakery', label: 'Bakery' },
              { id: 'Non-Vegetarian', label: 'Non-Veg' },
              { id: 'Cafe', label: 'Café Brews' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: selectedCategory === tab.id ? 'var(--accent-amber)' : '#FFF',
                  color: selectedCategory === tab.id ? '#FFF' : 'var(--text-main)',
                  fontWeight: selectedCategory === tab.id ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        {loading ? (
          <LoadingSpinner message="Loading catalog inventory..." />
        ) : (
          <div className="card" style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-light)' }}>
                  <th style={{ padding: '12px 10px' }}>Product</th>
                  <th style={{ padding: '12px 10px' }}>Category</th>
                  <th style={{ padding: '12px 10px' }}>Type</th>
                  <th style={{ padding: '12px 10px' }}>Price</th>
                  <th style={{ padding: '12px 10px' }}>Stock</th>
                  <th style={{ padding: '12px 10px' }}>Status</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    {/* Title & Image */}
                    <td style={{ padding: '12px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={p.imageUrl || '/placeholder-food.svg'}
                          alt={p.name}
                          style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-food.svg';
                          }}
                        />
                        <div>
                          <strong style={{ display: 'block', color: 'var(--primary-espresso)' }}>
                            {p.name}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                            {p.subcategory || p.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '12px 10px' }}>
                      <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                        {p.category}
                      </span>
                    </td>

                    {/* Veg/Non-Veg */}
                    <td style={{ padding: '12px 10px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: p.isVegetarian ? '#15803D' : '#B91C1C',
                        }}
                      >
                        <span
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: p.isVegetarian ? '#16A34A' : '#DC2626',
                          }}
                        />
                        {p.isVegetarian ? 'Veg' : 'Non-Veg'}
                      </span>
                    </td>

                    {/* Price */}
                    <td style={{ padding: '12px 10px', fontWeight: 700 }}>
                      ₹{p.price}
                    </td>

                    {/* Stock Units */}
                    <td style={{ padding: '12px 10px' }}>
                      <span
                        style={{
                          fontWeight: 600,
                          color: p.stockQuantity < 20 ? '#DC2626' : 'var(--text-main)',
                        }}
                      >
                        {p.stockQuantity} units
                      </span>
                      {p.stockQuantity < 20 && (
                        <span style={{ display: 'block', fontSize: '0.68rem', color: '#DC2626' }}>
                          Low Stock
                        </span>
                      )}
                    </td>

                    {/* Availability Switch */}
                    <td style={{ padding: '12px 10px' }}>
                      <button
                        onClick={() => handleToggleAvailability(p)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          backgroundColor: p.isAvailable ? '#DCFCE7' : '#FEE2E2',
                          color: p.isAvailable ? '#15803D' : '#B91C1C',
                        }}
                      >
                        {p.isAvailable ? 'Available' : 'Hidden'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setProductToEdit(p);
                            setIsModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px' }}
                          title="Edit Product"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px', color: '#DC2626', borderColor: '#FECACA' }}
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal for Create / Edit */}
        {isModalOpen && (
          <ProductFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            productToEdit={productToEdit}
            onProductSaved={() => fetchProducts()}
          />
        )}
      </main>

      <style>{`
        @media (max-width: 900px) {
          .admin-layout { flex-direction: column !important; }
          .admin-main { padding: 1rem !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminProductsPage;
