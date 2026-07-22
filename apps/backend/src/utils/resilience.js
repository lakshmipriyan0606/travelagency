/**
 * ============================================================================
 * Resilience Utilities
 * ============================================================================
 *
 * Layer:
 * Shared Utility / Reliability
 *
 * Responsibility:
 * Provides wrappers for external API calls to implement timeout thresholds
 * and exponential backoff retry logic. Essential for preventing cascading
 * failures in a microservices / API integration context.
 *
 * Called By:
 * src/modules/bookings/bookingIntegration.service.js
 * ============================================================================
 */
import { logger } from '#shared/logger.js';
import * as Sentry from '@sentry/node';

/**
 * A generic resilience wrapper that implements:
 * 1. Request Timeouts (Promise.race)
 * 2. Exponential Backoff Retries
 *
 * @param {Function} asyncFn - The async function to execute.
 * @param {Object} options - { retries: number, timeoutMs: number, backoffMs: number }
 * @param {string} context - The name/context of the operation for logging.
 */
export const withResilience = async (
  asyncFn,
  { retries = 3, timeoutMs = 5000, backoffMs = 500 } = {},
  context = 'External_Operation'
) => {
  let attempt = 0;

  while (attempt < retries) {
    attempt++;
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Operation Timed Out')), timeoutMs)
      );

      // Race the actual function against the timeout
      return await Promise.race([asyncFn(), timeoutPromise]);
    } catch (error) {
      const isLastAttempt = attempt === retries;

      logger.warn(
        {
          context,
          attempt,
          error: error.message,
          retrying: !isLastAttempt,
        },
        `Resilience wrapper caught error in ${context}`
      );

      if (isLastAttempt) {
        if (process.env.SENTRY_DSN) {
          Sentry.captureException(error, {
            tags: { context, attemptsFailed: attempt },
          });
        }
        throw error; // Bubble up the final error
      }

      // Exponential backoff before next retry
      const delay = backoffMs * 2 ** (attempt - 1);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};
