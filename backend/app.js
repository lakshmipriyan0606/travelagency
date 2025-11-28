import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/admin.auth.routes.js";
import packageRoute from "./routes/package.routes.js";
import bookingRoute from "./routes/bookingForm.route.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://travelagency-1-odma.onrender.com",
    credentials: true,
  })
);

app.use("/api/admin", authRoutes);
app.use("/api/packages", packageRoute);
app.use("/api", bookingRoute);

export default app;
