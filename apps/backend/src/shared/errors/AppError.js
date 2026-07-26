/**
 * ============================================================================
 * Operational Application Error
 * ============================================================================
 *
 * Layer:
 * Utilities / Error Handling
 *
 * Responsibility:
 * Custom Error class used to throw predictable, HTTP-aware operational errors
 * (e.g. 404 Not Found, 400 Bad Request) from within the service layer.
 * These are caught by the globalErrorHandler.
 *
 * Called By:
 * Services and Controllers throughout the application.
 * ============================================================================
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
