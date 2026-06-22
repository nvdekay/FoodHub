import axiosClient from "./axiosClient";

// Tạo đơn (F3). Trả về đơn vừa tạo (data) — BE tính lại tổng tiền.
export const createOrder = (payload) =>
  axiosClient.post("/orders", payload).then((r) => r.data);

// Đơn của tôi — giữ NGUYÊN body { success, data, pagination } (F4)
export const getMyOrders = (params) => axiosClient.get("/orders/my", { params });

// Chi tiết / theo dõi đơn (data) (F4)
export const getOrder = (id) => axiosClient.get(`/orders/${id}`).then((r) => r.data);
