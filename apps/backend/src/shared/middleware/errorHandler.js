/**
 * ============================================================================
 * Global Error Handler Middleware
 * ============================================================================
 *
 * Layer:
 * Middleware / Infrastructure
 *
 * Responsibility:
 * Catch-all error handler for Express. Intercepts any `next(err)` calls.
 * Ensures consistent JSON response structure and prevents stack traces
 * from leaking into the production API response.
 *
 * Called By:
 * src/app.js (registered as the final middleware)
 * ============================================================================
 */
import { logger } from '#shared/utils/logger.js';

export const globalErrorHandler = (err, req, res, _next) => {
  // Mongoose schema / cast failures are client errors, not 500s
  if (err.name === 'ValidationError') {
    err.statusCode = 400;
    err.isOperational = true;
  } else if (err.name === 'CastError') {
    err.statusCode = 400;
    err.isOperational = true;
    err.message = `Invalid value for ${err.path || 'field'}`;
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    logger.error({ err, req }, 'Error caught in development');
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.statusCode,
        errorCode: err.code || undefined,
        message: err.message,
        details: err,
        stack: err.stack,
      },
    });
  }

  // Production Error Response
  if (err.isOperational) {
    logger.warn({ err }, `Operational Error: ${err.message}`);
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.statusCode,
        errorCode: err.code || undefined,
        message: err.message,
      },
    });
  }

  // Programming or other unknown error: don't leak error details
  logger.error({ err }, 'Unexpected Error in Production');
  return res.status(500).json({
    success: false,
    error: {
      code: 500,
      message: 'Internal Server Error',
    },
  });
};
