import express from "express";
import Booking from "../models/Booking.model.js";
import { sendEmail } from "../services/email.service.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

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

    const newBooking = new Booking({
      bookingId,
      city: city || "",
      email: email.toLowerCase().trim(),
      phone,
      whatsapp: whatsapp || null,
      destination: destination || "",
      travelDate: new Date(travelDate),
      noOfPeople,
      vacationType,
      name,
    });

    await newBooking.save();

    let bookingData = newBooking.toObject();

    delete bookingData._id;
    delete bookingData.createdAt;
    delete bookingData.updatedAt;
    delete bookingData.__v;

    // Send to customer
    await sendEmail({
      to: email,
      subject: `Your Bali Trip Confirmed - ${bookingId}`,
      html: `
        <h2>Booking Confirmed! 🎉</h2>
        <p>Booking ID: <strong>${bookingId}</strong></p>
        <p>Travel Date: <strong>${travelDate}</strong></p>
        <p>No. of People: <strong>${noOfPeople}</strong></p>
        <p>We are excited to take you to Bali! 🏝️</p>
      `,
    });

    // Send to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Booking: ${bookingId}`,
      html: `
        <h2>New Booking Received</h2>
        <pre>${JSON.stringify(bookingData, null, 2)}</pre>
      `,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully!",
      bookingId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
