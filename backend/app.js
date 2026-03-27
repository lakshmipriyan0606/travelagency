import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";

// Routes
import authRoutes from "./routes/admin.auth.routes.js";
import packageRoute from "./routes/package.routes.js";
import bookingRoute from "./routes/bookingForm.route.js";
import newsletterRoute from "./routes/newsletter.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import blogRoutes from "./routes/blog.routes.js";

// Infrastructure Middleware
import { globalLimiter, authLimiter, apiLimiter, bookingLimiter } from "./middlewares/rateLimiter.middleware.js";
import { register, httpRequestCounter, publicHttpRequestCounter, httpRequestDuration } from "./config/metrics.js";
import { protectRoute, superAdminOnly } from "./middlewares/auth.middleware.js";

const app = express();

// ── Prometheus: record every request ─────────────────────────────────
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    const route = req.route?.path || req.path || "unknown";
    const labels = { method: req.method, route, status: res.statusCode };
    httpRequestCounter.inc(labels);
    end(labels);

    // "Production/public" count:
    // - exclude metrics/health endpoints and admin endpoints (dashboard polling would inflate counts)
    // - exclude localhost/dev origins
    const path = req.path || "";
    const origin = (req.headers.origin || "").toString();
    const host = (req.headers.host || "").toString();

    const isInternalMetricsPath =
      path === "/metrics" ||
      path === "/health" ||
      path.startsWith("/api/admin/metrics");

    const isAdminApi = path.startsWith("/api/admin");

    const isLocalDev =
      /localhost|127\.0\.0\.1/i.test(origin) ||
      /localhost|127\.0\.0\.1/i.test(host);

    if (!isInternalMetricsPath && !isAdminApi && !isLocalDev) {
      publicHttpRequestCounter.inc(labels);
    }
  });
  next();
});

// ── Global Rate Limiter ───────────────────────────────────────────────
app.use(globalLimiter);

app.use(compression());
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://travelagency-1-odma.onrender.com",
  "https://travelagency-pearl.vercel.app",
  "https://travelagency-tawny.vercel.app",
  "https://www.sastikaatravel.com",
  "https://sastikaatravel.com",
  process.env.CORS_ORIGIN,
].filter(Boolean).map(origin => origin.replace(/\/$/, ""));

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
      } else {
        callback(new Error("CORS Not Allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "userId", "UserId", "x-metrics-token"],
    maxAge: 86400,
  })
);

// ── Metrics Endpoint (Prometheus) ─────────────────────────────────────
app.get("/metrics", async (req, res) => {
  const token = req.headers["x-metrics-token"];
  if (process.env.METRICS_TOKEN && token !== process.env.METRICS_TOKEN) {
    return res.status(403).json({ message: "Forbidden: Invalid metrics token" });
  }
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// ── Metrics Endpoint (JSON for Admin Panel) ───────────────────────────
app.get("/api/admin/metrics", async (req, res, next) => {
  // Allow either:
  // - token-based access (recommended for pulling production metrics into a separately hosted admin UI)
  // - OR authenticated superadmin session (cookie)
  const token = req.headers["x-metrics-token"];
  if (process.env.METRICS_TOKEN && token === process.env.METRICS_TOKEN) {
    return next();
  }
  return protectRoute(req, res, () => superAdminOnly(req, res, next));
}, async (req, res) => {
  try {
    const metrics = await register.getMetricsAsJSON();
    res.status(200).json(metrics);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    res.status(500).json({ message: "Failed to fetch metrics" });
  }
});

// ── Health Check ──────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime().toFixed(2) + "s",
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
  });
});

// ── Routes with targeted rate limiters ───────────────────────────────
app.use("/api/admin", authLimiter, authRoutes);
app.use("/api/packages", apiLimiter, packageRoute);
app.use("/api", bookingLimiter, bookingRoute);
app.use("/api/newsletter", newsletterRoute);
app.use("/api/upload", uploadRoutes);
app.use("/api/blogs", apiLimiter, blogRoutes);

export default app;
