import axiosClient from "./axiosClient";

// Trả về NGUYÊN body { success, data, pagination }
export const getProducts = (params) => axiosClient.get("/products", { params });

// Chi tiết món (data)
export const getProduct = (id) => axiosClient.get(`/products/${id}`).then((r) => r.data);

// Admin (F7)
export const createProduct = (payload) =>
  axiosClient.post("/products", payload).then((r) => r.data);
export const updateProduct = (id, payload) =>
  axiosClient.put(`/products/${id}`, payload).then((r) => r.data);
export const deleteProduct = (id) =>
  axiosClient.delete(`/products/${id}`).then((r) => r.data);
