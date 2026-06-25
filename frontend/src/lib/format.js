import { format } from "date-fns";
import { vi } from "date-fns/locale";

/** Định dạng tiền VND: 30000 -> "30.000đ". Giá trị NaN/không hợp lệ hiển thị "0đ". */
export const formatVND = (n) => {
  const v = Number(n);
  return `${(Number.isFinite(v) ? v : 0).toLocaleString("vi-VN")}đ`;
};

/** Định dạng ngày giờ theo locale Việt Nam. */
export const formatDate = (d, fmt = "dd/MM/yyyy HH:mm") =>
  d ? format(new Date(d), fmt, { locale: vi }) : "";

/** Chỉ ngày. */
export const formatDay = (d) => formatDate(d, "dd/MM/yyyy");
