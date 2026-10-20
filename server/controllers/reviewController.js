const Review = require('../models/Review');
const Order = require('../models/Order');
const ApiResponse = require('../utils/apiResponse');
const { ORDER_STATUS } = require('../config/constants');

/**
 * @desc    Submit a review for a verified delivered product purchase
 * @route   POST /api/reviews
 * @access  Private (Customer)
 */
const createReview = async (req, res, next) => {
  try {
    const { productId, orderId, rating, comment } = req.body;

    // 1. Verify that order exists, belongs to user, and is delivered
    const order = await Order.findOne({
      _id: orderId,
      customer: req.user._id,
      orderStatus: ORDER_STATUS.DELIVERED,
    });

    if (!order) {
      return ApiResponse.error(
        res,
        'You can only submit reviews for verified orders that have been successfully delivered.',
        400
      );
    }

    // 2. Verify that this order actually contains the product
    const itemInOrder = order.items.some(
      (item) => item.product.toString() === productId.toString()
    );

    if (!itemInOrder) {
      return ApiResponse.error(res, 'This product was not part of the specified order', 400);
    }

    // 3. Create Review
    const review = await Review.create({
      product: productId,
      customer: req.user._id,
      order: orderId,
      rating: Number(rating),
      comment,
    });

    return ApiResponse.created(res, { review }, 'Thank you! Your verified review has been submitted.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews for a specific product
 * @route   GET /api/reviews/product/:productId
 * @access  Public
 */
const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, { reviews }, 'Product reviews retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getProductReviews,
};
