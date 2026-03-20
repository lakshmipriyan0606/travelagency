import express from "express";
import Booking from "../models/Booking.model.js";
import { sendEmail } from "../services/email.service.js";
import { sendWhatsAppMessage } from "../services/whatsapp.service.js"; // Added
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
      packageName, // Added
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
      packageName: packageName || "", // Added
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

    console.log(`✅ Booking ${bookingId} saved to database`);

    // Send response immediately to the user
    res.status(201).json({ success: true, bookingId });

    // Perform background tasks (Google Sheets sync and Emails)
    // We don't 'await' these so the user doesn't wait for them to finish
    (async () => {
      try {
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

        // 1. Sync to Google Sheets
        await syncBookingToSheet(bookingData);

        const isAdminBooking = process.env.ADMIN_EMAIL && email.toLowerCase().trim() === process.env.ADMIN_EMAIL.toLowerCase().trim();

        // 2. Send confirmation to customer (Only if they are NOT the admin)
        if (!isAdminBooking) {
          await sendEmail({
            to: email,
            subject: `Your Booking Request Received - ${bookingId}`,
            html: `<h2>Thank You!</h2>
                   <p>Dear ${name || 'Traveler'},</p>
                   <p>We have received your booking request (ID: <strong>${bookingId}</strong>) for <strong>${destination || "your destination"}</strong>.</p>
                   <p>Our travel experts will review your request and contact you shortly at <strong>${whatsapp || email}</strong> to finalize the details.</p>
                   <p>Thank you for choosing Sastikaa Travels!</p>`,
          });
        }

        // 3. Send detailed notification to admin
        if (process.env.ADMIN_EMAIL) {
          await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: `NEW BOOKING ALERT - ${bookingId} (${name || 'New Lead'})`,
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
                     
                     <h3 style="color: #F69520; border-top: 1px solid #eee; pt-4; margin-top: 20px;">Customer Details</h3>
                     <p>Name: <strong>${name || "-"}</strong></p>
                     <p>Email: <strong>${email || "-"}</strong></p>
                     <p>WhatsApp: <strong>${whatsapp || "-"}</strong></p>
                   <p>City: <strong>${city || "-"}</strong></p>
                 </div>`,
          });
        }

        // 4. Send WhatsApp Confirmation to User (Using Template)
        if (whatsapp) {
          // Meta requires a Template to start a conversation if the user hasn't messaged first
          // We use the 'hello_world' template as provided in your curl example
          await sendWhatsAppMessage(whatsapp, "", "template", {
            name: "hello_world",
            languageCode: "en_US"
          });
          
          // If you have a 'thanks_for_booking' template, you would use it like this:
          /*
          await sendWhatsAppMessage(whatsapp, "", "template", {
            name: "thanks_for_booking",
            languageCode: "en_US",
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: name || "Traveler" },
                  { type: "text", text: bookingId },
                  { type: "text", text: destination || "your destination" }
                ]
              }
            ]
          });
          */
        }

        // 5. Send WhatsApp Alert to Admin (Can be custom text if session is open)
        if (process.env.ADMIN_WHATSAPP) {
          const adminWaMessage = `*🚨 NEW BOOKING ALERT!* 🚨\n\n*ID:* ${bookingId}\n*Name:* ${name || "-"}\n*WhatsApp:* ${whatsapp || "-"}\n*Destination:* ${destination || "-"}\n${packageName ? `*Package:* ${packageName}\n` : ""}*Month:* ${travelMonth || "-"}\n*Group Size:* ${noOfPeople || "-"}\n*Duration:* ${duration || "-"}\n\n*View details in Admin Panel!* 💼`;
          await sendWhatsAppMessage(process.env.ADMIN_WHATSAPP, adminWaMessage);
        }

        console.log(`🚀 Background tasks for ${bookingId} completed`);
      } catch (bgErr) {
        console.error(`❌ Background tasks failed for ${bookingId}:`, bgErr.message);
      }
    })();
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
      packageName: b.packageName, // Added
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
