import axiosClient from "./axiosClient";

// Trả về mảng danh mục (data)
export const getCategories = (params) =>
  axiosClient.get("/categories", { params }).then((r) => r.data);

// Admin (F7)
export const createCategory = (payload) =>
  axiosClient.post("/categories", payload).then((r) => r.data);
export const updateCategory = (id, payload) =>
  axiosClient.put(`/categories/${id}`, payload).then((r) => r.data);
export const deleteCategory = (id) =>
  axiosClient.delete(`/categories/${id}`).then((r) => r.data);
