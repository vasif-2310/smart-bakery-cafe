const { body } = require('express-validator');
const { CATEGORIES } = require('../config/constants');

const createProductValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('category')
    .isIn(Object.values(CATEGORIES))
    .withMessage(`Category must be one of: ${Object.values(CATEGORIES).join(', ')}`),
  body('price')
    .isFloat({ min: 1 })
    .withMessage('Base price must be a positive number in INR'),
  body('imageUrl')
    .isURL()
    .withMessage('A valid image URL is required'),
  body('isVegetarian')
    .isBoolean()
    .withMessage('Vegetarian status must be a boolean'),
  body('stockQuantity')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('preparationTime')
    .isInt({ min: 1 })
    .withMessage('Preparation time in minutes must be at least 1 minute'),
];

const updateProductValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('category')
    .optional()
    .isIn(Object.values(CATEGORIES)),
  body('price')
    .optional()
    .isFloat({ min: 1 }),
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 }),
];

module.exports = {
  createProductValidator,
  updateProductValidator,
};
