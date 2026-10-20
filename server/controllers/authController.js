const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const { ROLES } = require('../config/constants');

/**
 * Generates JWT and attaches it as an HTTP-Only secure cookie
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_min32chars_bakery',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const cookieExpireDays = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7;
  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  return ApiResponse.success(
    res,
    {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
        favorites: user.favorites,
      },
      token, // Also return token in JSON for non-browser/test consumers
    },
    'Authentication successful',
    statusCode
  );
};

/**
 * @desc    Register a new customer account
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ApiResponse.error(res, 'An account with this email address already exists', 409);
    }

    // New registrations are always assigned the customer role
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: ROLES.CUSTOMER,
    });

    return sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & return cookie token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return ApiResponse.error(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return ApiResponse.error(res, 'Invalid email or password', 401);
    }

    return sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out user & clear HTTP-Only cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  return ApiResponse.success(res, null, 'Logged out successfully');
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('favorites', 'name slug price imageUrl category isVegetarian');
  return ApiResponse.success(res, { user }, 'Current profile retrieved');
};

/**
 * @desc    Update user profile name & phone
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();
    return ApiResponse.success(res, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a delivery address to user's saved list
 * @route   POST /api/auth/addresses
 * @access  Private
 */
const addAddress = async (req, res, next) => {
  try {
    const { label, street, landmark, city, state, postalCode, coordinates, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push({
      label: label || 'Home',
      street,
      landmark,
      city,
      state: state || 'Delhi',
      postalCode,
      coordinates,
      isDefault: isDefault || user.addresses.length === 0,
    });

    await user.save();
    return ApiResponse.success(res, { addresses: user.addresses }, 'Address added successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a delivery address
 * @route   DELETE /api/auth/addresses/:addressId
 * @access  Private
 */
const removeAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter((addr) => addr._id.toString() !== req.params.addressId);
    await user.save();
    return ApiResponse.success(res, { addresses: user.addresses }, 'Address removed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle product in favorites
 * @route   POST /api/auth/favorites/:productId
 * @access  Private
 */
const toggleFavorite = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;

    const index = user.favorites.indexOf(productId);
    let action = '';
    if (index > -1) {
      user.favorites.splice(index, 1);
      action = 'removed from';
    } else {
      user.favorites.push(productId);
      action = 'added to';
    }

    await user.save();
    return ApiResponse.success(res, { favorites: user.favorites }, `Product ${action} favorites`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  addAddress,
  removeAddress,
  toggleFavorite,
};
