const { body } = require('express-validator');

const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid 10-digit Indian phone number'),
];

const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 10 })
    .withMessage('Phone number must be exactly 10 digits'),
];

const addAddressValidator = [
  body('street').trim().notEmpty().withMessage('Street address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required'),
  body('coordinates.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude coordinate is required'),
  body('coordinates.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude coordinate is required'),
];

module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  addAddressValidator,
};
