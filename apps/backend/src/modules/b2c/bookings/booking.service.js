/**
 * ============================================================================
 * Booking Service
 * ============================================================================
 *
 * Layer:
 * Business Service
 *
 * Responsibility:
 * Enforces business rules for booking inquiries. This includes PII encryption
 * at rest, ID generation, and delegating slow integration tasks (Emails/Sheets)
 * to the background job queue (Agenda).
 *
 * Called By:
 * src/modules/bookings/booking.controller.js
 *
 * Depends On:
 * src/modules/bookings/booking.repository.js
 * src/modules/bookings/bookingQueue.service.js
 * src/utils/crypto.js
 * ============================================================================
 */
import { v4 as uuidv4 } from 'uuid';
import * as bookingRepository from './booking.repository.js';
import { encryptValue, decryptValue } from '#shared/utils/crypto.js';
import { enqueueBookingIntegrations } from './bookingQueue.service.js';

/**
 * Creates a new booking inquiry and dispatches background integration jobs.
 *
 * Business Intent:
 * 1. Generate a human-readable, unique short ID (`ID-XXXXXX`) for the booking.
 * 2. Encrypt sensitive PII (Email, Phone) before persisting to MongoDB for GDPR compliance.
 * 3. Immediately respond to the user (Fast I/O) by delegating Sheets/Email sync to the background queue.
 *
 * @param {Object} body Raw booking payload from the client
 * @returns {Promise<Object>} Contains the generated bookingId and the Mongoose object
 */
export const createBookingService = async (body, idempotencyKey = null) => {
  if (idempotencyKey) {
    const existingBooking = await bookingRepository.findByIdempotencyKey(idempotencyKey);
    if (existingBooking) {
      return {
        bookingId: existingBooking.bookingId,
        bookingObj: existingBooking,
        isDuplicate: true,
      };
    }
  }
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

  const bookingId = `ID-${uuidv4().split('-')[0].toUpperCase()}`;
  const travelDateObj = travelDate ? new Date(travelDate) : null;

  // ---------------------------------------------------------------------
  // Encrypt PII fields (email, phone, whatsapp) before saving to the DB.
  // ---------------------------------------------------------------------
  const newBookingData = {
    bookingId,
    name: name || '',
    city: city || '',
    destination: destination || '',
    packageName: packageName || '',
    vacationType: vacationType || '',
    duration: duration || '',
    language: language || '',
    message: message || '',
    email: email ? encryptValue(email.toLowerCase().trim()) : '',
    phone: phone || whatsapp ? encryptValue(phone || whatsapp) : '',
    whatsapp: whatsapp ? encryptValue(whatsapp) : null,
    travelDate: travelDateObj,
    travelMonth: travelMonth || '',
    noOfPeople: noOfPeople ? String(noOfPeople) : '',
  };

  if (idempotencyKey) {
    newBookingData.idempotencyKey = idempotencyKey;
  }

  const session = await bookingRepository.startSession();
  session.startTransaction();

  let bookingObj;
  try {
    bookingObj = await bookingRepository.create(newBookingData, { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  // ---------------------------------------------------------------------
  // Prepare plaintext payload for background integrations.
  // We do not encrypt here because external APIs (Google Sheets/SendGrid)
  // require the raw email/phone.
  // ---------------------------------------------------------------------
  const integrationPayload = {
    bookingId,
    city: city || '',
    name: name || '',
    email: email || '',
    whatsapp: whatsapp || '',
    destination: destination || '',
    packageName: packageName || '',
    travelMonth: travelMonth || '',
    noOfPeople: noOfPeople || '',
    duration: duration || '',
    language: language || '',
    message: message || '',
  };

  // ---------------------------------------------------------------------
  // Safely enqueue the job. If Redis/Agenda is down, mark the booking
  // with a 'Failed' status so it can be retried later via a cron job or Admin UI.
  // ---------------------------------------------------------------------
  try {
    await enqueueBookingIntegrations(integrationPayload);
  } catch (err) {
    await bookingRepository.findOneAndUpdate(
      { bookingId },
      {
        sheetSyncStatus: 'Failed',
        userEmailStatus: 'Failed',
        adminEmailStatus: 'Failed',
        errorLogs: [
          {
            task: 'Queue Booking Integrations',
            message: err.message || 'Failed to queue booking integrations',
          },
        ],
      },
      { new: true }
    );
  }

  return { bookingId, bookingObj, isDuplicate: false };
};

/**
 * Retrieves all bookings and decrypts PII for authorized Admin access.
 *
 * Business Intent:
 * Reverses the encryption applied during creation so the Admin dashboard
 * can display readable contact information.
 *
 * @returns {Promise<Array>} Array of decrypted booking objects
 */
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
