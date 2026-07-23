import express from 'express';
import { bookingLimiter } from '#middleware/rateLimiter.middleware.js';
import { createBooking, getAllBookings } from './booking.controller.js';
import { validateBody } from '#middleware/validation.middleware.js';
import { createBookingSchema } from './booking.validation.js';

const router = express.Router();

router.post('/booking/create', bookingLimiter, validateBody(createBookingSchema), createBooking);
router.get('/booking/all', getAllBookings);

export default router;
