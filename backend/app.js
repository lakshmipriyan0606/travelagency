import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/admin.auth.routes.js";
import packageRoute from "./routes/package.routes.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/admin/auth", authRoutes);
app.use("/api/packages", packageRoute);

export default app;
