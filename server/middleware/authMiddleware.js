const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

/**
 * Protect routes: verifies JWT in HTTP-Only cookies or Authorization header
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check HTTP-Only cookie first (primary secure channel)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Check Bearer Authorization header (for automated testing or external API consumers)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return ApiResponse.error(res, 'Not authorized, authentication token missing', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_min32chars_bakery');

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return ApiResponse.error(res, 'The user belonging to this token no longer exists', 401);
    }

    if (!user.isActive) {
      return ApiResponse.error(res, 'This user account has been deactivated', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    return ApiResponse.error(res, 'Invalid or expired authentication token', 401);
  }
};

/**
 * Restrict routes to specific user roles (e.g. 'admin', 'delivery_agent')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Access denied. Your role (${req.user ? req.user.role : 'unauthenticated'}) is not authorized for this resource.`,
        403
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
