/**
 * Thoát các ký tự đặc biệt của regex trong chuỗi tìm kiếm do người dùng nhập.
 * Tránh ReDoS và kết quả sai khi truyền thẳng vào $regex của MongoDB.
 */
export const escapeRegex = (str = "") => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
