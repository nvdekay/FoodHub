import axiosClient from "./axiosClient";

export const getMe = () => axiosClient.get("/users/me").then((r) => r.data);

export const updateMe = (payload) =>
  axiosClient.put("/users/me", payload).then((r) => r.data);

// Admin
export const listUsers = (params) =>
  axiosClient.get("/users", { params }).then((r) => r);

export const updateUserStatus = (id, payload) =>
  axiosClient.patch(`/users/${id}/status`, payload).then((r) => r.data);
