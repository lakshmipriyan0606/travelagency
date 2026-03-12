import express from "express";
import Booking from "../models/Booking.model.js";
import { sendEmail } from "../services/email.service.js";
import { v4 as uuidv4 } from "uuid";
import { encryptValue, decryptValue } from "../utils/crypto.js";
import { syncBookingToSheet } from "../services/googleSheets.service.js";

const router = express.Router();

// Create booking
router.post("/booking/create", async (req, res) => {
  try {
    const {
      city,
      email,
      phone,
      whatsapp,
      destination,
      travelDate,
      travelMonth, // Added
      noOfPeople,
      duration, // Added
      vacationType,
      name,
      language, // Added
    } = req.body;

    const bookingId = `ID-${uuidv4().split("-")[0].toUpperCase()}`;

    // Convert travelDate and noOfPeople to proper types
    const travelDateObj = travelDate ? new Date(travelDate) : null;
    const peopleCount = noOfPeople ? Number(noOfPeople) : null;

    const newBooking = new Booking({
      bookingId,
      name: name ? name : "",
      city: city || "",
      destination: destination || "",
      vacationType: vacationType || "",
      duration: duration || "",
      language: language || "",

      // Encrypt sensitive fields
      email: email ? encryptValue(email.toLowerCase().trim()) : "",
      phone: (phone || whatsapp) ? encryptValue(phone || whatsapp) : "", // Fallback to whatsapp if phone is empty
      whatsapp: whatsapp ? encryptValue(whatsapp) : null,

      travelDate: travelDateObj,
      travelMonth: travelMonth || "",
      noOfPeople: noOfPeople ? String(noOfPeople) : "",
    });

    await newBooking.save();

    const bookingData = {
      bookingId,
      name: name || "",
      email: email || "",
      whatsapp: whatsapp || "",
      destination: destination || "",
      travelMonth: travelMonth || "",
      noOfPeople: noOfPeople || "",
      duration: duration || "",
      language: language || "",
    };

    // Sync to Google Sheets
    await syncBookingToSheet(bookingData);

    // Send confirmation to customer
    try {
      await sendEmail({
        to: email,
        subject: `Your Trip Confirmed - ${bookingId}`,
        html: `<h2>Booking Confirmed!</h2>
               <p>Booking ID: <strong>${bookingId}</strong></p>
               <p>Travel Date: <strong>${travelDateObj?.toDateString() || "-"}</strong></p>
               <p>No. of People: <strong>${noOfPeople || "-"}</strong></p>`,
      });
    } catch (emailErr) {
      console.error("Email notification failed:", emailErr.message);
    }

    console.log(`✅ Booking ${bookingId} processed successfully`);
    res.status(201).json({ success: true, bookingId });
  } catch (err) {
    console.error("🚨 Create Booking Error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
});
// Get all bookings (decrypt before sending)
router.get("/booking/all", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });

    const decryptedBookings = bookings.map((b) => ({
      bookingId: b.bookingId,
      name: b.name,
      email: decryptValue(b.email),
      phone: decryptValue(b.phone), // Still include phone for display if needed
      whatsapp: decryptValue(b.whatsapp),
      destination: b.destination,
      travelMonth: b.travelMonth,
      noOfPeople: b.noOfPeople,
      duration: b.duration,
      language: b.language,
      createdAt: b.createdAt,
    }));

    res.status(200).json({ success: true, bookings: decryptedBookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
