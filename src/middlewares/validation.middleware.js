import { HTTP_STATUS, ERROR_MESSAGES } from "../constants/http.js";

/**
 * Validation middleware factory
 * @param {Joi.Schema} schema - Joi schema untuk validasi
 * @returns {Function} Express middleware
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        errors: messages,
      });
    }

    // Replace req.body with validated value
    req.body = value;
    next();
  };
};

export default validateRequest;
