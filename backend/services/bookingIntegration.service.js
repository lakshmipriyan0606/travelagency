import Booking from "../models/Booking.model.js";
import { syncBookingToSheet } from "./googleSheets.service.js";
import { sendBookingEmailNow } from "./email.service.js";
import { sendWhatsAppMessage } from "./whatsapp.service.js";

export const processBookingIntegrations = async (payload) => {
  const {
    bookingId,
    city,
    email,
    whatsapp,
    destination,
    travelMonth,
    noOfPeople,
    duration,
    name,
    language,
    packageName,
  } = payload;

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

  try {
    const sheetResult = await syncBookingToSheet(bookingData);
    if (sheetResult.ok) {
      sheetSyncStatus = "Success";
    } else {
      sheetSyncStatus = "Failed";
      errorLogs.push({
        task: "Google Sheets Sync",
        message: sheetResult.reason || "Unknown error",
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
    email.toLowerCase().trim() === process.env.ADMIN_EMAIL.toLowerCase().trim();

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
    userEmailStatus = !email ? "Failed (No Email)" : "Disabled (Admin)";
  }

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

  try {
    if (whatsapp) {
      const userWa = await sendWhatsAppMessage(whatsapp, "", "template", {
        name: "hello_world",
        languageCode: "en_US",
      });
      if (userWa && userWa.success === false) {
        errorLogs.push({
          task: "WhatsApp User",
          message: JSON.stringify(userWa.error || "Unknown error").slice(0, 400),
        });
      }
    }

    if (process.env.ADMIN_WHATSAPP) {
      const adminWaMessage = `*🚨 NEW BOOKING ALERT!* 🚨\n\n*ID:* ${bookingId}\n*Name:* ${name || "-"}\n*WhatsApp:* ${whatsapp || "-"}\n*Destination:* ${destination || "-"}\n${packageName ? `*Package:* ${packageName}\n` : ""}*Month:* ${travelMonth || "-"}\n*Group Size:* ${noOfPeople || "-"}\n*Duration:* ${duration || "-"}\n\n*View details in Admin Panel!* 💼`;
      const adminWa = await sendWhatsAppMessage(process.env.ADMIN_WHATSAPP, adminWaMessage);
      if (adminWa && adminWa.success === false) {
        errorLogs.push({
          task: "WhatsApp Admin",
          message: JSON.stringify(adminWa.error || "Unknown error").slice(0, 400),
        });
      }
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
};
