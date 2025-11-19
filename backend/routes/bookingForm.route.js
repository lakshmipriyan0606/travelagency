import express from "express";
import Booking from "../models/Booking.model.js";
import { sendEmail } from "../services/email.service.js";
import { v4 as uuidv4 } from "uuid";
import { encryptValue, decryptValue } from "../utils/crypto.js";

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
      noOfPeople,
      vacationType,
      name,
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

      // Encrypt sensitive fields
      email: email ? encryptValue(email.toLowerCase().trim()) : "",
      phone: phone ? encryptValue(phone) : "",
      whatsapp: whatsapp ? encryptValue(whatsapp) : null,

      travelDate: travelDateObj,
      noOfPeople: peopleCount,
    });

    await newBooking.save();

    const bookingData = {
      bookingId,
      name,
      email,
      phone,
      whatsapp,
      city,
      destination,
      travelDate: travelDateObj,
      noOfPeople: peopleCount,
      vacationType,
    };

    // Send confirmation to customer
    await sendEmail({
      to: email,
      subject: `Your Trip Confirmed - ${bookingId}`,
      html: `<h2>Booking Confirmed!</h2>
             <p>Booking ID: <strong>${bookingId}</strong></p>
             <p>Travel Date: <strong>${
               travelDateObj?.toDateString() || "-"
             }</strong></p>
             <p>No. of People: <strong>${peopleCount || "-"}</strong></p>`,
    });

    // Send notification to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Booking: ${bookingId}`,
      html: `<h2>New Booking Received</h2>
             <pre>${JSON.stringify(bookingData, null, 2)}</pre>`,
    });

    res.status(201).json({ success: true, bookingId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
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
      phone: decryptValue(b.phone),
      whatsapp: decryptValue(b.whatsapp),
      city: b.city,
      destination: b.destination,
      travelDate: b.travelDate,
      noOfPeople: b.noOfPeople,
      vacationType: b.vacationType,
    }));

    res.status(200).json({ success: true, bookings: decryptedBookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
