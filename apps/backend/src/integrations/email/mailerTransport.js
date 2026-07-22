/**
 * ============================================================================
 * Email Transport Configuration
 * ============================================================================
 *
 * Layer:
 * Infrastructure / Third-Party Integration
 *
 * Responsibility:
 * Wraps the underlying email delivery mechanisms (Resend SDK, Nodemailer + Gmail)
 * to provide a unified `sendTransactionalEmail` interface. Includes automatic
 * fallback from Resend to Gmail if delivery fails.
 *
 * Called By:
 * src/workers/email.worker.js
 * src/integrations/email/email.service.js
 * ============================================================================
 */
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

let gmailTransporter;

function hasResendConfig() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function selectedProvider() {
  // Default: Resend first, then fallback to free Gmail.
  return (process.env.MAIL_PROVIDER || 'auto').toLowerCase().trim();
}

function getGmailFrom() {
  return `"Sastikaa Travels" <${process.env.GMAIL_USER}>`;
}

/**
 * Single path for all outbound mail.
 * Default provider is auto (tries Resend first, then free Gmail fallback).
 * Set MAIL_PROVIDER=gmail to force free-only mode.
 */
export async function sendTransactionalEmail({ to, subject, html }) {
  const provider = selectedProvider();

  const sendViaResend = async () => {
    if (!hasResendConfig()) {
      throw new Error('RESEND_API_KEY is missing');
    }
    const from = process.env.RESEND_FROM_EMAIL?.trim();
    if (!from) throw new Error('RESEND_FROM_EMAIL is missing');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
    });
    if (error)
      throw new Error(typeof error === 'string' ? error : error.message || 'Resend send failed');
  };

  const sendViaGmail = async () => {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      throw new Error('GMAIL_USER or GMAIL_APP_PASSWORD is missing');
    }
    if (!gmailTransporter) {
      // Explicit host + longer timeouts — helps on cloud hosts.
      gmailTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        pool: true,
        maxConnections: 3,
        maxMessages: 100,
        connectionTimeout: 60000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
        family: 4,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
    }
    await gmailTransporter.sendMail({
      from: getGmailFrom(),
      to,
      subject,
      html,
    });
  };

  if (provider === 'resend') {
    await sendViaResend();
    return;
  }

  if (provider === 'auto') {
    try {
      await sendViaResend();
      return;
    } catch (resendErr) {
      console.warn(`[Mail] Resend failed, falling back to Gmail: ${resendErr.message}`);
      await sendViaGmail();
      return;
    }
  }

  // Default: gmail
  await sendViaGmail();
}

/** @deprecated Use sendTransactionalEmail — kept for any legacy imports */
export function getMailTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('Gmail not configured');
  }
  if (!gmailTransporter) {
    gmailTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
      family: 4,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return gmailTransporter;
}
