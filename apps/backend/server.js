import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import app from "./app.js";

// ── Start Email Worker (Agenda / MongoDB Job Queue) ───────────────────
import { workerReady } from "./workers/email.worker.js";
import { agendaReady } from "./config/agenda.js";
import { markAgendaWorkerStarted } from "./config/queueRuntime.js";

connectDB();

const PORT = process.env.PORT || 5000;

let agenda; // will be set once agendaReady resolves

const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // Wait for Agenda + worker definitions to be ready, then start processing
  agenda = await agendaReady;
  await workerReady;
  await agenda.start();
  markAgendaWorkerStarted(agenda);
  console.log("📬 Email job queue (Agenda) started");
});

// ── Graceful Shutdown ─────────────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
  
  server.close(async () => {
    console.log("🔒 HTTP server closed");
    
    try {
      if (agenda) {
        await agenda.stop();
        console.log("📭 Agenda stopped");
      }
    } catch (err) {
      console.error("Error stopping agenda:", err.message);
    }

    process.exit(0);
  });

  // Force kill if it takes too long
  setTimeout(() => {
    console.error("❌ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
