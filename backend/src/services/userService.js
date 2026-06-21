import bcrypt from "bcryptjs";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

const saltRounds = () => parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

const stripHash = (userDoc) => {
  const u = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete u.passwordHash;
  return u;
};

/** FR-AUTH-04 — Lấy hồ sơ người dùng hiện tại. */
export const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("Không tìm thấy người dùng");
  return user;
};

/**
 * FR-AUTH-04 — Cập nhật hồ sơ (tên/SĐT/avatar) và/hoặc đổi mật khẩu.
 * Đổi mật khẩu yêu cầu currentPassword đúng. (Email không cho đổi — theo SRS.)
 */
export const updateProfile = async (userId, payload) => {
  const { fullName, phone, avatarUrl, currentPassword, newPassword } = payload;
  const user = await User.findById(userId).select("+passwordHash");
  if (!user) throw ApiError.notFound("Không tìm thấy người dùng");

  if (fullName !== undefined) user.fullName = fullName;
  if (phone !== undefined) user.phone = phone;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

  if (newPassword) {
    if (!currentPassword) {
      throw ApiError.badRequest("Cần nhập mật khẩu hiện tại", "CURRENT_PASSWORD_REQUIRED");
    }
    const ok = await user.comparePassword(currentPassword);
    if (!ok) throw ApiError.badRequest("Mật khẩu hiện tại không đúng", "INVALID_CURRENT_PASSWORD");
    user.passwordHash = await bcrypt.hash(newPassword, saltRounds());
  }

  await user.save();
  return stripHash(user);
};

/** FR-AUTH-05 — Admin: danh sách người dùng (phân trang, lọc role, tìm kiếm). */
export const listUsers = async ({ page, limit, role, search }) => {
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return { data, total };
};

/**
 * FR-AUTH-05 — Admin: khoá/mở khoá (isActive) và/hoặc phân vai trò.
 * Guard #14: không tự thao tác lên chính mình; không khoá/giáng admin active cuối cùng.
 */
export const updateUserStatus = async ({ targetId, actorId, isActive, role }) => {
  const user = await User.findById(targetId);
  if (!user) throw ApiError.notFound("Không tìm thấy người dùng");

  if (String(targetId) === String(actorId)) {
    throw ApiError.conflict("Không thể tự thay đổi trạng thái/quyền của chính mình", "SELF_MODIFY");
  }

  const willLoseAdmin =
    user.role === "admin" && (isActive === false || (role && role !== "admin"));
  if (willLoseAdmin) {
    const activeAdmins = await User.countDocuments({ role: "admin", isActive: true });
    if (activeAdmins <= 1) {
      throw ApiError.conflict("Không thể khoá/giáng quyền admin hoạt động cuối cùng", "LAST_ADMIN");
    }
  }

  if (isActive !== undefined) user.isActive = isActive;
  if (role !== undefined) user.role = role;
  await user.save();

  return user;
};
