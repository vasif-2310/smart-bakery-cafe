const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
      default: 'percentage',
    },
    discountAmount: {
      type: Number,
      required: true,
      min: [1, 'Discount amount must be at least 1'],
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number, // Useful cap for percentage discounts (e.g. 20% off up to ₹150)
      default: null,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    usageLimit: {
      type: Number,
      default: 500,
    },
    timesUsed: {
      type: Number,
      default: 0,
    },
    applicableCategories: {
      type: [String],
      default: [], // Empty means applicable across all categories
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to validate eligibility and calculate discount amount
CouponSchema.methods.calculateDiscount = function (subtotal) {
  if (!this.isActive) {
    return { valid: false, message: 'Coupon is currently inactive' };
  }
  if (this.expiryDate && new Date(this.expiryDate) < new Date()) {
    return { valid: false, message: 'Coupon has expired' };
  }
  if (this.usageLimit && this.timesUsed >= this.usageLimit) {
    return { valid: false, message: 'Coupon usage limit has been reached' };
  }
  if (subtotal < this.minOrderValue) {
    return {
      valid: false,
      message: `Minimum order value of ₹${this.minOrderValue} required for this coupon`,
    };
  }

  let calculatedDiscount = 0;
  if (this.discountType === 'percentage') {
    calculatedDiscount = Math.round((subtotal * this.discountAmount) / 100);
    if (this.maxDiscountAmount && calculatedDiscount > this.maxDiscountAmount) {
      calculatedDiscount = this.maxDiscountAmount;
    }
  } else {
    calculatedDiscount = Math.min(this.discountAmount, subtotal);
  }

  return {
    valid: true,
    discount: calculatedDiscount,
    code: this.code,
    description: this.description,
  };
};

module.exports = mongoose.model('Coupon', CouponSchema);
