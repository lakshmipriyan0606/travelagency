/**
 * ============================================================================
 * CORS Configuration
 * ============================================================================
 *
 * Layer:
 * Infrastructure / Security
 *
 * Responsibility:
 * Configures Cross-Origin Resource Sharing (CORS) rules for the application.
 * Restricts access to a specific allowlist of domains (frontend apps) to
 * prevent unauthorized browser-based cross-site requests.
 *
 * Called By:
 * src/app/registerMiddlewares.js
 * ============================================================================
 */
import cors from 'cors';

// Production origins (explicit allowlist)
const productionOrigins = [
  'https://travelagency-1-odma.onrender.com',
  'https://travelagency-pearl.vercel.app',
  'https://travelagency-tawny.vercel.app',
  'https://www.sastikaatravel.com',
  'https://sastikaatravel.com',
  process.env.CORS_ORIGIN,
]
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ''));

// Allows any localhost port (3000, 3001, 3002, 5173, etc.) during development.
// Matches: http://localhost:<port> and http://127.0.0.1:<port>
const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export const corsMiddleware = cors({
  origin: function (origin, callback) {
    if (!origin) {
      // Same-origin or server-to-server — always allow
      return callback(null, true);
    }

    const normalized = origin.replace(/\/$/, '');

    if (LOCALHOST_ORIGIN.test(normalized) || productionOrigins.includes(normalized)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Not Allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'userId',
    'UserId',
    'x-metrics-token',
    'x-devops-csrf',
    'Cache-Control',
    'Pragma',
  ],
  maxAge: 86400,
});
