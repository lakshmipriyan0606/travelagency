import * as newsletterRepository from './newsletter.repository.js';
import { sendWelcomeEmail } from '../../integrations/email/email.service.js';
import { WELCOME_EMAIL_SUBJECT } from './newsletter.constants.js';

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
    console.error('Failed to send welcome email:', emailErr.message);
  }

  return newSubscriber;
};
