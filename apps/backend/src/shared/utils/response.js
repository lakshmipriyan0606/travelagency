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

/** Strip Mongoose Document / session graph so res.json never hits circular MongoClient refs. */
const toPlainPayload = (data) => {
  if (data == null || typeof data !== 'object') return data;
  if (typeof data.toJSON === 'function') return data.toJSON();
  if (typeof data.toObject === 'function') return data.toObject();
  return data;
};

export const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
  const response = {
    success: true,
    message,
  };

  const plain = toPlainPayload(data);

  if (plain !== null && typeof plain === 'object' && !Array.isArray(plain)) {
    Object.assign(response, plain);
  } else if (plain !== null) {
    response.data = plain;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};
