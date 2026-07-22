import client from 'prom-client';

// Collect default Node.js metrics: CPU, memory, event loop lag, GC, etc.
const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'travelagency_' });

// ── Custom Metrics ───────────────────────────────────────────────────
export const httpRequestCounter = new client.Counter({
  name: 'travelagency_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// Production-focused counter: excludes localhost/dev + excludes admin/metrics endpoints (see app middleware)
export const publicHttpRequestCounter = new client.Counter({
  name: 'travelagency_http_requests_public_total',
  help: 'Total number of public (production) HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

export const httpRequestDuration = new client.Histogram({
  name: 'travelagency_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

export const httpRequestsActive = new client.Gauge({
  name: 'travelagency_http_requests_active',
  help: 'Number of active HTTP requests',
  labelNames: ['method'],
  registers: [register],
});

export { register };
