// src/services/apiClient.js
import axios from "axios";

// Force baseURL to be correct (without /api prefix)
const API_BASE = "http://localhost:3979";

console.log("[apiClient] Base URL =", API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

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
      if (location.pathname.startsWith("/staff")) {
        location.replace("/login");
      }
    }
    return Promise.reject(err);
  }
);

export default api;
