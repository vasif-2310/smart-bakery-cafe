const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');

/**
 * Checks validationResult from express-validator schemas.
 * If errors exist, returns a 400 Bad Request with field-level details.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));
    return ApiResponse.error(res, 'Validation failed for request payload', 400, formattedErrors);
  }
  next();
};

module.exports = validateRequest;
