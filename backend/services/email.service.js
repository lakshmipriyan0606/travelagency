import { agendaReady } from "../config/agenda.js";
import { sendTransactionalEmail } from "./mailerTransport.js";

/**
 * Queue a booking notification email (legacy / other callers).
 * Throws if the job cannot be queued so callers can surface errors.
 */
export const sendEmail = async ({ to, subject, html }) => {
  const agenda = await agendaReady;
  await agenda.schedule("in 1 second", "send booking email", { to, subject, html });
  console.log(`[EmailService] 📧 Booking email queued for: ${to}`);
};

/**
 * Send booking-related mail immediately (same transport as the Agenda worker).
 * Use this for new bookings so status in the DB matches actual delivery,
 * and so mail is not lost when the HTTP response ends background work.
 */
export const sendBookingEmailNow = async ({ to, subject, html }) => {
  await sendTransactionalEmail({ to, subject, html });
  console.log(`[EmailService] 📧 Booking email sent to: ${to}`);
};

/**
 * Queue a newsletter welcome email.
 */
export const sendWelcomeEmail = async ({ to, subject, html }) => {
  const agenda = await agendaReady;
  await agenda.schedule("in 1 second", "send welcome email", { to, subject, html });
  console.log(`[EmailService] 📧 Welcome email queued for: ${to}`);
};

/**
 * Queue an enquiry / contact email.
 */
export const sendEnquiryEmail = async ({ to, subject, html }) => {
  const agenda = await agendaReady;
  await agenda.schedule("in 1 second", "send enquiry email", { to, subject, html });
  console.log(`[EmailService] 📧 Enquiry email queued for: ${to}`);
};
