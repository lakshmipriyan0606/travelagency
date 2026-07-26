/**
 * ============================================================================
 * Pino Request Logger Configuration
 * ============================================================================
 *
 * Layer:
 * Infrastructure / Observability
 *
 * Responsibility:
 * Binds the global Pino logger instance to incoming HTTP requests.
 * Automatically attaches a unique request ID (UUIDv4) to every log
 * generated during the request lifecycle for end-to-end tracing.
 *
 * Called By:
 * src/app/registerMiddlewares.js
 * ============================================================================
 */
import pinoHttp from 'pino-http';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '#shared/utils/logger.js';

export const loggerMiddleware = pinoHttp({
  logger,
  genReqId: (req) => req.headers['x-request-id'] || uuidv4(),
});
