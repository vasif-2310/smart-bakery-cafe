const mongoose = require('mongoose');
const { INVENTORY_STATUS } = require('../config/constants');

const InventoryBatchSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    batchNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Batch initial quantity must be at least 1'],
    },
    remainingQuantity: {
      type: Number,
      required: true,
      min: [0, 'Remaining quantity cannot be negative'],
    },
    manufacturingDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(INVENTORY_STATUS),
      default: INVENTORY_STATUS.ACTIVE,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-update batch status based on remaining stock and current date
InventoryBatchSchema.pre('save', function (next) {
  if (this.expiryDate && new Date(this.expiryDate) < new Date()) {
    this.status = INVENTORY_STATUS.EXPIRED;
  } else if (this.remainingQuantity === 0) {
    this.status = INVENTORY_STATUS.DEPLETED;
  } else {
    this.status = INVENTORY_STATUS.ACTIVE;
  }
  next();
});

// Compound Index for First-Expired First-Out (FEFO) stock reservation queries
InventoryBatchSchema.index({ product: 1, status: 1, expiryDate: 1 });

module.exports = mongoose.model('InventoryBatch', InventoryBatchSchema);
