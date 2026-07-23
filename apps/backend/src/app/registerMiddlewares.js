/**
 * ============================================================================
 * Global Middleware Registration
 * ============================================================================
 *
 * Layer:
 * Infrastructure
 *
 * Responsibility:
 * Centralizes the registration of global middleware that must execute
 * against *every* incoming HTTP request before it reaches routing logic.
 *
 * Called By:
 * src/app.js
 *
 * Execution Order is Critical:
 * 1. Security Headers (Helmet)
 * 2. Logging & Monitoring (Pino, Prometheus)
 * 3. Rate Limiting (Global Limiter)
 * 4. Payload Parsing (JSON, Compression, Cookie Parser)
 * 5. Sanitization (MongoSanitize)
 * 6. CORS
 * ============================================================================
 */
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';

import { loggerMiddleware } from '#bootstrap/logger.js';
import { prometheusMiddleware } from '#bootstrap/prometheus.js';
import { corsMiddleware } from '#bootstrap/cors.js';
import { globalLimiter } from '#middleware/rateLimiter.middleware.js';

export const registerMiddlewares = (app) => {
  // ============================================================================
  // Security Headers & Logging
  // ----------------------------------------------------------------------------
  // Helmet sets essential HTTP security headers (XSS, CSP, Clickjacking).
  // Logger binds Pino instance to the request to trace subsequent execution.
  // ============================================================================
  app.use(helmet());
  app.use(loggerMiddleware);

  // ============================================================================
  // Prometheus Monitoring
  // ----------------------------------------------------------------------------
  // Records the start time of the request to measure duration and throughput.
  // ============================================================================
  app.use(prometheusMiddleware);

  // ============================================================================
  // Global Rate Limiter
  // ----------------------------------------------------------------------------
  // Protects the infrastructure from DDoS by dropping abusive IP traffic early.
  // Must execute BEFORE body parsers to save CPU cycles on dropped requests.
  // ============================================================================
  app.use(globalLimiter);

  // ============================================================================
  // Body & Cookie Parsers
  // ----------------------------------------------------------------------------
  // Express parses JSON payloads. Compression minifies the HTTP response payload.
  // mongoSanitize intercepts the parsed JSON object to strip out MongoDB
  // operator injection strings (like $or or $gt).
  // ============================================================================
  app.use(compression());
  app.use(express.json());
  app.use((req, res, next) => {
    ['body', 'params', 'query', 'headers'].forEach((k) => {
      if (req[k]) {
        mongoSanitize.sanitize(req[k], { replaceWith: '_' });
      }
    });
    next();
  });
  app.use(cookieParser());

  // ============================================================================
  // CORS Configuration
  // ----------------------------------------------------------------------------
  // Validates the origin of cross-origin requests.
  // ============================================================================
  app.use(corsMiddleware);
};
