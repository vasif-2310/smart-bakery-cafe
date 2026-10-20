const express = require('express');
const router = express.Router();
const { createReview, getProductReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Public product reviews
router.get('/product/:productId', getProductReviews);

// Verified customer review submission
router.post('/', protect, createReview);

module.exports = router;
