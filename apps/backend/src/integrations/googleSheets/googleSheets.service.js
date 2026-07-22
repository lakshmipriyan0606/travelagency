/**
 * ============================================================================
 * Google Sheets Integration Service
 * ============================================================================
 *
 * Layer:
 * External Integration
 *
 * Responsibility:
 * Syncs booking leads to a Google Sheet via an Apps Script Webhook.
 * Also fetches dynamic package configuration data directly from a public
 * Google Sheet JSON endpoint.
 *
 * Called By:
 * src/modules/bookings/booking.service.js
 * src/modules/packages/package.service.js
 * ============================================================================
 */
import dotenv from 'dotenv';
dotenv.config();

const SHEET_REQUEST_MS = 20000;

/**
 * Syncs booking data to Google Sheets via a Web App (Apps Script).
 * Uses fetch() so redirects (common with script.google.com) are followed.
 * @returns {{ ok: true } | { ok: false, reason: string }}
 */
export const syncBookingToSheet = async (bookingData) => {
  const webhookUrl = process.env.GOOGLE_SHEET_BOOKING_WEBHOOK;

  if (!webhookUrl || webhookUrl === 'your_deployment_url_here') {
    const reason =
      'GOOGLE_SHEET_BOOKING_WEBHOOK is missing or still the placeholder — set it in production to the Apps Script web app URL';
    console.warn(`⚠️ ${reason}`);
    return { ok: false, reason };
  }

  console.log(`📡 Attempting to sync booking ${bookingData.bookingId} to Google Sheets...`);

  const body = JSON.stringify({
    type: 'BOOKING_ENQUIRY',
    data: {
      ...bookingData,
      timestamp: new Date().toLocaleString(),
    },
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SHEET_REQUEST_MS);

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: controller.signal,
    });

    const text = await res.text().catch(() => '');
    if (!res.ok) {
      const reason = `HTTP ${res.status}${text ? `: ${text.slice(0, 300)}` : ''}`;
      console.error(`❌ Google Sheets webhook error: ${reason}`);
      return { ok: false, reason };
    }

    console.log('✅ Successfully synced to Google Sheets');
    return { ok: true };
  } catch (e) {
    const reason =
      e.name === 'AbortError'
        ? `Request timed out after ${SHEET_REQUEST_MS / 1000}s`
        : e.message || 'Network error';
    console.error(`❌ Google Sheets sync failed: ${reason}`);
    return { ok: false, reason };
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * Fetches package data from a published Google Sheet (JSON format)
 */
export const fetchPackagesFromSheet = async () => {
  const sheetUrl = process.env.GOOGLE_SHEET_PACKAGE_DATA_URL;

  if (!sheetUrl || sheetUrl === 'your_published_json_url_here') {
    console.warn('⚠️ Google Sheet Package Data URL not configured in .env');
    return [];
  }

  try {
    const res = await fetch(sheetUrl);
    const data = await res.text();
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('❌ Failed to parse Sheet JSON:', e.message);
      return [];
    }
  } catch (e) {
    console.error(`❌ Fetch Error: ${e.message}`);
    return [];
  }
};
