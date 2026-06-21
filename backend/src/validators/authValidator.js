import { body } from "express-validator";

export const registerRules = [
  body("fullName").trim().notEmpty().withMessage("Họ tên là bắt buộc"),
  body("email").trim().isEmail().withMessage("Email không hợp lệ"),
  body("phone").trim().matches(/^0\d{9}$/).withMessage("Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)"),
  body("password").isLength({ min: 6 }).withMessage("Mật khẩu tối thiểu 6 ký tự"),
];

export const loginRules = [
  body("email").trim().isEmail().withMessage("Email không hợp lệ"),
  body("password").notEmpty().withMessage("Mật khẩu là bắt buộc"),
];
