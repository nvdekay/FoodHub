import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5050;

/**
 * Kiểm tra biến môi trường bắt buộc ngay khi khởi động (fail-fast),
 * tránh lỗi runtime mơ hồ về sau (vd: ký JWT với secret undefined).
 */
const validateEnv = () => {
  const required = ["JWT_SECRET", "MONGODB_URI"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`❌ Thiếu biến môi trường bắt buộc: ${missing.join(", ")}`);
    console.error("   Hãy tạo file .env từ .env.example và điền đầy đủ.");
    process.exit(1);
  }
};

const startServer = async () => {
  validateEnv();
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
