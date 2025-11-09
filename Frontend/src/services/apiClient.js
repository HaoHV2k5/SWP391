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
 * Backend trả về: ApiResponse<RefreshResponse> = {code: 1000, data: {token, refreshToken}}
 */
const refreshToken = async () => {
  try {
    const refreshTokenValue = localStorage.getItem("refreshToken");
    if (!refreshTokenValue) {
      console.warn("⚠️ No refreshToken found in localStorage");
      return null;
    }

    console.log("🔄 Attempting to refresh token...");
    const refreshResponse = await axios.post(`${API_BASE}/auth/refresh`, {
      refreshToken: refreshTokenValue,
    });

    // Backend trả về: {code: 1000, data: {token, refreshToken}}
    const responseData = refreshResponse.data?.data || refreshResponse.data;
    
    if (responseData && responseData.token) {
      const newToken = responseData.token;
      const newRefreshToken = responseData.refreshToken || refreshTokenValue; // Fallback về refreshToken cũ nếu backend không trả về mới
      
      console.log("✅ Token refresh successful, updating localStorage...");
      
      // Cập nhật token và refreshToken mới
      localStorage.setItem("token", newToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      // Cập nhật userData với token mới
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          user.token = newToken;
          localStorage.setItem("userData", JSON.stringify(user));
          console.log("✅ Updated userData with new token");
        } catch (e) {
          console.error("❌ Error updating userData:", e);
        }
      }

      return newToken;
    } else {
      console.warn("⚠️ Invalid refresh response format:", refreshResponse.data);
    }
  } catch (error) {
    console.error("❌ Token refresh failed:", error);
    console.error("❌ Error details:", error.response?.data || error.message);
  }

  return null;
};

// REQUEST INTERCEPTOR

/**
 * Interceptor xử lý request trước khi gửi
 * - Thêm Authorization header
 * - Kiểm tra token hết hạn (nhưng không xóa nếu có refreshToken - để response interceptor xử lý)
 */
api.interceptors.request.use((config) => {
  let token = readToken();

  // Nếu token hết hạn, kiểm tra xem có refreshToken không
  if (token && isExpired(token)) {
    const refreshTokenValue = localStorage.getItem("refreshToken");
    
    if (refreshTokenValue) {
      // Có refreshToken → vẫn gửi token hết hạn đi
      // Backend sẽ trả 401, response interceptor sẽ tự động refresh và retry
      console.log("⚠️ Token expired but refreshToken exists, sending request (will auto-refresh on 401)");
    } else {
      // Không có refreshToken → xóa token và không gửi request với Authorization
      console.warn("⚠️ Token expired and no refreshToken, removing auth data");
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      token = null;
    }
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
