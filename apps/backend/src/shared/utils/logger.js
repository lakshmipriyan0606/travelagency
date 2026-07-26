/**
 * ============================================================================
 * Core Logger Configuration
 * ============================================================================
 *
 * Layer:
 * Infrastructure / Utilities
 *
 * Responsibility:
 * Instantiates the global Pino logger used throughout the application.
 * Automatically redacts sensitive fields (passwords, tokens, cookies)
 * to ensure PII compliance in the logs.
 *
 * Called By:
 * src/server.js
 * src/bootstrap/logger.js
 * ============================================================================
 */
import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'body.password', 'password'],
    censor: '[REDACTED]',
  },
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
});

export default logger;
