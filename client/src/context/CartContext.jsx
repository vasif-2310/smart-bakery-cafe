import React, { createContext, useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useToast } from '../components/common/Toast';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_bakery_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_bakery_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const { addToast } = useToast();

  // Synchronize cart with LocalStorage
  useEffect(() => {
    localStorage.setItem('smart_bakery_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('smart_bakery_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('smart_bakery_coupon');
    }
  }, [appliedCoupon]);

  /**
   * Generates a unique key for an item including its specific customization options
   */
  const getItemKey = (productId, customizations = {}) => {
    const custString = JSON.stringify(customizations || {});
    return `${productId}_${custString}`;
  };

  /**
   * Add item to cart with custom options
   */
  const addToCart = (product, quantity = 1, customizations = {}) => {
    const itemKey = getItemKey(product._id, customizations);

    // Compute unit price including customizations
    let unitPrice = product.price;
    if (customizations.size?.priceDelta) {
      unitPrice += Number(customizations.size.priceDelta);
    }
    if (Array.isArray(customizations.beverageAddons)) {
      customizations.beverageAddons.forEach((addon) => {
        if (addon.priceDelta) unitPrice += Number(addon.priceDelta);
      });
    }

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.itemKey === itemKey);

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        addToast(`Updated quantity for ${product.name}`, 'info');
        return updated;
      } else {
        addToast(`Added ${product.name} to cart`, 'success');
        return [
          ...prevItems,
          {
            itemKey,
            productId: product._id,
            name: product.name,
            imageUrl: product.imageUrl,
            category: product.category,
            basePrice: product.price,
            unitPrice,
            quantity,
            customizations,
            preparationTime: product.preparationTime,
          },
        ];
      }
    });
  };

  /**
   * Update item quantity
   */
  const updateQuantity = (itemKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemKey);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.itemKey === itemKey ? { ...item, quantity } : item))
    );
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = (itemKey) => {
    setItems((prevItems) => prevItems.filter((item) => item.itemKey !== itemKey));
    addToast('Item removed from cart', 'info');
  };

  /**
   * Clear entire cart
   */
  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem('smart_bakery_cart');
    localStorage.removeItem('smart_bakery_coupon');
  };

  /**
   * Apply coupon code
   */
  const applyCouponCode = async (code) => {
    try {
      const response = await api.post('/coupons/apply', {
        code,
        subtotal,
      });

      if (response.data) {
        setAppliedCoupon(response.data);
        addToast(`Coupon ${code.toUpperCase()} applied! Saved ₹${response.data.discount}`, 'success');
        return { success: true };
      }
    } catch (error) {
      addToast(error.message || 'Invalid coupon code', 'error');
      return { success: false, message: error.message };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast('Coupon removed', 'info');
  };

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [items]);

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.discount || 0;
  }, [appliedCoupon]);

  const deliveryFee = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= 500 ? 0 : 40;
  }, [subtotal]);

  const tax = useMemo(() => {
    const taxable = Math.max(0, subtotal - discount);
    return Math.round(taxable * 0.05); // 5% GST
  }, [subtotal, discount]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount + deliveryFee + tax);
  }, [subtotal, discount, deliveryFee, tax]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        cartItems: items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        discount,
        deliveryFee,
        tax,
        total,
        itemCount,
        appliedCoupon,
        coupon: appliedCoupon,
        applyCouponCode,
        applyCoupon: applyCouponCode,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
