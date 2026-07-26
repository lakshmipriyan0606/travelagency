/**
 * ============================================================================
 * Analytics - API Hit Model
 * ============================================================================
 *
 * Layer:
 * Data Access / Entity
 *
 * Responsibility:
 * Defines the MongoDB schema for recording raw API usage metrics.
 * Enables tracking the volume of requests hitting specific routes.
 *
 * Called By:
 * src/modules/analytics/analytics.repository.js
 * ============================================================================
 */
import mongoose from 'mongoose';

const ApiHitSchema = new mongoose.Schema({
  date: { type: String, required: true },
  method: { type: String, required: true },
  route: { type: String, required: true },
  status: { type: Number, required: true },
  count: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: { expires: '30d' } },
});

// Compound unique index for daily aggregation per route and status
ApiHitSchema.index({ date: 1, method: 1, route: 1, status: 1 }, { unique: true });

export const ApiHit = mongoose.models.ApiHit || mongoose.model('ApiHit', ApiHitSchema);
export default ApiHit;
