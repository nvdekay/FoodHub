import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

/**
 * Middleware đặt SAU danh sách rule của express-validator.
 * Nếu có lỗi validate → ném ApiError 422 (VALIDATION_ERROR) kèm chi tiết từng field.
 *
 * Dùng: router.post("/", registerRules, validate, controller)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const details = errors.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  throw new ApiError(422, "Dữ liệu không hợp lệ", "VALIDATION_ERROR", details);
};

export default validate;
