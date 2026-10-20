const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductByIdOrSlug,
  getFeaturedAndCombos,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createProductValidator, updateProductValidator } = require('../validators/productValidator');
const { ROLES } = require('../config/constants');

// Public catalog browsing
router.get('/', getAllProducts);
router.get('/meta/featured-and-combos', getFeaturedAndCombos);
router.get('/:identifier', getProductByIdOrSlug);

// Admin-only product mutation endpoints
router.post('/', protect, authorize(ROLES.ADMIN), createProductValidator, validateRequest, createProduct);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateProductValidator, validateRequest, updateProduct);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteProduct);

module.exports = router;
