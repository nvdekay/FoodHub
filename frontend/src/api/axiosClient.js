import axios from "axios";

const TOKEN_KEY = "foodhub_token";
const USER_KEY = "foodhub_user";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5050/api",
  headers: { "Content-Type": "application/json" },
});

// Gắn token vào mỗi request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Bóc body chuẩn { success, data, ... }; chuẩn hoá lỗi; tự logout khi 401
axiosClient.interceptors.response.use(
  (res) => res.data,
  (error) => {
    const data = error.response?.data;
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject({
      message: data?.message || error.message || "Có lỗi xảy ra",
      errorCode: data?.errorCode || "NETWORK_ERROR",
      details: data?.details,
      status,
    });
  }
);

export default axiosClient;
