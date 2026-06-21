/**
 * Lỗi nghiệp vụ chuẩn hoá. Ném (throw) trong service/controller để
 * errorHandler bắt và trả về đúng format SRS 7.5:
 *   { success: false, message, errorCode }
 *
 * Ví dụ: throw new ApiError(409, "Đơn không thể sửa", "ORDER_NOT_EDITABLE");
 */
class ApiError extends Error {
  constructor(statusCode, message, errorCode = "INTERNAL_ERROR", details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true; // lỗi đã lường trước (không phải bug)
    Error.captureStackTrace(this, this.constructor);
  }

  // Các helper tạo nhanh lỗi thường gặp
  static badRequest(msg = "Yêu cầu không hợp lệ", code = "VALIDATION_ERROR") {
    return new ApiError(400, msg, code);
  }
  static unauthorized(msg = "Chưa đăng nhập", code = "UNAUTHORIZED") {
    return new ApiError(401, msg, code);
  }
  static forbidden(msg = "Không đủ quyền", code = "FORBIDDEN") {
    return new ApiError(403, msg, code);
  }
  static notFound(msg = "Không tìm thấy", code = "NOT_FOUND") {
    return new ApiError(404, msg, code);
  }
  static conflict(msg = "Xung đột dữ liệu", code = "CONFLICT") {
    return new ApiError(409, msg, code);
  }
}

export default ApiError;
