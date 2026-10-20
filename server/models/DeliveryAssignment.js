const mongoose = require('mongoose');

const DeliveryAssignmentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
      index: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['assigned', 'picked_up', 'in_transit', 'delivered', 'failed'],
      default: 'assigned',
      index: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    pickedUpAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    deliveryConfirmationPin: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(), // 4-digit customer delivery OTP
    },
    deliveryNotes: {
      type: String,
      trim: true,
    },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
      updatedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

DeliveryAssignmentSchema.index({ agent: 1, status: 1 });

module.exports = mongoose.model('DeliveryAssignment', DeliveryAssignmentSchema);
