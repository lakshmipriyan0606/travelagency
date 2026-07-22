/**
 * ============================================================================
 * Sentry Configuration
 * ============================================================================
 *
 * Layer:
 * Infrastructure / Error Tracking
 *
 * Responsibility:
 * Initializes Sentry for capturing unhandled exceptions and performance
 * profiling in the production environment.
 *
 * Called By:
 * src/app.js
 * ============================================================================
 */
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export const initSentry = () => {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [nodeProfilingIntegration()],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    });
  }
};

export const setupSentryErrorHandler = (app) => {
  if (process.env.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
  }
};
