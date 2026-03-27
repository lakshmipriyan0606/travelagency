import nodemailer from "nodemailer";

let transporter;

/**
 * Shared Gmail transport for workers and synchronous booking emails.
 */
export function getMailTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}
