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

/**
 * Accept a new booking inquiry from a consumer.
 *
 * Request Flow:
 * Client
 *   ↓
 * Route (POST /api/v1/b2c/bookings/create)
 *   ↓
 * Controller (createBooking)
 *   ↓
 * Service (createBookingService)
 *   ↓
 * Database (Booking Collection) + Agenda Queue
 *   ↓
 * Response (201 Created)
 */
export const createBooking = async (req, res) => {
  try {
    const result = await bookingService.createBookingService(req.body);
    return res.status(201).json({ success: true, bookingId: result.bookingId });
  } catch (err) {
    console.error('Create Booking Error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

/**
 * Retrieve all booking inquiries.
 *
 * Request Flow:
 * Admin Client
 *   ↓
 * Auth Middleware
 *   ↓
 * Route (GET /api/v1/b2c-admin/bookings)
 *   ↓
 * Controller (getAllBookings)
 *   ↓
 * Service (getAllBookingsService) -> Repository
 *   ↓
 * Response (JSON List)
 */
export const getAllBookings = async (req, res) => {
  try {
    const decryptedBookings = await bookingService.getAllBookingsService();
    return res.status(200).json({ success: true, bookings: decryptedBookings });
  } catch (err) {
    console.error('Get All Bookings Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
