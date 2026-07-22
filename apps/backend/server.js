import { env } from './config/env.js';
import { logger } from './src/shared/logger.js';

import { connectDB } from './config/db.js';
import app from './app.js';
import mongoose from 'mongoose';
import cache from './config/cache.js';

// ── Start Email Worker (Agenda / MongoDB Job Queue) ───────────────────
import { workerReady } from './workers/email.worker.js';
import { agendaReady } from './config/agenda.js';
import { markAgendaWorkerStarted } from './config/queueRuntime.js';

connectDB();

const PORT = env.PORT || 5000;

let agenda; // will be set once agendaReady resolves

const server = app.listen(PORT, async () => {
  logger.info(`🚀 Server running on port ${PORT}`);

  // Wait for Agenda + worker definitions to be ready, then start processing
  agenda = await agendaReady;
  await workerReady;
  await agenda.start();
  markAgendaWorkerStarted(agenda);
  logger.info('📬 Email job queue (Agenda) started');
});

// ── Graceful Shutdown ─────────────────────────────────────────────────
const shutdown = async (signal) => {
  logger.info(`\n⚠️  ${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    logger.info('🔒 HTTP server closed');

    try {
      if (agenda) {
        await agenda.stop();
        logger.info('📭 Agenda stopped');
      }

      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        logger.info('🗄️ MongoDB connection closed');
      }

      if (cache.status === 'ready') {
        await cache.quit();
        logger.info('🗃️ Redis connection closed');
      }
    } catch (err) {
      logger.error(`Error during graceful shutdown: ${err.message}`);
    }

    logger.info('✅ Clean exit');
    process.exit(0);
  });

  // Force kill if it takes too long
  setTimeout(() => {
    logger.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
