import { body } from "express-validator";

export const createTableRules = [
  body("tableNumber").trim().notEmpty().withMessage("Số bàn là bắt buộc"),
  body("capacity").optional().isInt({ min: 1 }).withMessage("Sức chứa phải là số nguyên >= 1"),
  body("status").optional().isIn(["available", "occupied", "reserved"]).withMessage("Trạng thái bàn không hợp lệ"),
  body("qrCodeUrl").optional({ nullable: true }).isString().withMessage("qrCodeUrl phải là chuỗi link"),
  body("isActive").optional().isBoolean(),
];

export const updateTableRules = [
  body("tableNumber").optional().trim().notEmpty().withMessage("Số bàn không được rỗng"),
  body("capacity").optional().isInt({ min: 1 }),
  body("status").optional().isIn(["available", "occupied", "reserved"]).withMessage("Trạng thái bàn không hợp lệ"),
  body("qrCodeUrl").optional({ nullable: true }).isString(),
  body("isActive").optional().isBoolean(),
];
