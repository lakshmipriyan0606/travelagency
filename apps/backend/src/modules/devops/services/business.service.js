/**
 * Business monitoring — real Mongo counts only.
 * Payments/revenue stay unavailable without a ledger.
 */
import Booking from '#b2c/bookings/booking.model.js';
import QuoteRequest from '#b2b/models/quoteRequest.model.js';
import Visitor from '#b2c/analytics/visitor.model.js';

function startOfUtcDay(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function utcDateString(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export async function getBusinessSummary() {
  const now = new Date();
  const dayStart = startOfUtcDay(now);
  const weekStart = new Date(dayStart.getTime() - 6 * 24 * 60 * 60 * 1000);
  const today = utcDateString(now);

  const [
    bookingsToday,
    bookingsWeek,
    quotesToday,
    quotesWeek,
    visitorsToday,
    failedBookingJobsToday,
    failedBookingJobsWeek,
  ] = await Promise.all([
    Booking.countDocuments({ createdAt: { $gte: dayStart } }).catch(() => null),
    Booking.countDocuments({ createdAt: { $gte: weekStart } }).catch(() => null),
    QuoteRequest.countDocuments({ createdAt: { $gte: dayStart } }).catch(() => null),
    QuoteRequest.countDocuments({ createdAt: { $gte: weekStart } }).catch(() => null),
    Visitor.countDocuments({ date: today }).catch(() => null),
    Booking.countDocuments({
      createdAt: { $gte: dayStart },
      $or: [
        { sheetSyncStatus: 'Failed' },
        { userEmailStatus: 'Failed' },
        { adminEmailStatus: 'Failed' },
      ],
    }).catch(() => null),
    Booking.countDocuments({
      createdAt: { $gte: weekStart },
      $or: [
        { sheetSyncStatus: 'Failed' },
        { userEmailStatus: 'Failed' },
        { adminEmailStatus: 'Failed' },
      ],
    }).catch(() => null),
  ]);

  const card = (value, label, reasonIfNull) =>
    value == null
      ? { available: false, label, value: null, reason: reasonIfNull }
      : { available: true, label, value };

  return {
    collectedAt: now.toISOString(),
    range: {
      dayStart: dayStart.toISOString(),
      weekStart: weekStart.toISOString(),
      today,
    },
    kpis: [
      card(bookingsToday, 'Bookings today', 'Booking collection unavailable'),
      card(bookingsWeek, 'Bookings (7d)', 'Booking collection unavailable'),
      card(quotesToday, 'Quotes today', 'QuoteRequest collection unavailable'),
      card(quotesWeek, 'Quotes (7d)', 'QuoteRequest collection unavailable'),
      card(visitorsToday, 'Visitors today', 'Visitor analytics unavailable'),
      card(failedBookingJobsToday, 'Failed booking jobs today', 'Booking sync status unavailable'),
      card(failedBookingJobsWeek, 'Failed booking jobs (7d)', 'Booking sync status unavailable'),
    ],
    payments: {
      available: false,
      reason:
        'No payment/revenue ledger is instrumented in this monorepo — amounts are not invented.',
    },
    notes: [
      'Counts are live MongoDB document counts (createdAt / visitor date).',
      'Failed booking jobs = sheet or email sync status Failed.',
    ],
  };
}
