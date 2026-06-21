import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * users — Tài khoản khách hàng, nhân viên, quản trị (SRS 6.4.1).
 * Một collection chung, phân biệt bằng `role`.
 */
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Họ tên là bắt buộc"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email không hợp lệ"],
    },
    phone: {
      type: String,
      required: [true, "Số điện thoại là bắt buộc"],
      trim: true,
      // SĐT Việt Nam: bắt đầu 0, 10 chữ số
      match: [/^0\d{9}$/, "Số điện thoại không hợp lệ"],
    },
    passwordHash: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
      select: false, // KHÔNG trả về trong API
    },
    role: {
      type: String,
      enum: ["customer", "staff", "admin"],
      default: "customer",
      index: true,
    },
    avatarUrl: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Index bổ sung (email unique đã có từ field; phone để tra cứu)
userSchema.index({ phone: 1 });

/**
 * So khớp mật khẩu thô với passwordHash đã lưu.
 * Lưu ý: cần query user kèm .select("+passwordHash") thì mới có hash để so.
 */
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

export default mongoose.model("User", userSchema);
