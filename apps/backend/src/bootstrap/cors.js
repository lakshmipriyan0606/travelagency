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

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://travelagency-1-odma.onrender.com',
  'https://travelagency-pearl.vercel.app',
  'https://travelagency-tawny.vercel.app',
  'https://www.sastikaatravel.com',
  'https://sastikaatravel.com',
  process.env.CORS_ORIGIN,
]
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ''));

export const corsMiddleware = cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
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
    'Cache-Control',
    'Pragma',
  ],
  maxAge: 86400,
});
