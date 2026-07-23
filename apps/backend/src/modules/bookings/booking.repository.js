/**
 * ============================================================================
 * Booking Repository
 * ============================================================================
 *
 * Layer:
 * Data Access
 *
 * Responsibility:
 * Centralizes read/write operations against the Booking collection.
 * Prevents Mongoose dependencies from leaking into the service layer.
 *
 * Called By:
 * src/modules/bookings/booking.service.js
 *
 * Depends On:
 * src/modules/bookings/booking.model.js
 * ============================================================================
 */
import mongoose from 'mongoose';
import Booking from './booking.model.js';

export const startSession = async () => {
  return await mongoose.startSession();
};

/**
 * Persists a new booking inquiry.
 *
 * @param {Object} bookingData
 * @returns {Promise<Object>} Created document
 */
export const create = async (bookingData, options = {}) => {
  const booking = new Booking(bookingData);
  return await booking.save(options);
};

export const findByIdempotencyKey = async (idempotencyKey, options = {}) => {
  return await Booking.findOne({ idempotencyKey }, null, options).lean();
};

/**
 * Fetches all matching bookings sorted chronologically.
 * lean() used to bypass Mongoose document hydration for faster memory reads.
 *
 * @param {Object} filter
 * @param {Object} sort
 * @returns {Promise<Array>}
 */
export const findSorted = async (filter = {}, sort = { createdAt: -1 }) => {
  return await Booking.find(filter).sort(sort).lean();
};

/**
 * Atomically finds and updates a booking (e.g. to mark sync status).
 *
 * @param {Object} query
 * @param {Object} update
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export const findOneAndUpdate = async (query, update, options = { new: true }) => {
  return await Booking.findOneAndUpdate(query, update, options);
};

/**
 * Looks up a specific booking strictly by its system-generated ID.
 * lean() used for memory-optimized reading.
 *
 * @param {string} bookingId
 * @returns {Promise<Object>}
 */
export const findByBookingId = async (bookingId) => {
  return await Booking.findOne({ bookingId }).lean();
};
