/**
 * Helper trả response thống nhất theo SRS 7.5.
 */

// Thành công: { success: true, data, message }
export const sendSuccess = (res, data = null, message = "Thành công", statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

// Tạo mới (201)
export const sendCreated = (res, data = null, message = "Tạo thành công") => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Danh sách có phân trang:
 * { success: true, data: [...], pagination: { page, limit, total, totalPages } }
 */
export const sendPaginated = (res, data, { page, limit, total }, message = "Thành công") => {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: { page, limit, total, totalPages },
  });
};
