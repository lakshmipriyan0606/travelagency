import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import authRoutes from "./routes/admin.auth.routes.js";
import packageRoute from "./routes/package.routes.js";
import bookingRoute from "./routes/bookingForm.route.js";
import newsletterRoute from "./routes/newsletter.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

const app = express();

app.use(compression());
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://travelagency-1-odma.onrender.com",
  "https://travelagency-pearl.vercel.app",
  "https://travelagency-tawny.vercel.app",
  'https://www.sastikaatravel.com/',
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
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "userId", "UserId"],
    maxAge: 86400, // Cache preflight requests for 24 hours
  })
);


app.use("/api/admin", authRoutes);
app.use("/api/packages", packageRoute);
app.use("/api", bookingRoute);
app.use("/api/newsletter", newsletterRoute);
app.use("/api/upload", uploadRoutes);

export default app;
