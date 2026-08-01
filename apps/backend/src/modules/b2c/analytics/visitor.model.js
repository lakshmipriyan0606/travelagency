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
 * One document per visitorId per UTC day (unique index). New profile fields
 * are optional for migration safety; legacy documents keep working.
 *
 * Called By:
 * src/modules/b2c/analytics/analytics.repository.js
 * ============================================================================
 */
import mongoose from 'mongoose';

const PageViewSchema = new mongoose.Schema(
  {
    path: { type: String, default: '' },
    title: { type: String, default: '' },
    referrer: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const VisitorSchema = new mongoose.Schema({
  // ── Legacy core (required for backward compatibility) ─────────────────────
  visitorId: { type: String, required: true },
  date: { type: String, required: true },
  userAgent: { type: String, required: true },
  ip: { type: String, required: true },
  referrer: { type: String, default: '' },
  path: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, index: { expires: '30d' } },

  // ── Identity ──────────────────────────────────────────────────────────────
  sessionId: { type: String, default: '' },
  userId: { type: String, default: '' },
  firstVisit: { type: Date },
  lastVisit: { type: Date },
  visitCount: { type: Number, default: 1 },

  // ── Device (parsed from UA + client hints) ────────────────────────────────
  browser: { type: String, default: '' },
  browserVersion: { type: String, default: '' },
  os: { type: String, default: '' },
  osVersion: { type: String, default: '' },
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    default: 'unknown',
  },

  // ── Network / Location ────────────────────────────────────────────────────
  country: { type: String, default: '' },
  region: { type: String, default: '' },
  city: { type: String, default: '' },
  timezone: { type: String, default: '' },

  // ── Display / Capabilities ────────────────────────────────────────────────
  screenWidth: { type: Number },
  screenHeight: { type: Number },
  viewportWidth: { type: Number },
  viewportHeight: { type: Number },
  devicePixelRatio: { type: Number },
  language: { type: String, default: '' },
  cookiesEnabled: { type: Boolean },
  touchSupport: { type: Boolean },
  onlineStatus: { type: Boolean },

  // ── Navigation ────────────────────────────────────────────────────────────
  landingPage: { type: String, default: '' },
  currentPage: { type: String, default: '' },
  pageViewCount: { type: Number, default: 1 },
  pageViews: { type: [PageViewSchema], default: [] },

  // ── Marketing (UTM) ───────────────────────────────────────────────────────
  utmSource: { type: String, default: '' },
  utmMedium: { type: String, default: '' },
  utmCampaign: { type: String, default: '' },
  utmTerm: { type: String, default: '' },
  utmContent: { type: String, default: '' },

  // ── Performance (ms) ──────────────────────────────────────────────────────
  pageLoad: { type: Number },
  fcp: { type: Number },
  lcp: { type: Number },
});

// Compound unique index ensures a visitor is only counted once per day
VisitorSchema.index({ visitorId: 1, date: 1 }, { unique: true });
VisitorSchema.index({ lastVisit: -1 });
VisitorSchema.index({ date: 1, deviceType: 1 });
VisitorSchema.index({ date: 1, browser: 1 });
VisitorSchema.index({ date: 1, country: 1 });

export const Visitor = mongoose.models.Visitor || mongoose.model('Visitor', VisitorSchema);
export default Visitor;
