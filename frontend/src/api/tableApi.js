import axiosClient from "./axiosClient";

// Trả về mảng bàn (data)
export const getTables = (params) =>
  axiosClient.get("/tables", { params }).then((r) => r.data);

// Admin (F8)
export const createTable = (payload) =>
  axiosClient.post("/tables", payload).then((r) => r.data);
export const updateTable = (id, payload) =>
  axiosClient.put(`/tables/${id}`, payload).then((r) => r.data);
export const deleteTable = (id) =>
  axiosClient.delete(`/tables/${id}`).then((r) => r.data);
