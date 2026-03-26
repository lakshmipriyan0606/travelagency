import { agendaReady } from "../config/agenda.js";

/**
 * Queue a booking notification email.
 * Job is persisted in MongoDB and retried up to 3 times on failure.
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const agenda = await agendaReady;
    await agenda.schedule("in 1 second", "send booking email", { to, subject, html });
    console.log(`[EmailService] 📧 Booking email queued for: ${to}`);
  } catch (err) {
    console.error("[EmailService] Failed to queue email:", err.message);
  }
};

/**
 * Queue a newsletter welcome email.
 */
export const sendWelcomeEmail = async ({ to, subject, html }) => {
  try {
    const agenda = await agendaReady;
    await agenda.schedule("in 1 second", "send welcome email", { to, subject, html });
    console.log(`[EmailService] 📧 Welcome email queued for: ${to}`);
  } catch (err) {
    console.error("[EmailService] Failed to queue welcome email:", err.message);
  }
};

/**
 * Queue an enquiry / contact email.
 */
export const sendEnquiryEmail = async ({ to, subject, html }) => {
  try {
    const agenda = await agendaReady;
    await agenda.schedule("in 1 second", "send enquiry email", { to, subject, html });
    console.log(`[EmailService] 📧 Enquiry email queued for: ${to}`);
  } catch (err) {
    console.error("[EmailService] Failed to queue enquiry email:", err.message);
  }
};