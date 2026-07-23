/**
 * ============================================================================
 * Booking Model
 * ============================================================================
 *
 * Layer:
 * Data Access / Entity
 *
 * Responsibility:
 * Defines the MongoDB schema for customer booking inquiries and captures
 * tracking status for external synchronization (Google Sheets, Emails).
 *
 * Called By:
 * src/modules/bookings/booking.repository.js
 * ============================================================================
 */
import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  // Unique system-generated identifier for the booking
  bookingId: { type: String, required: true, unique: true },

  // Customer Contact Info
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  whatsapp: { type: String, default: null },
  name: { type: String, required: true },
  city: { type: String, default: '' },

  // Package/Travel Context
  destination: { type: String, required: true },
  packageName: { type: String, default: '' },
  vacationType: { type: String, default: '' },
  duration: { type: String, default: '' },
  language: { type: String, default: '' },
  travelDate: { type: Date, default: null },
  travelMonth: { type: String, default: '' },
  noOfPeople: { type: String, default: '' },
  message: { type: String, default: '', maxLength: 500 },

  // Audit Trail
  createdAt: { type: Date, default: Date.now },

  // Idempotency Key for avoiding duplicate requests
  idempotencyKey: { type: String, unique: true, sparse: true },

  // Background Job Status Flags (Pending -> Success/Failed)
  sheetSyncStatus: { type: String, default: 'Pending' },
  userEmailStatus: { type: String, default: 'Pending' },
  adminEmailStatus: { type: String, default: 'Pending' },

  // Job Error Logs for troubleshooting Async failures
  errorLogs: [
    {
      task: { type: String },
      message: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

// ============================================================================
// Indexes
// ----------------------------------------------------------------------------
// 1. Time-series indexing for dashboard queries
// 2. Compound index for background workers to quickly find un-synced jobs
// 3. Email/Destination indexing for quick admin searches
// ============================================================================
BookingSchema.index({ createdAt: -1 });
BookingSchema.index({ sheetSyncStatus: 1, createdAt: -1 });
BookingSchema.index({ email: 1 });
BookingSchema.index({ destination: 1 });

export const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
export default Booking;
