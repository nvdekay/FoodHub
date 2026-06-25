import { format } from "date-fns";
import { vi } from "date-fns/locale";

/** Định dạng tiền VND: 30000 -> "30.000đ". Giá trị NaN/không hợp lệ hiển thị "0đ". */
export const formatVND = (n) => {
  const v = Number(n);
  return `${(Number.isFinite(v) ? v : 0).toLocaleString("vi-VN")}đ`;
};

/** Định dạng ngày giờ theo locale Việt Nam. Ngày không hợp lệ trả "" thay vì throw. */
export const formatDate = (d, fmt = "dd/MM/yyyy HH:mm") => {
  if (!d) return "";
  const date = new Date(d);
  // date-fns `format` ném RangeError với Invalid Date — chặn trước để khỏi vỡ cả subtree.
  if (Number.isNaN(date.getTime())) return "";
  return format(date, fmt, { locale: vi });
};

/** Chỉ ngày. */
export const formatDay = (d) => formatDate(d, "dd/MM/yyyy");
