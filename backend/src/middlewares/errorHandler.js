import ApiError from "../utils/ApiError.js";

/**
 * Bắt mọi route không khớp → 404 theo format chuẩn.
 * Đặt SAU tất cả route, TRƯỚC errorHandler.
 */
export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Không tìm thấy đường dẫn: ${req.originalUrl}`, "NOT_FOUND"));
};

/**
 * Middleware xử lý lỗi tập trung (4 tham số). Chuẩn hoá mọi lỗi về:
 *   { success: false, message, errorCode, details? }
 * Đặt CUỐI CÙNG trong app.js.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || "INTERNAL_ERROR";
  let message = err.message || "Lỗi máy chủ";
  let details = err.details;

  // Lỗi validate của Mongoose (Schema validation)
  if (err.name === "ValidationError") {
    statusCode = 422;
    errorCode = "VALIDATION_ERROR";
    message = "Dữ liệu không hợp lệ";
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Sai kiểu ObjectId (vd: /:id không hợp lệ)
  else if (err.name === "CastError") {
    statusCode = 400;
    errorCode = "INVALID_ID";
    message = `Giá trị không hợp lệ cho trường '${err.path}'`;
  }

  // Trùng khoá duy nhất (unique index) — MongoServerError code 11000
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0] || "trường";
    // Email là trường unique hay gặp nhất → mã riêng để FE xử lý
    errorCode = field === "email" ? "EMAIL_TAKEN" : "DUPLICATE_KEY";
    message = `Giá trị '${field}' đã tồn tại`;
  }

  // Lỗi JWT
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    errorCode = "UNAUTHORIZED";
    message = "Token không hợp lệ";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    errorCode = "UNAUTHORIZED";
    message = "Phiên đăng nhập đã hết hạn";
  }

  // Log lỗi không lường trước (bug) để debug
  if (statusCode >= 500) {
    console.error("❌ Unhandled error:", err);
  }

  const body = { success: false, message, errorCode };
  if (details) body.details = details;

  res.status(statusCode).json(body);
};
