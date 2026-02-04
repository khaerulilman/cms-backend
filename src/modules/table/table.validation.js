import Joi from 'joi';

import { ERROR_MESSAGES } from '../../constants/http.js';

export const tableValidationSchemas = {
  // Create table validation schema
  createTable: Joi.object({
    projectId: Joi.string().uuid().required().messages({
      'string.empty': 'Project ID is required',
      'string.guid': 'Project ID must be a valid UUID',
      'any.required': 'Project ID is required',
    }),
    name: Joi.string().min(1).max(255).trim().required().messages({
      'string.empty': 'Table name is required',
      'string.min': 'Table name cannot be empty',
      'string.max': 'Table name cannot exceed 255 characters',
      'any.required': 'Table name is required',
    }),
    isSubTable: Joi.boolean().optional().messages({
      'boolean.base': 'isSubTable must be a boolean',
    }),
  }),

  // Update table validation schema
  updateTable: Joi.object({
    name: Joi.string().min(1).max(255).trim().required().messages({
      'string.empty': 'Table name cannot be empty',
      'string.min': 'Table name cannot be empty',
      'string.max': 'Table name cannot exceed 255 characters',
      'any.required': 'Table name is required',
    }),
  }),
};

export default tableValidationSchemas;
