import { v4 as uuidv4 } from "uuid";
import * as bookingRepository from "./booking.repository.js";
import { encryptValue, decryptValue } from "../../utils/crypto.js";
import { enqueueBookingIntegrations } from "../../services/bookingQueue.service.js";

export const createBookingService = async (body) => {
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
    message,
  } = body;

  const bookingId = `ID-${uuidv4().split("-")[0].toUpperCase()}`;
  const travelDateObj = travelDate ? new Date(travelDate) : null;

  const newBookingData = {
    bookingId,
    name: name || "",
    city: city || "",
    destination: destination || "",
    packageName: packageName || "",
    vacationType: vacationType || "",
    duration: duration || "",
    language: language || "",
    message: message || "",
    email: email ? encryptValue(email.toLowerCase().trim()) : "",
    phone: phone || whatsapp ? encryptValue(phone || whatsapp) : "",
    whatsapp: whatsapp ? encryptValue(whatsapp) : null,
    travelDate: travelDateObj,
    travelMonth: travelMonth || "",
    noOfPeople: noOfPeople ? String(noOfPeople) : "",
  };

  const bookingObj = await bookingRepository.create(newBookingData);

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
    message: message || "",
  };

  try {
    await enqueueBookingIntegrations(integrationPayload);
  } catch (err) {
    await bookingRepository.findOneAndUpdate(
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
  }

  return { bookingId, bookingObj };
};

export const getAllBookingsService = async () => {
  const bookings = await bookingRepository.findSorted({}, { createdAt: -1 });

  return bookings.map((b) => ({
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
};
