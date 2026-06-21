import { body } from "express-validator";

export const createCategoryRules = [
  body("name").trim().notEmpty().withMessage("Tên danh mục là bắt buộc"),
  body("description").optional().isString(),
  body("imageUrl").optional({ nullable: true }).isString().withMessage("imageUrl phải là chuỗi link ảnh"),
  body("displayOrder").optional().isInt({ min: 0 }).withMessage("displayOrder phải là số nguyên >= 0"),
  body("isActive").optional().isBoolean(),
];

export const updateCategoryRules = [
  body("name").optional().trim().notEmpty().withMessage("Tên danh mục không được rỗng"),
  body("description").optional().isString(),
  body("imageUrl").optional({ nullable: true }).isString(),
  body("displayOrder").optional().isInt({ min: 0 }),
  body("isActive").optional().isBoolean(),
];
