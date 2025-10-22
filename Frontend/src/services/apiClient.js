import axios from "axios";

// Ưu tiên .env, nếu rỗng thì fallback
const rawBase = import.meta.env.VITE_API_BASE_URL;
const fallbackBase = "http://localhost:3979/api"; // thêm /api luôn cho chắc
const API_BASE = (rawBase && rawBase.trim() ? rawBase : fallbackBase).replace(
  /\/$/,
  ""
);

if (!rawBase || !rawBase.trim()) {
  console.warn(
    "[apiClient] VITE_API_BASE_URL chưa được nạp. Đang dùng fallback:",
    API_BASE
  );
}

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

// helper: đọc token từ localStorage
const readToken = () => {
  const direct = localStorage.getItem("token");
  if (direct) return direct;
  try {
    const raw = localStorage.getItem("userData");
    const obj = raw ? JSON.parse(raw) : null;
    return obj?.token || obj?.data?.token || obj?.user?.token || null;
  } catch {
    return null;
  }
};

// helper: kiểm tra JWT exp
const isExpired = (jwt) => {
  try {
    const [, payload] = jwt.split(".");
    const data = JSON.parse(atob(payload));
    if (!data?.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return now >= data.exp;
  } catch {
    return false;
  }
};

api.interceptors.request.use((config) => {
  let token = readToken();
  if (token && isExpired(token)) {
    console.warn("[apiClient] JWT hết hạn → xoá & yêu cầu login lại");
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    token = null;
  }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Nếu server trả trang login (HTML) hoặc 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;
    const looksLikeHtml =
      typeof data === "string" && data.startsWith("<!DOCTYPE html>");
    if (status === 401 || looksLikeHtml) {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      // Đẩy về login nếu đang ở trang staff
      if (location.pathname.startsWith("/staff")) {
        location.replace("/login");
      }
    }
    return Promise.reject(err);
  }
);

export default api;
