/**
 * Bọc controller async để mọi lỗi (Promise reject) tự động chuyển tới
 * errorHandler, khỏi phải viết try/catch lặp lại trong từng controller.
 *
 * Dùng: router.get("/", asyncHandler(controllerFn))
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
