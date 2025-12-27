import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/admin.auth.routes.js";
import packageRoute from "./routes/package.routes.js";
import bookingRoute from "./routes/bookingForm.route.js";
import newsletterRoute from "./routes/newsletter.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://travelagency-1-odma.onrender.com",
  'https://travelagency-pearl.vercel.app/'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS Not Allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "userId"],
  })
);


app.use("/api/admin", authRoutes);
app.use("/api/packages", packageRoute);
app.use("/api", bookingRoute);
app.use("/api/newsletter", newsletterRoute);

export default app;
