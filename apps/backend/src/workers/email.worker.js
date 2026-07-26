/**
 * ============================================================================
 * Email Worker Process
 * ============================================================================
 *
 * Layer:
 * Infrastructure / Background Worker
 *
 * Responsibility:
 * Defines the job processors for the Agenda queue. Polls MongoDB for scheduled
 * jobs and executes the actual HTTP network requests to send emails and sync
 * third-party integrations asynchronously.
 *
 * Called By:
 * src/server.js (Starts the worker loop)
 *
 * Depends On:
 * src/config/agenda.js
 * ============================================================================
 */
import { agendaReady } from '#config/agenda.js';
import dotenv from 'dotenv';
import { sendTransactionalEmail } from '#integrations/email/mailerTransport.js';
import { processBookingIntegrations } from '#modules/b2c/bookings/bookingIntegration.service.js';

dotenv.config();

// Wait for Agenda to be ready, then define all jobs
export const workerReady = agendaReady.then((agenda) => {
  // ── Job: Send Booking Notification Email ─────────────────────────────
  agenda.define(
    'send booking email',
    async (job) => {
      const { to, subject, html } = job.attrs.data;
      await sendTransactionalEmail({ to, subject, html });
      console.log(`[EmailWorker] ✅ Booking email sent to: ${to}`);
    },
    { priority: 'high', concurrency: 2 }
  );

  // ── Job: Send Newsletter Welcome Email ───────────────────────────────
  agenda.define(
    'send welcome email',
    async (job) => {
      const { to, subject, html } = job.attrs.data;
      await sendTransactionalEmail({ to, subject, html });
      console.log(`[EmailWorker] ✅ Welcome email sent to: ${to}`);
    },
    { priority: 'normal', concurrency: 5 }
  );

  // ── Job: Send Contact / Enquiry Email ────────────────────────────────
  agenda.define(
    'send enquiry email',
    async (job) => {
      const { to, subject, html } = job.attrs.data;
      await sendTransactionalEmail({ to, subject, html });
      console.log(`[EmailWorker] ✅ Enquiry email sent to: ${to}`);
    },
    { priority: 'normal', concurrency: 3 }
  );

  // ── Job: Process Booking Integrations (sheet + mails + whatsapp) ─────
  agenda.define(
    'process booking integrations',
    async (job) => {
      const payload = job.attrs.data;
      await processBookingIntegrations(payload);
      console.log(`[EmailWorker] ✅ Booking integrations processed: ${payload.bookingId}`);
    },
    { priority: 'high', concurrency: 3 }
  );

  // ── Global error handler for all jobs ────────────────────────────────
  agenda.on('fail', (err, job) => {
    console.error(
      `[EmailWorker] ❌ Job "${job.attrs.name}" failed (attempt ${job.attrs.failCount}):`,
      err.message
    );
  });

  agenda.on('complete', (job) => {
    console.log(`[EmailWorker] 🎯 Job "${job.attrs.name}" completed`);
  });

  return agenda;
});
