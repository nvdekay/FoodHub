import jwt from "jsonwebtoken";

/**
 * Ký & xác thực JWT. Token chỉ mang `userId` (quyết định #13):
 * role + trạng thái khoá luôn được nạp tươi từ DB ở middleware auth mỗi request.
 */
export const signToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
