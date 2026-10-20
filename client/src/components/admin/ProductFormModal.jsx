import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Sparkles, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../common/Toast';

const ALLERGEN_OPTIONS = ['Gluten', 'Dairy', 'Eggs', 'Nuts', 'Soy', 'Sesame'];

export const ProductFormModal = ({ isOpen, onClose, productToEdit, onProductSaved }) => {
  const { showToast } = useToast();
  const isEditing = Boolean(productToEdit);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Bakery',
    subcategory: '',
    description: '',
    price: '',
    stockQuantity: 50,
    preparationTime: 20,
    imageUrl: '',
    isVegetarian: true,
    isAvailable: true,
    allergens: ['Gluten', 'Dairy'],
    isCakeCustomizable: false,
    cakeOptions: {
      allowEggless: true,
      allowCustomMessage: true,
      flavors: ['Chocolate Truffle', 'Vanilla Bean', 'Red Velvet'],
      sizes: [
        { name: '0.5 kg (Serves 4-6)', priceDelta: 0 },
        { name: '1.0 kg (Serves 8-10)', priceDelta: 400 },
      ],
    },
    isBeverageCustomizable: false,
    beverageOptions: {
      milkChoices: ['Whole Milk', 'Oat Milk (+₹50)', 'Almond Milk (+₹50)'],
      sweetnessLevels: ['Regular (100%)', 'Less Sweet (50%)', 'Zero Sugar (0%)'],
      sizes: [
        { name: 'Regular (250ml)', priceDelta: 0 },
        { name: 'Large (350ml)', priceDelta: 60 },
      ],
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        category: productToEdit.category || 'Bakery',
        subcategory: productToEdit.subcategory || '',
        description: productToEdit.description || '',
        price: productToEdit.price || '',
        stockQuantity: productToEdit.stockQuantity || 0,
        preparationTime: productToEdit.preparationTime || 20,
        imageUrl: productToEdit.imageUrl || '',
        isVegetarian: productToEdit.isVegetarian !== undefined ? productToEdit.isVegetarian : true,
        isAvailable: productToEdit.isAvailable !== undefined ? productToEdit.isAvailable : true,
        allergens: productToEdit.allergens || [],
        isCakeCustomizable: Boolean(productToEdit.customizationOptions?.cake),
        cakeOptions: productToEdit.customizationOptions?.cake || {
          allowEggless: true,
          allowCustomMessage: true,
          flavors: ['Chocolate Truffle', 'Vanilla Bean'],
          sizes: [{ name: '0.5 kg', priceDelta: 0 }],
        },
        isBeverageCustomizable: Boolean(productToEdit.customizationOptions?.beverage),
        beverageOptions: productToEdit.customizationOptions?.beverage || {
          milkChoices: ['Whole Milk', 'Oat Milk'],
          sweetnessLevels: ['Regular', 'Zero Sugar'],
          sizes: [{ name: 'Regular', priceDelta: 0 }],
        },
      });
    } else {
      // Reset defaults
      setFormData({
        name: '',
        category: 'Bakery',
        subcategory: '',
        description: '',
        price: '',
        stockQuantity: 50,
        preparationTime: 20,
        imageUrl: '',
        isVegetarian: true,
        isAvailable: true,
        allergens: ['Gluten', 'Dairy'],
        isCakeCustomizable: false,
        cakeOptions: {
          allowEggless: true,
          allowCustomMessage: true,
          flavors: ['Chocolate Truffle', 'Vanilla Bean', 'Red Velvet'],
          sizes: [
            { name: '0.5 kg (Serves 4-6)', priceDelta: 0 },
            { name: '1.0 kg (Serves 8-10)', priceDelta: 400 },
          ],
        },
        isBeverageCustomizable: false,
        beverageOptions: {
          milkChoices: ['Whole Milk', 'Oat Milk (+₹50)', 'Almond Milk (+₹50)'],
          sweetnessLevels: ['Regular (100%)', 'Less Sweet (50%)', 'Zero Sugar (0%)'],
          sizes: [
            { name: 'Regular (250ml)', priceDelta: 0 },
            { name: 'Large (350ml)', priceDelta: 60 },
          ],
        },
      });
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAllergenToggle = (allergen) => {
    setFormData((prev) => {
      const exists = prev.allergens.includes(allergen);
      return {
        ...prev,
        allergens: exists
          ? prev.allergens.filter((a) => a !== allergen)
          : [...prev.allergens, allergen],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.description) {
      setErrorMessage('Please fill in product name, price, and description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      subcategory: formData.subcategory.trim() || formData.category,
      description: formData.description.trim(),
      price: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity),
      preparationTime: Number(formData.preparationTime),
      imageUrl: formData.imageUrl.trim() || '/placeholder-food.svg',
      isVegetarian: formData.isVegetarian,
      isAvailable: formData.isAvailable,
      allergens: formData.allergens,
      customizationOptions: {},
    };

    if (formData.isCakeCustomizable) {
      payload.customizationOptions.cake = formData.cakeOptions;
    }
    if (formData.isBeverageCustomizable) {
      payload.customizationOptions.beverage = formData.beverageOptions;
    }

    try {
      let res;
      if (isEditing) {
        res = await api.put(`/products/${productToEdit._id}`, payload);
        showToast(`'${formData.name}' updated successfully!`, 'success');
      } else {
        res = await api.post('/products', payload);
        showToast(`'${formData.name}' created and added to the menu!`, 'success');
      }

      if (onProductSaved) onProductSaved(res.data.product || res.data);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save product.';
      setErrorMessage(msg);
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(5px)',
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
          maxWidth: '740px',
          maxHeight: '90vh',
          backgroundColor: '#FFF',
          borderRadius: 'var(--radius-lg)',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
          padding: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            backgroundColor: '#FFF',
            zIndex: 10,
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-espresso)' }}>
              {isEditing ? `Edit: ${productToEdit.name}` : 'Add New Artisanal Product'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Configure pricing, fresh batch inventory, and customer customization rules.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ padding: '6px', borderRadius: '50%', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.75rem' }}>
          {errorMessage && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: General Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Product Name *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Belgian Truffle Gateau"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Primary Category *
              </label>
              <select
                className="input-field"
                value={formData.category}
                onChange={(e) => {
                  const cat = e.target.value;
                  setFormData({
                    ...formData,
                    category: cat,
                    isVegetarian: cat === 'Non-Vegetarian' ? false : formData.isVegetarian,
                    isCakeCustomizable: cat === 'Bakery' ? formData.isCakeCustomizable : false,
                    isBeverageCustomizable: cat === 'Cafe' ? true : false,
                  });
                }}
              >
                <option value="Bakery">Bakery (Cakes & Pastries)</option>
                <option value="Non-Vegetarian">Non-Vegetarian (Savories & Meals)</option>
                <option value="Cafe">Café (Brews & Beverages)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Base Price (₹) *
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="250"
                min="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Stock Units Available
              </label>
              <input
                type="number"
                className="input-field"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Prep Time (mins)
              </label>
              <input
                type="number"
                className="input-field"
                min="5"
                value={formData.preparationTime}
                onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Description & Flavor Profile *
            </label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Describe the layers, cocoa origin, baking technique..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Image URL
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. /placeholder-food.svg or https://images.unsplash.com/..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>

          {/* Flags & Allergens */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isVegetarian}
                  onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                  disabled={formData.category === 'Non-Vegetarian'}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: formData.isVegetarian ? '#15803D' : 'var(--text-main)' }}>
                  🌱 Vegetarian Product
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  Active & Available on Customer Menu
                </span>
              </label>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Allergen Disclaimers:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {ALLERGEN_OPTIONS.map((allergen) => (
                  <button
                    type="button"
                    key={allergen}
                    onClick={() => handleAllergenToggle(allergen)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      border: `1px solid ${formData.allergens.includes(allergen) ? '#DC2626' : 'var(--border-subtle)'}`,
                      backgroundColor: formData.allergens.includes(allergen) ? '#FEE2E2' : '#FFF',
                      color: formData.allergens.includes(allergen) ? '#991B1B' : 'var(--text-main)',
                      cursor: 'pointer',
                    }}
                  >
                    {allergen}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Customization Modules */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: '14px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-espresso)', display: 'block', marginBottom: '10px' }}>
              Interactive Builder Settings
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isCakeCustomizable}
                  onChange={(e) => setFormData({ ...formData, isCakeCustomizable: e.target.checked })}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  🎂 Enable Personalized Cake Customizer (Live Piped Message & Eggless Option)
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isBeverageCustomizable}
                  onChange={(e) => setFormData({ ...formData, isBeverageCustomizable: e.target.checked })}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  ☕ Enable Beverage Customizer (Milk Alternatives, Sweetness & Size Options)
                </span>
              </label>
            </div>
          </div>

          {/* Action Footer */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
              marginTop: '1.75rem',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1rem',
            }}
          >
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
              {isSubmitting ? 'Saving to Catalogue...' : isEditing ? 'Save Product Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
