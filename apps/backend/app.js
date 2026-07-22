import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import pinoHttp from 'pino-http';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './src/shared/logger.js';
import { globalErrorHandler } from './src/middleware/error/errorHandler.js';
// Routes
import authRoutes from './src/modules/auth/auth.routes.js';
import packageRoute from './src/modules/packages/package.routes.js';
import bookingRoute from './src/modules/bookings/booking.routes.js';
import newsletterRoute from './src/modules/newsletter/newsletter.routes.js';
import uploadRoutes from './src/modules/upload/upload.routes.js';
import blogRoutes from './src/modules/blogs/blog.routes.js';
import reviewRoutes from './src/modules/reviews/review.routes.js';
import storyRoutes from './src/modules/stories/story.routes.js';
import destinationRoutes from './src/modules/destinations/destination.routes.js';
import uiConfigRoutes from './src/modules/uiConfig/uiConfig.routes.js';
import websiteHeroRoutes from './src/modules/websiteHero/websiteHero.routes.js';
import analyticsRoute from './src/modules/analytics/analytics.routes.js';

// Infrastructure Middleware
import {
  globalLimiter,
  authLimiter,
  apiLimiter,
} from './src/middlewares/rateLimiter.middleware.js';
import {
  register,
  httpRequestCounter,
  publicHttpRequestCounter,
  httpRequestDuration,
  httpRequestsActive,
} from './config/metrics.js';
import { protectRoute, superAdminOnly } from './src/middleware/auth/auth.middleware.js';
import { getQueuePublicSnapshot, getQueueHealthDetail } from './config/queueRuntime.js';
import ApiHit from './src/modules/analytics/apiHit.model.js';
import { getFullPath, getUtcDateString, isPublicApiRequest } from './utils/requestOrigin.js';

const app = express();
app.set('trust proxy', 1);

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
}

// ── Security Headers & Logging ────────────────────────────────────────
app.use(helmet());
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => req.headers['x-request-id'] || uuidv4(),
  })
);

// ── Prometheus: record every request ─────────────────────────────────
app.use((req, res, next) => {
  httpRequestsActive.inc({ method: req.method });
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    httpRequestsActive.dec({ method: req.method });
    const fullPath = getFullPath(req);
    const route = fullPath || req.route?.path || req.path || 'unknown';
    const labels = { method: req.method, route, status: res.statusCode };
    httpRequestCounter.inc(labels);
    end(labels);

    if (isPublicApiRequest(req)) {
      publicHttpRequestCounter.inc(labels);

      const date = getUtcDateString();
      ApiHit.findOneAndUpdate(
        { date, method: req.method, route, status: res.statusCode },
        { $inc: { count: 1 } },
        { upsert: true }
      ).catch((err) => logger.error(`ApiHit persist error: ${err.message}`));
    }
  });
  next();
});

// ── Global Rate Limiter ───────────────────────────────────────────────
app.use(globalLimiter);

app.use(compression());
app.use(express.json());
app.use(mongoSanitize());
app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:5173',
  'https://travelagency-1-odma.onrender.com',
  'https://travelagency-pearl.vercel.app',
  'https://travelagency-tawny.vercel.app',
  'https://www.sastikaatravel.com',
  'https://sastikaatravel.com',
  process.env.CORS_ORIGIN,
]
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ''));

app.use(
  cors({
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
  })
);

// ── Metrics Endpoint (Prometheus) ─────────────────────────────────────
app.get('/metrics', async (req, res) => {
  const token = req.headers['x-metrics-token'];
  if (process.env.METRICS_TOKEN && token !== process.env.METRICS_TOKEN) {
    return res.status(403).json({ message: 'Forbidden: Invalid metrics token' });
  }
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ── Metrics Endpoint (JSON for Admin Panel) ───────────────────────────
app.get(
  '/api/admin/metrics',
  async (req, res, next) => {
    // Allow either:
    // - token-based access (recommended for pulling production metrics into a separately hosted admin UI)
    // - OR authenticated superadmin session (cookie)
    const token = req.headers['x-metrics-token'];
    if (process.env.METRICS_TOKEN && token === process.env.METRICS_TOKEN) {
      return next();
    }
    return protectRoute(req, res, () => superAdminOnly(req, res, next));
  },
  async (req, res) => {
    try {
      const metrics = await register.getMetricsAsJSON();
      res.status(200).json(metrics);
    } catch (error) {
      logger.error({ error }, 'Error fetching metrics');
      res.status(500).json({ message: 'Failed to fetch metrics' });
    }
  }
);

// ── Agenda / booking queue health (admin or metrics token) ───────────
app.get(
  '/api/admin/queue/health',
  async (req, res, next) => {
    const token = req.headers['x-metrics-token'];
    if (process.env.METRICS_TOKEN && token === process.env.METRICS_TOKEN) {
      return next();
    }
    return protectRoute(req, res, () => superAdminOnly(req, res, next));
  },
  async (req, res) => {
    try {
      const detail = await getQueueHealthDetail();
      const healthy =
        detail.mongoConnected && detail.agendaWorkerStarted && typeof detail.note !== 'string';
      res.status(200).json({
        healthy,
        ...detail,
        hints: {
          ifAgendaWorkerFalse:
            'Server did not finish agenda.start(); check deploy/restart and server logs.',
          ifRecentFailures:
            'See recentFailures.reason — common fix: update Agenda job define() order (handler before options).',
          ifMongoFalse: 'Check MONGO_URI and Atlas network access.',
        },
      });
    } catch (error) {
      logger.error({ error }, 'Queue health error');
      res.status(500).json({
        healthy: false,
        message: error.message || 'Failed to read queue health',
      });
    }
  }
);

// ── Health Check ──────────────────────────────────────────────────────
app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

app.get('/health/ready', (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  if (!isMongoConnected) {
    return res.status(503).json({ status: 'unavailable', reason: 'Database not connected' });
  }
  res.status(200).json({ status: 'ready' });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime().toFixed(2) + 's',
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    nodeVersion: process.version,
    appVersion: process.env.npm_package_version || 'unknown',
    env: process.env.NODE_ENV || 'development',
    queue: getQueuePublicSnapshot(),
    dbState: mongoose.connection.readyState,
  });
});

// ── Routes with targeted rate limiters ───────────────────────────────
app.use('/api/admin', authLimiter, authRoutes);
// UI Config (website hero):
// - admin update routes are mounted under /api/admin/ui (protected)
// - public website routes are mounted under /api/ui
app.use('/api/admin/ui', authLimiter, uiConfigRoutes);
app.use('/api/ui', uiConfigRoutes);
app.use('/api/website-hero', websiteHeroRoutes);
app.use('/api/packages', apiLimiter, packageRoute);
// bookingLimiter is applied only on POST /booking/create (see bookingForm.route.js)
app.use('/api', bookingRoute);
app.use('/api/newsletter', newsletterRoute);
app.use('/api/upload', uploadRoutes);
app.use('/api/blogs', apiLimiter, blogRoutes);
app.use('/api/reviews', apiLimiter, reviewRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/analytics', analyticsRoute);

// ── Global Error Handling ──────────────────────────────────────────────
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

app.use(globalErrorHandler);

export default app;
