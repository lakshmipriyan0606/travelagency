/**
 * ============================================================================
 * Booking Controller
 * ============================================================================
 *
 * Layer:
 * Controller / Interface Adapter
 *
 * Responsibility:
 * Processes HTTP requests related to user bookings and administrative
 * retrieval of booking leads.
 *
 * Called By:
 * src/modules/bookings/booking.b2c.routes.js
 * src/modules/bookings/booking.admin.routes.js
 *
 * Depends On:
 * src/modules/bookings/booking.service.js
 * ============================================================================
 */
import * as bookingService from './booking.service.js';
import { sendSuccess } from '#shared/utils/response.js';

export const createBooking = async (req, res, next) => {
  try {
    const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
    const result = await bookingService.createBookingService(req.body, idempotencyKey);
    return sendSuccess(
      res,
      result.isDuplicate ? 200 : 201,
      result.isDuplicate ? 'Duplicate request ignored' : 'Booking created',
      {
        bookingId: result.bookingId,
        isDuplicate: result.isDuplicate,
      }
    );
  } catch (err) {
    next(err);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const decryptedBookings = await bookingService.getAllBookingsService();
    return sendSuccess(res, 200, 'Bookings fetched', { bookings: decryptedBookings });
  } catch (err) {
    next(err);
  }
};
