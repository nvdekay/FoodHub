/**
 * Sinh slug thân thiện URL từ chuỗi tiếng Việt.
 * Ví dụ: "Trà sữa trân châu đường đen" -> "tra-sua-tran-chau-duong-den"
 */
const slugify = (str = "") => {
  return str
    .toString()
    .normalize("NFD") // tách dấu khỏi ký tự
    .replace(/[̀-ͯ]/g, "") // bỏ dấu thanh (combining marks)
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // bỏ ký tự đặc biệt
    .replace(/[\s_-]+/g, "-") // khoảng trắng/gạch dưới -> gạch nối
    .replace(/^-+|-+$/g, ""); // bỏ gạch nối thừa ở 2 đầu
};

export default slugify;

/**
 * Sinh slug DUY NHẤT cho một Model (tránh đụng unique index).
 * Nếu trùng, thêm hậu tố -2, -3... Bỏ qua chính document đang sửa (excludeId).
 */
export const generateUniqueSlug = async (Model, name, excludeId = null) => {
  const base = slugify(name) || "item";
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Model.exists(query);
    if (!exists) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
};
