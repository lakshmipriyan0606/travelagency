import { agendaReady } from "../config/agenda.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Wait for Agenda to be ready, then define all jobs
export const workerReady = agendaReady.then((agenda) => {
  // ── Job: Send Booking Notification Email ─────────────────────────────
  agenda.define("send booking email", { priority: "high", concurrency: 2 }, async (job) => {
    const { to, subject, html } = job.attrs.data;
    await transporter.sendMail({
      from: `"Sastikaa Travels" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[EmailWorker] ✅ Booking email sent to: ${to}`);
  });

  // ── Job: Send Newsletter Welcome Email ───────────────────────────────
  agenda.define("send welcome email", { priority: "normal", concurrency: 5 }, async (job) => {
    const { to, subject, html } = job.attrs.data;
    await transporter.sendMail({
      from: `"Sastikaa Travels" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[EmailWorker] ✅ Welcome email sent to: ${to}`);
  });

  // ── Job: Send Contact / Enquiry Email ────────────────────────────────
  agenda.define("send enquiry email", { priority: "normal", concurrency: 3 }, async (job) => {
    const { to, subject, html } = job.attrs.data;
    await transporter.sendMail({
      from: `"Sastikaa Travels" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[EmailWorker] ✅ Enquiry email sent to: ${to}`);
  });

  // ── Global error handler for all jobs ────────────────────────────────
  agenda.on("fail", (err, job) => {
    console.error(`[EmailWorker] ❌ Job "${job.attrs.name}" failed (attempt ${job.attrs.failCount}):`, err.message);
  });

  agenda.on("complete", (job) => {
    console.log(`[EmailWorker] 🎯 Job "${job.attrs.name}" completed`);
  });

  return agenda;
});
