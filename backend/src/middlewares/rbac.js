import ApiError from "../utils/ApiError.js";

/**
 * Kiểm tra vai trò (RBAC). Đặt SAU authenticate.
 * Dùng: router.get("/", authenticate, requireRole("admin"), handler)
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden("Bạn không có quyền thực hiện thao tác này"));
  }
  next();
};

// Tiện ích dùng lại: 👮 nhân viên (staff hoặc admin) và 👮 chỉ admin
export const requireStaff = requireRole("staff", "admin");
export const requireAdmin = requireRole("admin");
