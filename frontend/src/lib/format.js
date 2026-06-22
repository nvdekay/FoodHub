import { format } from "date-fns";
import { vi } from "date-fns/locale";

/** Định dạng tiền VND: 30000 -> "30.000đ" */
export const formatVND = (n) => `${Number(n ?? 0).toLocaleString("vi-VN")}đ`;

/** Định dạng ngày giờ theo locale Việt Nam. */
export const formatDate = (d, fmt = "dd/MM/yyyy HH:mm") =>
  d ? format(new Date(d), fmt, { locale: vi }) : "";

/** Chỉ ngày. */
export const formatDay = (d) => formatDate(d, "dd/MM/yyyy");
