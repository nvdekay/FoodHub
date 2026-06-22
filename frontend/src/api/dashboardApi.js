import axiosClient from "./axiosClient";

// Thống kê tổng quan (data)
export const getSummary = () => axiosClient.get("/dashboard/summary").then((r) => r.data);

// Món bán chạy (data)
export const getTopProducts = (params) =>
  axiosClient.get("/dashboard/top-products", { params }).then((r) => r.data);
