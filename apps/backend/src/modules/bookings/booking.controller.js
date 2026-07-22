import * as bookingService from "./booking.service.js";

export const createBooking = async (req, res) => {
  try {
    const result = await bookingService.createBookingService(req.body);
    return res.status(201).json({ success: true, bookingId: result.bookingId });
  } catch (err) {
    console.error("Create Booking Error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const decryptedBookings = await bookingService.getAllBookingsService();
    return res.status(200).json({ success: true, bookings: decryptedBookings });
  } catch (err) {
    console.error("Get All Bookings Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
