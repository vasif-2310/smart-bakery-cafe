const mongoose = require('mongoose');
const { CATEGORIES } = require('../config/constants');

const SizeOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "500g", "1kg", "Regular", "Large"
    priceDelta: { type: Number, default: 0 }, // Additional price over base
  },
  { _id: false }
);

const AddonOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Extra Espresso Shot", "Oat Milk", "Whipped Cream"
    priceDelta: { type: Number, default: 0 },
  },
  { _id: false }
);

const CustomizationOptionsSchema = new mongoose.Schema(
  {
    sizes: [SizeOptionSchema],
    flavors: [String], // e.g. ["Belgian Chocolate", "Dutch Truffle", "Hazelnut"]
    frostings: [String], // e.g. ["Dark Ganache", "Buttercream", "Cream Cheese"]
    allowCustomMessage: { type: Boolean, default: false }, // For cakes
    maxMessageLength: { type: Number, default: 35 },
    beverageAddons: [AddonOptionSchema],
    sweetnessLevels: [String], // e.g. ["No Sugar", "Less Sugar", "Regular Sugar"]
    temperatureOptions: [String], // e.g. ["Hot", "Iced"]
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: Object.values(CATEGORIES),
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Base price in INR is required'],
      min: [0, 'Price must be positive'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Product image URL is required'],
    },
    isVegetarian: {
      type: Boolean,
      default: true,
      index: true,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    allergens: {
      type: [String],
      default: [], // e.g. ["Gluten", "Dairy", "Nuts", "Eggs", "Soy"]
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 50,
      min: [0, 'Stock cannot be negative'],
    },
    preparationTime: {
      type: Number,
      required: [true, 'Preparation time in minutes is required'],
      default: 15, // in minutes
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    customizationOptions: {
      type: CustomizationOptionsSchema,
      default: () => ({}),
    },
    averageRating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 12,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate URL-friendly slug before save
ProductSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Compound Indexes for fast catalog browsing, category filtering, and text search
ProductSchema.index({ category: 1, isAvailable: 1, price: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
