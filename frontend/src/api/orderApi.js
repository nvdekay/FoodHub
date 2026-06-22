import axiosClient from "./axiosClient";

// Tạo đơn (F3). Trả về đơn vừa tạo (data) — BE tính lại tổng tiền.
export const createOrder = (payload) =>
  axiosClient.post("/orders", payload).then((r) => r.data);

// Đơn của tôi — giữ NGUYÊN body { success, data, pagination } (F4)
export const getMyOrders = (params) => axiosClient.get("/orders/my", { params });

// Chi tiết / theo dõi đơn (data) (F4)
export const getOrder = (id) => axiosClient.get(`/orders/${id}`).then((r) => r.data);

// Sửa đơn — chỉ khi pending (F4)
export const updateOrder = (id, payload) =>
  axiosClient.put(`/orders/${id}`, payload).then((r) => r.data);

// Khách tự huỷ đơn — chỉ khi pending (F4)
export const cancelOrder = (id) => axiosClient.delete(`/orders/${id}`).then((r) => r.data);

/* ===== Phía nhân viên (F6) ===== */

// Danh sách tất cả đơn — giữ NGUYÊN body { success, data, pagination }
export const listOrders = (params) => axiosClient.get("/orders", { params });

// Xác nhận đơn (pending->confirmed), kèm giảm giá tuỳ chọn
export const confirmOrder = (id, payload = {}) =>
  axiosClient.patch(`/orders/${id}/confirm`, payload).then((r) => r.data);

// Cập nhật trạng thái chế biến (preparing/ready/completed)
export const setOrderStatus = (id, status) =>
  axiosClient.patch(`/orders/${id}/status`, { status }).then((r) => r.data);

// Nhân viên huỷ đơn (kèm lý do)
export const cancelOrderByStaff = (id, cancelReason) =>
  axiosClient.patch(`/orders/${id}/cancel`, { cancelReason }).then((r) => r.data);

// Cập nhật thanh toán (paymentStatus + phương thức)
export const updatePayment = (id, payload) =>
  axiosClient.patch(`/orders/${id}/payment`, payload).then((r) => r.data);
