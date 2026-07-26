import express from 'express';
import { bookingLimiter } from '#b2c/middleware/rateLimiter.middleware.js';
import { createBooking, getAllBookings } from './booking.controller.js';
import { validateBody } from '#shared/middleware/validation.middleware.js';
import { createBookingSchema } from './booking.validation.js';

const router = express.Router();

router.post('/create', bookingLimiter, validateBody(createBookingSchema), createBooking);
router.get('/all', getAllBookings);

export default router;
