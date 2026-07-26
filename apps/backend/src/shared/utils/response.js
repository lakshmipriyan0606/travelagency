/**
 * ============================================================================
 * API Response Standardization Utility
 * ============================================================================
 *
 * Responsibility:
 * Ensures all successful API responses follow a strict, predictable JSON contract
 * for frontend consumers: { success: true, message: String, data: Any, meta: Object }
 * ============================================================================
 */

export const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
    Object.assign(response, data);
  } else if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};
