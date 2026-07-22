/**
 * ============================================================================
 * Application Route Registration
 * ============================================================================
 *
 * Layer:
 * Infrastructure / Routing
 *
 * Responsibility:
 * Centralizes the mounting of all application endpoints onto the Express app.
 * It maps root URL prefixes to their respective Application Gateways or
 * infrastructure monitoring tools.
 *
 * Called By:
 * src/app.js
 *
 * Depends On:
 * src/app/gateways/b2c.gateway.js
 * src/app/gateways/b2c-admin.gateway.js
 * ============================================================================
 */
import { authLimiter } from '#middleware/rateLimiter.middleware.js';
import healthRoutes from '#health/health.routes.js';
import metricsRoutes from '#monitoring/metrics.routes.js';
import queueRoutes from '#monitoring/queue.routes.js';

import b2cGateway from './gateways/b2c.gateway.js';
import b2cAdminGateway from './gateways/b2c-admin.gateway.js';

export const registerRoutes = (app) => {
  // ============================================================================
  // Infrastructure Endpoints
  // ----------------------------------------------------------------------------
  // Internal endpoints utilized by load balancers, Kubernetes, and Prometheus
  // for monitoring the cluster state. Unauthenticated but generally kept hidden.
  // ============================================================================
  app.use(healthRoutes);
  app.use(metricsRoutes);
  app.use(queueRoutes);

  // ============================================================================
  // Application Gateways
  // ----------------------------------------------------------------------------
  // The primary entry points for business logic. Gateways encapsulate routes
  // tailored for specific consumer contexts (B2C, Admin) with API versioning.
  // ============================================================================

  // Public B2C Gateway
  // Mounted without auth limiters because limiters are applied on specific routes.
  app.use('/api/v1/b2c', b2cGateway);

  // Protected B2C-Admin Gateway
  // Aggressively rate-limited globally across all admin routes to prevent brute
  // force attacks against administrative endpoints.
  app.use('/api/v1/b2c-admin', authLimiter, b2cAdminGateway);
};
