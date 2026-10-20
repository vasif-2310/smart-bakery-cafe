const mongoose = require('mongoose');
const { DELIVERY_DEFAULTS } = require('../config/constants');

const BakerySettingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'Smart Bakery & Café',
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Artisanal Bakes & Handcrafted Brews',
    },
    address: {
      street: { type: String, default: 'Shop 14, Inner Circle, Connaught Place' },
      city: { type: String, default: 'New Delhi' },
      state: { type: String, default: 'Delhi' },
      postalCode: { type: String, default: '110001' },
      coordinates: {
        lat: { type: Number, default: DELIVERY_DEFAULTS.BAKERY_LAT },
        lng: { type: Number, default: DELIVERY_DEFAULTS.BAKERY_LNG },
      },
    },
    deliveryRadiusKm: {
      type: Number,
      default: DELIVERY_DEFAULTS.MAX_RADIUS_KM,
      min: 1,
      max: 25,
    },
    deliveryBaseFee: {
      type: Number,
      default: DELIVERY_DEFAULTS.BASE_FEE,
      min: 0,
    },
    freeDeliveryThreshold: {
      type: Number,
      default: DELIVERY_DEFAULTS.FREE_DELIVERY_THRESHOLD,
      min: 0,
    },
    taxRatePercentage: {
      type: Number,
      default: DELIVERY_DEFAULTS.TAX_RATE_PERCENTAGE,
      min: 0,
      max: 28,
    },
    currencySymbol: {
      type: String,
      default: '₹',
    },
    contactPhone: {
      type: String,
      default: '+91 98765 43210',
    },
    contactEmail: {
      type: String,
      default: 'hello@smartbakery.com',
    },
    isStoreOpen: {
      type: Boolean,
      default: true,
    },
    operatingHours: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '22:00' },
    },
  },
  {
    timestamps: true,
  }
);

// Static method to retrieve the single configuration instance or create with defaults
BakerySettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('BakerySettings', BakerySettingsSchema);
