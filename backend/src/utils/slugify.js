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
