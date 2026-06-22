import express from "express";
import cors from "cors";
import morgan from "morgan";

import apiRouter from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// --- Middleware nền ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log request ở môi trường dev
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// --- Health check gốc ---
app.get("/", (req, res) => {
  res.json({ success: true, message: "FoodHub API is running 🍔" });
});

// --- API routes (tiền tố /api) ---
app.use("/api", apiRouter);

// --- 404 & xử lý lỗi tập trung (luôn đặt cuối) ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
