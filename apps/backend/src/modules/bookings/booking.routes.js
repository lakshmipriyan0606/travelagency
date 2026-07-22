import express from "express";
import { bookingLimiter } from "../../middlewares/rateLimiter.middleware.js";
import { createBooking, getAllBookings } from "./booking.controller.js";

const router = express.Router();

router.post("/booking/create", bookingLimiter, createBooking);
router.get("/booking/all", getAllBookings);

export default router;
