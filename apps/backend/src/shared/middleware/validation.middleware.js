import { z } from 'zod';
import { logger } from '#shared/utils/logger.js';

/**
 * Higher-order middleware function that returns an Express middleware.
 * Validates the request body against a Zod schema.
 *
 * @param {z.ZodSchema} schema The Zod schema to validate against
 */
export const validateBody = (schema) => {
  return async (req, res, next) => {
    try {
      // parseAsync handles both synchronous and asynchronous schema validations
      const validatedData = await schema.parseAsync(req.body);

      // Replace req.body with the sanitized/validated data
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError || error.name === 'ZodError') {
        const issues = error.errors || error.issues || [];
        logger.warn({ path: req.originalUrl, errors: issues }, 'Validation failed');
        return res.status(400).json({
          success: false,
          message: 'Invalid request data',
          errors: issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      logger.error({ err: error }, 'Unexpected validation error');
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error during validation' });
    }
  };
};
