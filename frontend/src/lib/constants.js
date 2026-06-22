// Enum đồng bộ với Backend (SRS — Phụ lục mục 9)

export const ROLES = { CUSTOMER: "customer", STAFF: "staff", ADMIN: "admin" };

export const ORDER_STATUS = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "cancelled",
];

// Các bước chuyển trạng thái chế biến hợp lệ (FE hiển thị nút đúng theo state machine)
export const NEXT_STATUS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready: ["completed"],
  completed: [],
  cancelled: [],
};

export const PAYMENT_STATUS = ["unpaid", "paid", "refunded"];
export const PAYMENT_METHOD = ["cash", "card", "ewallet"];
export const PAYMENT_METHOD_LABEL = {
  cash: "Tiền mặt",
  card: "Thẻ",
  ewallet: "Ví điện tử",
};

export const TABLE_STATUS = ["available", "occupied", "reserved"];
export const OPTION_TYPE = ["single", "multiple"];
