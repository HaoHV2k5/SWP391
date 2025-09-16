import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

// Tạo instance axios với config mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Đăng nhập
  async login(credentials) {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Đăng nhập thất bại",
      };
    }
  },

  // Đăng ký
  async register(userData) {
    try {
      const response = await apiClient.post("/auth/register", userData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Đăng ký thất bại",
      };
    }
  },

  // Lấy thông tin user hiện tại
  async getCurrentUser() {
    try {
      const response = await apiClient.get("/auth/me");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Không thể lấy thông tin user",
      };
    }
  },

  // Đăng xuất
  async logout() {
    try {
      await apiClient.post("/auth/logout");
      localStorage.removeItem("token");
      return { success: true };
    } catch (error) {
      // Vẫn xóa token local dù API call thất bại
      localStorage.removeItem("token");
      return { success: true };
    }
  },

  // Refresh token
  async refreshToken() {
    try {
      const response = await apiClient.post("/auth/refresh");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Không thể refresh token",
      };
    }
  },
};

export default authService;
