/**
 * ============================================================================
 * Express Application Composition Root
 * ============================================================================
 *
 * Layer:
 * Infrastructure
 *
 * Responsibility:
 * This file creates and configures the core Express.js application instance.
 * It acts purely as a composition root, wiring together middleware, routes,
 * and error handlers in the strictly required execution order.
 *
 * Called By:
 * src/server.js
 *
 * Depends On:
 * src/app/registerMiddlewares.js
 * src/app/registerRoutes.js
 *
 * Does NOT contain business logic or individual route definitions.
 * ============================================================================
 */
import express from 'express';
import { initSentry, setupSentryErrorHandler } from './bootstrap/sentry.js';
import { registerMiddlewares } from './app/registerMiddlewares.js';
import { registerRoutes } from './app/registerRoutes.js';
import { globalErrorHandler } from '#middleware/error/errorHandler.js';

const app = express();
app.set('trust proxy', 1);

// ============================================================================
// 1. Initialize Monitoring Services
// ----------------------------------------------------------------------------
// Sentry must be initialized before any routing to catch initialization errors
// and properly trace the entire lifecycle of subsequent requests.
// ============================================================================
initSentry();

// ============================================================================
// 2. Register Global Middleware
// ----------------------------------------------------------------------------
// Includes essential security headers (Helmet), parsing (JSON, URL-encoded),
// request sanitization, and structured logging (Pino).
// Must execute BEFORE routes to guarantee payload safety.
// ============================================================================
registerMiddlewares(app);

// ============================================================================
// 3. Register Application Routes
// ----------------------------------------------------------------------------
// Mounts infrastructure endpoints (metrics, health) and Application Gateways.
// Every API request enters the feature modules through these mounted gateways.
// ============================================================================
registerRoutes(app);

// ============================================================================
// 4. Global Error Handling
// ----------------------------------------------------------------------------
// Catch-all handlers for operational or unhandled errors. Must be registered
// AFTER all routes and middlewares to catch next(err) invocations.
// ============================================================================
setupSentryErrorHandler(app);
app.use(globalErrorHandler);

export default app;
