import { body } from "express-validator";

// Validate cấu trúc nhóm tuỳ chọn (nếu có gửi options)
const optionRules = [
  body("options").optional().isArray().withMessage("options phải là mảng"),
  body("options.*.name").notEmpty().withMessage("Tên nhóm tuỳ chọn là bắt buộc"),
  body("options.*.type").isIn(["single", "multiple"]).withMessage("type tuỳ chọn phải là single/multiple"),
  body("options.*.required").optional().isBoolean(),
  body("options.*.choices").isArray({ min: 1 }).withMessage("Mỗi nhóm tuỳ chọn cần ít nhất 1 lựa chọn"),
  body("options.*.choices.*.label").notEmpty().withMessage("Lựa chọn cần có label"),
  body("options.*.choices.*.priceModifier").optional().isInt({ min: 0 }).withMessage("priceModifier phải >= 0"),
];

export const createProductRules = [
  body("name").trim().notEmpty().withMessage("Tên món là bắt buộc"),
  body("categoryId").notEmpty().withMessage("categoryId là bắt buộc").bail().isMongoId().withMessage("categoryId không hợp lệ"),
  body("basePrice").notEmpty().withMessage("Giá gốc là bắt buộc").bail().isInt({ min: 0 }).withMessage("Giá gốc phải là số nguyên >= 0"),
  body("description").optional().isString(),
  body("imageUrl").optional({ nullable: true }).isString().withMessage("imageUrl phải là chuỗi link ảnh"),
  body("isAvailable").optional().isBoolean(),
  body("isFeatured").optional().isBoolean(),
  body("preparationTime").optional().isInt({ min: 0 }),
  ...optionRules,
];

export const updateProductRules = [
  body("name").optional().trim().notEmpty().withMessage("Tên món không được rỗng"),
  body("categoryId").optional().isMongoId().withMessage("categoryId không hợp lệ"),
  body("basePrice").optional().isInt({ min: 0 }).withMessage("Giá gốc phải là số nguyên >= 0"),
  body("description").optional().isString(),
  body("imageUrl").optional({ nullable: true }).isString(),
  body("isAvailable").optional().isBoolean(),
  body("isFeatured").optional().isBoolean(),
  body("preparationTime").optional().isInt({ min: 0 }),
  ...optionRules,
];
