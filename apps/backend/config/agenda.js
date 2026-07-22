/**
 * ============================================================================
 * Agenda Queue Singleton
 * ============================================================================
 *
 * Layer:
 * Configuration / Background Jobs
 *
 * Responsibility:
 * Exposes a Promise (`agendaReady`) that resolves with the initialized Agenda
 * instance once the MongoDB connection is established. This ensures workers
 * do not attempt to process jobs before the DB is ready.
 *
 * Called By:
 * src/workers/email.worker.js
 * src/server.js
 * ============================================================================
 */
import dotenv from 'dotenv';
import { createAgendaWhenConnected } from './agendaInit.js';

dotenv.config();

const agendaReady = new Promise((resolve, reject) => {
  createAgendaWhenConnected(resolve, reject);
});

export { agendaReady };
