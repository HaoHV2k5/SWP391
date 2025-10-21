// src/services/apiClient.js
import axios from "axios";

// Ưu tiên .env, nếu rỗng thì fallback để tránh gọi nhầm Vite
const rawBase = import.meta.env.VITE_API_BASE_URL;
const fallbackBase = "http://localhost:3979";
const API_BASE = (rawBase && rawBase.trim() ? rawBase : fallbackBase).replace(
  /\/$/,
  ""
);

if (!rawBase || !rawBase.trim()) {
  // hiển thị 1 lần cho dev biết đang dùng fallback
  // eslint-disable-next-line no-console
  console.warn(
    "[apiClient] VITE_API_BASE_URL chưa được nạp. Đang dùng fallback:",
    API_BASE
  );
}

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("userData");
  const storedToken = localStorage.getItem("token");
  let token = storedToken;

  if (!token && raw) {
    try {
      const parsed = JSON.parse(raw);
      token = parsed?.token || parsed?.data?.token || parsed?.user?.token;
    } catch (e) {
      // Ignore JSON parse errors but log for debugging
      // eslint-disable-next-line no-console
      console.debug("[apiClient] Failed to parse stored userData:", e);
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
