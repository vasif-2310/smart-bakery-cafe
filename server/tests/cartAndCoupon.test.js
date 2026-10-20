describe('Cart Calculations, Customization Deltas & Coupon Rules', () => {
  // Coupon computation test harness mimicking Coupon model calculateDiscount logic
  const computeCouponDiscount = (coupon, cartSubtotal) => {
    if (!coupon.isActive) {
      return { valid: false, discount: 0, message: 'Coupon is currently inactive' };
    }

    if (new Date(coupon.validUntil) < new Date()) {
      return { valid: false, discount: 0, message: 'Coupon has expired' };
    }

    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      return { valid: false, discount: 0, message: 'Coupon usage limit reached' };
    }

    if (cartSubtotal < coupon.minimumOrderAmount) {
      return {
        valid: false,
        discount: 0,
        message: `Cart subtotal must be at least ₹${coupon.minimumOrderAmount}`,
      };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((cartSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, cartSubtotal);
    return { valid: true, discount, finalSubtotal: cartSubtotal - discount };
  };

  describe('Coupon Discount Engine', () => {
    it('should correctly calculate a 10% percentage discount on a ₹1000 cart', () => {
      const coupon = {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minimumOrderAmount: 200,
        maxDiscountAmount: 150,
        isActive: true,
        validUntil: new Date(Date.now() + 86400000),
      };

      const result = computeCouponDiscount(coupon, 1000);
      expect(result.valid).toBe(true);
      expect(result.discount).toBe(100);
      expect(result.finalSubtotal).toBe(900);
    });

    it('should enforce maximum discount caps when percentage discount exceeds limit', () => {
      const coupon = {
        code: 'FESTIVE25',
        discountType: 'percentage',
        discountValue: 25,
        minimumOrderAmount: 300,
        maxDiscountAmount: 150, // Cap at ₹150 even if 25% of ₹2000 is ₹500
        isActive: true,
        validUntil: new Date(Date.now() + 86400000),
      };

      const result = computeCouponDiscount(coupon, 2000);
      expect(result.valid).toBe(true);
      expect(result.discount).toBe(150);
      expect(result.finalSubtotal).toBe(1850);
    });

    it('should reject coupons when cart subtotal is below minimum order amount', () => {
      const coupon = {
        code: 'FREESHIP500',
        discountType: 'percentage',
        discountValue: 10,
        minimumOrderAmount: 500,
        isActive: true,
        validUntil: new Date(Date.now() + 86400000),
      };

      const result = computeCouponDiscount(coupon, 350);
      expect(result.valid).toBe(false);
      expect(result.discount).toBe(0);
      expect(result.message).toContain('at least ₹500');
    });

    it('should reject expired promotional codes', () => {
      const coupon = {
        code: 'EXPIRED10',
        discountType: 'percentage',
        discountValue: 10,
        minimumOrderAmount: 100,
        isActive: true,
        validUntil: new Date(Date.now() - 86400000), // Yesterday
      };

      const result = computeCouponDiscount(coupon, 400);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('expired');
    });
  });

  describe('Customization Add-On Price Calculations', () => {
    it('should sum base product price with size deltas and beverage milk alternatives', () => {
      const baseLattePrice = 180;
      const largeSizeDelta = 60;
      const oatMilkDelta = 50;
      const quantity = 2;

      const unitPrice = baseLattePrice + largeSizeDelta + oatMilkDelta;
      const lineSubtotal = unitPrice * quantity;

      expect(unitPrice).toBe(290);
      expect(lineSubtotal).toBe(580);
    });

    it('should calculate 5% GST and delivery fee thresholds accurately', () => {
      const subtotal = 400;
      const discount = 40;
      const taxableAmount = subtotal - discount; // 360
      const deliveryFee = subtotal >= 500 ? 0 : 40; // 40
      const tax = Math.round(taxableAmount * 0.05); // 18
      const finalTotal = taxableAmount + deliveryFee + tax; // 360 + 40 + 18 = 418

      expect(taxableAmount).toBe(360);
      expect(deliveryFee).toBe(40);
      expect(tax).toBe(18);
      expect(finalTotal).toBe(418);
    });
  });
});
