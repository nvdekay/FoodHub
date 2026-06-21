import { body } from "express-validator";

export const createOrderRules = [
  body("tableId").notEmpty().withMessage("tableId là bắt buộc").bail().isMongoId().withMessage("tableId không hợp lệ"),
  body("items").isArray({ min: 1 }).withMessage("Đơn phải có ít nhất 1 món"),
  body("items.*.productId").notEmpty().withMessage("productId là bắt buộc").bail().isMongoId().withMessage("productId không hợp lệ"),
  body("items.*.quantity").notEmpty().withMessage("Số lượng là bắt buộc").bail().isInt({ min: 1 }).withMessage("Số lượng phải >= 1"),
  body("items.*.selectedOptions").optional().isArray(),
  body("items.*.selectedOptions.*.groupName").notEmpty().withMessage("groupName là bắt buộc"),
  body("items.*.selectedOptions.*.choiceLabel").notEmpty().withMessage("choiceLabel là bắt buộc"),
  body("items.*.note").optional().isString(),
  body("note").optional().isString(),
  body("customerId").optional().isMongoId().withMessage("customerId không hợp lệ"),
];

export const updateOrderRules = [
  body("items").optional().isArray({ min: 1 }).withMessage("items phải có ít nhất 1 món"),
  body("items.*.productId").isMongoId().withMessage("productId không hợp lệ"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("Số lượng phải >= 1"),
  body("items.*.selectedOptions").optional().isArray(),
  body("items.*.selectedOptions.*.groupName").notEmpty(),
  body("items.*.selectedOptions.*.choiceLabel").notEmpty(),
  body("items.*.note").optional().isString(),
  body("note").optional().isString(),
  body("tableId").optional().isMongoId().withMessage("tableId không hợp lệ"),
];
