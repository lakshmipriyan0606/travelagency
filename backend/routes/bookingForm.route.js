import express from "express";
import Booking from "../models/Booking.model.js";
import { v4 as uuidv4 } from "uuid";
import { encryptValue, decryptValue } from "../utils/crypto.js";
import { bookingLimiter } from "../middlewares/rateLimiter.middleware.js";
import { enqueueBookingIntegrations } from "../services/bookingQueue.service.js";

const router = express.Router();

// Create booking (strict limit — only this route, not GET /booking/all)
router.post("/booking/create", bookingLimiter, async (req, res) => {
  try {
    const {
      city,
      email,
      phone,
      whatsapp,
      destination,
      travelDate,
      travelMonth,
      noOfPeople,
      duration,
      vacationType,
      name,
      language,
      packageName,
    } = req.body;

    const bookingId = `ID-${uuidv4().split("-")[0].toUpperCase()}`;

    const travelDateObj = travelDate ? new Date(travelDate) : null;

    const newBooking = new Booking({
      bookingId,
      name: name ? name : "",
      city: city || "",
      destination: destination || "",
      packageName: packageName || "",
      vacationType: vacationType || "",
      duration: duration || "",
      language: language || "",

      email: email ? encryptValue(email.toLowerCase().trim()) : "",
      phone: phone || whatsapp ? encryptValue(phone || whatsapp) : "",
      whatsapp: whatsapp ? encryptValue(whatsapp) : null,

      travelDate: travelDateObj,
      travelMonth: travelMonth || "",
      noOfPeople: noOfPeople ? String(noOfPeople) : "",
    });

    await newBooking.save();

    console.log(`✅ Booking ${bookingId} saved to database`);

    const integrationPayload = {
      bookingId,
      city: city || "",
      name: name || "",
      email: email || "",
      whatsapp: whatsapp || "",
      destination: destination || "",
      packageName: packageName || "",
      travelMonth: travelMonth || "",
      noOfPeople: noOfPeople || "",
      duration: duration || "",
      language: language || "",
    };

    // Queue integration processing so API returns immediately.
    // Statuses remain "Pending" until the worker updates this booking row.
    try {
      await enqueueBookingIntegrations(integrationPayload);
      console.log(`📥 Booking integrations queued for ${bookingId}`);
    } catch (err) {
      // Queue failure is visible in admin dashboard.
      await Booking.findOneAndUpdate(
        { bookingId },
        {
          sheetSyncStatus: "Failed",
          userEmailStatus: "Failed",
          adminEmailStatus: "Failed",
          errorLogs: [
            {
              task: "Queue Booking Integrations",
              message: err.message || "Failed to queue booking integrations",
            },
          ],
        }
      );
      console.error(`❌ Queue booking integrations failed for ${bookingId}:`, err.message);
    }

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
      phone: decryptValue(b.phone),
      whatsapp: decryptValue(b.whatsapp),
      destination: b.destination,
      packageName: b.packageName,
      travelMonth: b.travelMonth,
      travelDate: b.travelDate,
      noOfPeople: b.noOfPeople,
      duration: b.duration,
      language: b.language,
      createdAt: b.createdAt,
      sheetSyncStatus: b.sheetSyncStatus,
      userEmailStatus: b.userEmailStatus,
      adminEmailStatus: b.adminEmailStatus,
      errorLogs: b.errorLogs,
    }));

    res.status(200).json({ success: true, bookings: decryptedBookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
