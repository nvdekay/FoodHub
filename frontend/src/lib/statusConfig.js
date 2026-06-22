// Map trạng thái -> nhãn tiếng Việt + class màu cho StatusPill

export const ORDER_STATUS_CONFIG = {
  pending: { label: "Chờ xác nhận", className: "bg-gray-100 text-gray-700" },
  confirmed: { label: "Đã xác nhận", className: "bg-blue-100 text-blue-700" },
  preparing: { label: "Đang làm", className: "bg-amber-100 text-amber-700" },
  ready: { label: "Sẵn sàng", className: "bg-purple-100 text-purple-700" },
  completed: { label: "Hoàn tất", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã huỷ", className: "bg-red-100 text-red-700" },
};

export const PAYMENT_STATUS_CONFIG = {
  unpaid: { label: "Chưa thanh toán", className: "bg-gray-100 text-gray-700" },
  paid: { label: "Đã thanh toán", className: "bg-green-100 text-green-700" },
  refunded: { label: "Đã hoàn tiền", className: "bg-orange-100 text-orange-700" },
};

export const TABLE_STATUS_CONFIG = {
  available: { label: "Trống", className: "bg-green-100 text-green-700" },
  occupied: { label: "Đang dùng", className: "bg-red-100 text-red-700" },
  reserved: { label: "Đã đặt", className: "bg-amber-100 text-amber-700" },
};
