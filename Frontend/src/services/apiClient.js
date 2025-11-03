import axios from "axios";

// CONFIGURATION

const API_BASE = "http://localhost:3979";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

// TOKEN MANAGEMENT

/**
 * Đọc JWT token từ localStorage
 * Ưu tiên: userData > token trực tiếp
 */
const readToken = () => {
  try {
    // Ưu tiên JWT token từ Backend (có trong userData)
    const raw = localStorage.getItem("userData");
    const obj = raw ? JSON.parse(raw) : null;
    const jwtToken = obj?.token || obj?.data?.token || obj?.user?.token;
    if (jwtToken) {
      return jwtToken;
    }
  } catch {
    // Lỗi parse userData, bỏ qua
  }

  // Fallback: token trực tiếp từ localStorage
  const direct = localStorage.getItem("token");
  if (direct) {
    return direct;
  }

  return null;
};

/**
 * Kiểm tra JWT token có hết hạn không
 */
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

/**
 * Refresh JWT token
 */
const refreshToken = async () => {
  try {
    const refreshTokenValue = localStorage.getItem("refreshToken");
    if (!refreshTokenValue) return null;

    const refreshResponse = await axios.post(`${API_BASE}/auth/refresh`, {
      refreshToken: refreshTokenValue,
    });

    if (refreshResponse.data && refreshResponse.data.token) {
      const newToken = refreshResponse.data.token;
      localStorage.setItem("token", newToken);

      // Cập nhật userData với token mới
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          user.token = newToken;
          localStorage.setItem("userData", JSON.stringify(user));
        } catch (e) {
          // Không thể cập nhật userData, bỏ qua
        }
      }

      return newToken;
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
  }

  return null;
};

// REQUEST INTERCEPTOR

/**
 * Interceptor xử lý request trước khi gửi
 * - Thêm Authorization header
 * - Kiểm tra token hết hạn
 */
api.interceptors.request.use((config) => {
  let token = readToken();

  // Nếu token hết hạn, xóa và yêu cầu login lại
  if (token && isExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    token = null;
  }

  // Thêm Authorization header nếu có token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("🔑 Token added to request:", config.url);
  } else {
    console.warn("⚠️ No token found for request:", config.url);
  }

  return config;
});

// RESPONSE INTERCEPTOR

/**
 * Interceptor xử lý response sau khi nhận
 * - Xử lý lỗi 401 (Unauthorized)
 * - Tự động refresh token
 * - Retry request với token mới
 */
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;
    const looksLikeHtml =
      typeof data === "string" && data.startsWith("<!DOCTYPE html>");

    // Xử lý lỗi 401 - thử refresh token
    if (status === 401 && !err.config._retry) {
      err.config._retry = true;

      const newToken = await refreshToken();
      if (newToken) {
        // Retry request với token mới
        err.config.headers.Authorization = `Bearer ${newToken}`;
        return api(err.config);
      }

      // Nếu refresh thất bại, xóa auth data
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("refreshToken");

      // Redirect đến login nếu đang ở staff page
      if (location.pathname.startsWith("/staff")) {
        location.replace("/login");
      }
    }
    // Xử lý lỗi 401 khác hoặc HTML response
    else if (status === 401 || looksLikeHtml) {
      // Chỉ xóa token nếu không phải ở admin page (tránh logout khi đang ở admin)
      if (!window.location.pathname.startsWith("/admin")) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        localStorage.removeItem("refreshToken");

        if (window.location.pathname.startsWith("/staff")) {
          window.location.replace("/login");
        }
      }
    }

    return Promise.reject(err);
  }
);

// EXPORT

export default api;
