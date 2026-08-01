/**
 * Engineering traffic bridge — read-only reuse of B2C visitor analytics.
 * Does not duplicate the product Metrics UI.
 */
import {
  getVisitorOverviewService,
  getVisitorDistributionService,
} from '#b2c/analytics/analytics.service.js';

export async function getTrafficSummary({ days = 30 } = {}) {
  const safeDays = Math.min(Math.max(Number(days) || 30, 1), 90);

  try {
    const [overview, distribution] = await Promise.all([
      getVisitorOverviewService(),
      getVisitorDistributionService(safeDays),
    ]);

    return {
      available: true,
      collectedAt: new Date().toISOString(),
      days: safeDays,
      purpose:
        'Engineering view of visitor telemetry — product Metrics UI remains the agency-facing surface.',
      overview,
      distribution: {
        browsers: distribution?.browser || [],
        os: distribution?.os || [],
        devices: distribution?.deviceType || [],
        countries: distribution?.country || [],
      },
      gaps: [
        'Abuse/bot scoring not instrumented as a first-party DevOps signal.',
        'Session funnel / conversion attribution stays in product analytics if present.',
      ],
    };
  } catch (err) {
    return {
      available: false,
      reason: `Visitor analytics unavailable: ${err.message}`,
      collectedAt: new Date().toISOString(),
      overview: null,
      distribution: null,
    };
  }
}
