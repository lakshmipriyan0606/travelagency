import express from "express";
import Booking from "../models/Booking.model.js";
import { sendBookingEmailNow } from "../services/email.service.js";
import { sendWhatsAppMessage } from "../services/whatsapp.service.js";
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

    let sheetSyncStatus = "Pending";
    let userEmailStatus = "Pending";
    let adminEmailStatus = "Pending";
    const errorLogs = [];

    const bookingData = {
      bookingId,
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

    // 1. Google Sheets (must finish before HTTP response — avoids work being dropped after res.end)
    try {
      const sheetResult = await syncBookingToSheet(bookingData);
      if (sheetResult.ok) {
        sheetSyncStatus = "Success";
      } else {
        sheetSyncStatus = "Failed";
        errorLogs.push({
          task: "Google Sheets Sync",
          message: sheetResult.reason,
        });
      }
    } catch (err) {
      sheetSyncStatus = "Failed";
      errorLogs.push({
        task: "Google Sheets Sync",
        message: err.message || "Unknown error",
      });
      console.error(`❌ Sheet sync failed for ${bookingId}:`, err.message);
    }

    const isAdminBooking =
      process.env.ADMIN_EMAIL &&
      email &&
      email.toLowerCase().trim() ===
        process.env.ADMIN_EMAIL.toLowerCase().trim();

    // 2. Customer confirmation (skip duplicate mail if submitter is admin test account)
    if (!isAdminBooking && email) {
      try {
        await sendBookingEmailNow({
          to: email,
          subject: `Your Booking Request Received - ${bookingId}`,
          html: `<h2>Thank You!</h2>
                 <p>Dear ${name || "Traveler"},</p>
                 <p>We have received your booking request (ID: <strong>${bookingId}</strong>) for <strong>${destination || "your destination"}</strong>.</p>
                 <p>Our travel experts will review your request and contact you shortly at <strong>${whatsapp || email}</strong> to finalize the details.</p>
                 <p>Thank you for choosing Sastikaa Travels!</p>`,
        });
        userEmailStatus = "Success";
      } catch (err) {
        userEmailStatus = "Failed";
        errorLogs.push({
          task: "User Email",
          message: err.message || "Unknown error",
        });
        console.error(`❌ User email failed for ${bookingId}:`, err.message);
      }
    } else {
      userEmailStatus = !email
        ? "Failed (No Email)"
        : "Disabled (Admin)";
    }

    // 3. Admin notification
    if (process.env.ADMIN_EMAIL) {
      try {
        await sendBookingEmailNow({
          to: process.env.ADMIN_EMAIL,
          subject: `NEW BOOKING ALERT - ${bookingId} (${name || "New Lead"})`,
          html: `<h2>New Booking Received!</h2>
                 <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; border: 1px solid #ddd;">
                   <h3 style="color: #F69520; margin-top: 0;">Inquiry Details</h3>
                   <p>Booking ID: <strong>${bookingId}</strong></p>
                   <p>Destination: <strong>${destination || "-"}</strong></p>
                   ${packageName ? `<p>Package: <strong>${packageName}</strong></p>` : ""}
                   <p>Travel Month: <strong>${travelMonth || "-"}</strong></p>
                   <p>No. of People: <strong>${noOfPeople || "-"}</strong></p>
                   <p>Duration: <strong>${duration || "-"}</strong></p>
                   <p>Preferred Language: <strong>${language || "-"}</strong></p>
                   <h3 style="color: #F69520; border-top: 1px solid #eee; margin-top: 20px;">Customer Details</h3>
                   <p>Name: <strong>${name || "-"}</strong></p>
                   <p>Email: <strong>${email || "-"}</strong></p>
                   <p>WhatsApp: <strong>${whatsapp || "-"}</strong></p>
                   <p>City: <strong>${city || "-"}</strong></p>
                 </div>`,
        });
        adminEmailStatus = "Success";
      } catch (err) {
        adminEmailStatus = "Failed";
        errorLogs.push({
          task: "Admin Email",
          message: err.message || "Unknown error",
        });
        console.error(`❌ Admin email failed for ${bookingId}:`, err.message);
      }
    } else {
      adminEmailStatus = "Failed (No Admin Configured)";
      errorLogs.push({
        task: "Admin Email",
        message: "ADMIN_EMAIL is not set in server environment",
      });
    }

    // 4. WhatsApp
    try {
      if (whatsapp) {
        await sendWhatsAppMessage(whatsapp, "", "template", {
          name: "hello_world",
          languageCode: "en_US",
        });
      }

      if (process.env.ADMIN_WHATSAPP) {
        const adminWaMessage = `*🚨 NEW BOOKING ALERT!* 🚨\n\n*ID:* ${bookingId}\n*Name:* ${name || "-"}\n*WhatsApp:* ${whatsapp || "-"}\n*Destination:* ${destination || "-"}\n${packageName ? `*Package:* ${packageName}\n` : ""}*Month:* ${travelMonth || "-"}\n*Group Size:* ${noOfPeople || "-"}\n*Duration:* ${duration || "-"}\n\n*View details in Admin Panel!* 💼`;
        await sendWhatsAppMessage(process.env.ADMIN_WHATSAPP, adminWaMessage);
      }
    } catch (waErr) {
      errorLogs.push({
        task: "WhatsApp Alert",
        message: waErr.message || "Unknown error",
      });
      console.error(`❌ WhatsApp tasks failed for ${bookingId}:`, waErr.message);
    }

    await Booking.findOneAndUpdate(
      { bookingId },
      { sheetSyncStatus, userEmailStatus, adminEmailStatus, errorLogs }
    );

    console.log(`🚀 Booking ${bookingId} integrations completed`);

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
