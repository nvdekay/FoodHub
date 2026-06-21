import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import apiRouter from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Phục vụ ảnh upload tĩnh tại /uploads
const uploadDir = process.env.UPLOAD_DIR || "uploads";
app.use("/uploads", express.static(path.join(__dirname, "..", uploadDir)));

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
