/**
 * ============================================================================
 * Analytics - Visitor Model
 * ============================================================================
 *
 * Layer:
 * Data Access / Entity
 *
 * Responsibility:
 * Defines the MongoDB schema for tracking unique frontend visitors.
 * Stores anonymized IP data and user agent strings for dashboard insights.
 *
 * Called By:
 * src/modules/analytics/analytics.repository.js
 * ============================================================================
 */
import mongoose from 'mongoose';

const VisitorSchema = new mongoose.Schema({
  visitorId: { type: String, required: true },
  date: { type: String, required: true },
  userAgent: { type: String, required: true },
  ip: { type: String, required: true },
  referrer: { type: String, default: '' },
  path: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, index: { expires: '30d' } },
});

// Compound unique index ensures a visitor is only counted once per day
VisitorSchema.index({ visitorId: 1, date: 1 }, { unique: true });

export const Visitor = mongoose.models.Visitor || mongoose.model('Visitor', VisitorSchema);
export default Visitor;
