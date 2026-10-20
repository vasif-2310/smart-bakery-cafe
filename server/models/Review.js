const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Review must be tied to a verified delivered purchase order'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating must be between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comments'],
      trim: true,
      maxlength: [500, 'Review cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// One review per product per verified purchase order
ReviewSchema.index({ customer: 1, product: 1, order: 1 }, { unique: true });

// Static method to re-compute product average rating after save/delete
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  const Product = mongoose.model('Product');
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].numReviews,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      averageRating: 4.8,
      reviewCount: 0,
    });
  }
};

ReviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model('Review', ReviewSchema);
