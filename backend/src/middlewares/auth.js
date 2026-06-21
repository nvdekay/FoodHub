import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Xác thực JWT cho route cần đăng nhập (🔒).
 * Quyết định #13: nạp user từ DB MỖI request để lấy role mới nhất và
 * chặn ngay tài khoản đã bị khoá (token cũ không còn hiệu lực ngầm).
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Thiếu token xác thực");
  }

  const token = header.slice(7).trim();
  const decoded = verifyToken(token); // lỗi JWT → errorHandler xử lý 401

  const user = await User.findById(decoded.userId);
  if (!user) throw ApiError.unauthorized("Tài khoản không tồn tại");
  if (!user.isActive) throw new ApiError(401, "Tài khoản đã bị khoá", "ACCOUNT_LOCKED");

  req.user = {
    userId: user._id,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
  };
  next();
});
