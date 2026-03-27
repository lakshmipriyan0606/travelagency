import nodemailer from "nodemailer";

let transporter;

/**
 * Shared Gmail transport for workers and synchronous booking emails.
 */
export function getMailTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      connectionTimeout: 12000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}
