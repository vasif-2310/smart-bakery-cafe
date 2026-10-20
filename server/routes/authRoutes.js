const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  addAddress,
  removeAddress,
  toggleFavorite,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const validateRequest = require('../middleware/validateRequest');
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  addAddressValidator,
} = require('../validators/authValidator');

// Public Authentication endpoints with brute-force rate limiter
router.post('/register', authLimiter, registerValidator, validateRequest, register);
router.post('/login', authLimiter, loginValidator, validateRequest, login);
router.post('/logout', logout);

// Protected Customer Profile Endpoints
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileValidator, validateRequest, updateProfile);
router.post('/addresses', protect, addAddressValidator, validateRequest, addAddress);
router.delete('/addresses/:addressId', protect, removeAddress);
router.post('/favorites/:productId', protect, toggleFavorite);

module.exports = router;
