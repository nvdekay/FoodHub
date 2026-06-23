import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import apiRouter from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// --- Bảo mật header (helmet) ---
app.use(helmet());

// --- Middleware nền ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log request ở môi trường dev
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// --- Rate limiting ---
// Giới hạn chung cho toàn bộ API (chặn lạm dụng/quét).
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Quá nhiều yêu cầu, vui lòng thử lại sau" },
});
// Giới hạn chặt cho xác thực (chống brute-force đăng nhập/đăng ký).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Quá nhiều lần thử, vui lòng thử lại sau ít phút" },
});
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

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
