import { logger } from '../../shared/logger.js';

export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    logger.error({ err, req }, 'Error caught in development');
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Production Error Response
  if (err.isOperational) {
    logger.warn({ err }, `Operational Error: ${err.message}`);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming or other unknown error: don't leak error details
  logger.error({ err }, 'Unexpected Error in Production');
  return res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!',
  });
};
