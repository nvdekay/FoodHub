import bcrypt from "bcryptjs";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { signToken } from "../utils/jwt.js";

const saltRounds = () => parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

// Bỏ passwordHash trước khi trả ra ngoài
const sanitize = (userDoc) => {
  const u = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete u.passwordHash;
  return u;
};

/**
 * FR-AUTH-01 — Đăng ký. Email duy nhất (lỗi 11000 → EMAIL_TAKEN ở errorHandler),
 * mật khẩu hash bcrypt, role mặc định customer.
 */
export const register = async ({ fullName, email, phone, password }) => {
  const passwordHash = await bcrypt.hash(password, saltRounds());
  const user = await User.create({
    fullName,
    email,
    phone,
    passwordHash,
    role: "customer",
  });

  const token = signToken({ userId: user._id });
  return { user: sanitize(user), token };
};

/**
 * FR-AUTH-02 — Đăng nhập bằng email + mật khẩu. Cập nhật lastLoginAt, trả JWT.
 */
export const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");

  // Thông báo chung để tránh dò email tồn tại hay không
  if (!user) throw ApiError.unauthorized("Email hoặc mật khẩu không đúng", "INVALID_CREDENTIALS");
  if (!user.isActive) throw new ApiError(401, "Tài khoản đã bị khoá", "ACCOUNT_LOCKED");

  const ok = await user.comparePassword(password);
  if (!ok) throw ApiError.unauthorized("Email hoặc mật khẩu không đúng", "INVALID_CREDENTIALS");

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken({ userId: user._id });
  return { user: sanitize(user), token };
};
