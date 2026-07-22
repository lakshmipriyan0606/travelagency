/**
 * ============================================================================
 * Newsletter Service
 * ============================================================================
 *
 * Layer:
 * Business Service
 *
 * Responsibility:
 * Processes newsletter subscriptions. Validates for existing subscribers,
 * persists to the database, and fires an asynchronous welcome email via SendGrid.
 *
 * Called By:
 * src/modules/newsletter/newsletter.controller.js
 *
 * Depends On:
 * src/modules/newsletter/newsletter.repository.js
 * src/integrations/email/email.service.js
 * ============================================================================
 */
import * as newsletterRepository from './newsletter.repository.js';
import { sendWelcomeEmail } from '#integrations/email/email.service.js';
import { WELCOME_EMAIL_SUBJECT } from './newsletter.constants.js';

/**
 * Subscribes a new email to the newsletter.
 *
 * Business Intent:
 * Ensures the email is stored cleanly (lowercase/trimmed), prevents duplicate
 * subscriptions gracefully, and sends a welcome confirmation email immediately.
 *
 * @param {string} email
 * @returns {Promise<Object>} Created subscription object
 */
export const subscribeNewsletterService = async (email) => {
  if (!email) {
    const error = new Error('Email is required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await newsletterRepository.findOne({ email: normalizedEmail });

  if (existingUser) {
    const error = new Error('Email already subscribed');
    error.statusCode = 409;
    throw error;
  }

  const newSubscriber = await newsletterRepository.create({ email: normalizedEmail });

  // ---------------------------------------------------------------------
  // Fire-and-forget Email Notification
  // ---------------------------------------------------------------------
  try {
    await sendWelcomeEmail({
      to: normalizedEmail,
      subject: WELCOME_EMAIL_SUBJECT,
      html: `
    <h2>Thanks for subscribing!</h2>
    <p>You’ve successfully subscribed to our newsletter.</p>
    <p>You’ll now receive updates, announcements, and useful information from us.</p>
    <br />
    <p>If you didn’t request this subscription, you can safely ignore this email.</p>
  `,
    });
  } catch (emailErr) {
    // Deliberately catching and logging so that an email failure doesn't
    // bubble up and return a 500 to the user, since the DB save succeeded.
    console.error('Failed to send welcome email:', emailErr.message);
  }

  return newSubscriber;
};
