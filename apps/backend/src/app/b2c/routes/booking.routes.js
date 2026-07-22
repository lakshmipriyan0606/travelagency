import express from "express";
import { bookingLimiter } from "../../../middlewares/rateLimiter.middleware.js";
import { createBooking } from "../../../modules/bookings/booking.controller.js";

const router = express.Router();

router.post("/booking/create", bookingLimiter, createBooking);

export default router;
