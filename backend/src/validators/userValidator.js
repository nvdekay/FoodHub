import { body } from "express-validator";

export const updateProfileRules = [
  body("fullName").optional().trim().notEmpty().withMessage("Họ tên không được rỗng"),
  body("phone").optional().trim().matches(/^0\d{9}$/).withMessage("Số điện thoại không hợp lệ"),
  body("avatarUrl").optional({ nullable: true }).isString().withMessage("avatarUrl không hợp lệ"),
  body("currentPassword").optional().isString(),
  body("newPassword").optional().isLength({ min: 6 }).withMessage("Mật khẩu mới tối thiểu 6 ký tự"),
];

export const updateStatusRules = [
  body("isActive").optional().isBoolean().withMessage("isActive phải là boolean"),
  body("role").optional().isIn(["customer", "staff", "admin"]).withMessage("Vai trò không hợp lệ"),
  body().custom((value) => {
    if (value.isActive === undefined && value.role === undefined) {
      throw new Error("Cần cung cấp ít nhất isActive hoặc role");
    }
    return true;
  }),
];
