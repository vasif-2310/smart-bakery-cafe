const mongoose = require('mongoose');
const { ORDER_STATUS, ORDER_TYPES, PAYMENT_METHODS, PAYMENT_STATUS } = require('../config/constants');

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true }, // Historical immutable snapshot
    price: { type: Number, required: true }, // Base unit price at purchase time
    quantity: { type: Number, required: true, min: 1 },
    customizations: {
      size: {
        name: { type: String },
        priceDelta: { type: Number, default: 0 },
      },
      flavor: { type: String },
      frosting: { type: String },
      customMessage: { type: String, maxlength: 40 },
      beverageAddons: [
        {
          name: { type: String },
          priceDelta: { type: Number, default: 0 },
        },
      ],
      sweetness: { type: String },
      temperature: { type: String },
    },
    unitPrice: { type: Number, required: true }, // (base + customization deltas)
    subtotal: { type: Number, required: true }, // unitPrice * quantity
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderType: {
      type: String,
      enum: Object.values(ORDER_TYPES),
      default: ORDER_TYPES.DELIVERY,
    },
    items: [OrderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    couponCode: {
      type: String,
      uppercase: true,
      trim: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryAddress: {
      street: { type: String },
      landmark: { type: String },
      city: { type: String },
      postalCode: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
      distanceKm: { type: Number }, // Haversine distance validated on server
      notes: { type: String },
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    deliveryAssignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryAssignment',
    },
    qrCodeData: {
      type: String, // Base64 DataURL or HMAC signed verification token for pickup
    },
    qrCodeVerified: {
      type: Boolean,
      default: false,
    },
    estimatedDeliveryTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Index for Customer Order History & Admin Filtering
OrderSchema.index({ customer: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);
