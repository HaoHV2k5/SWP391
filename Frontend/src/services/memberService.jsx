import axios from "axios";

const API_BASE_URL = "http://localhost:3979";

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

export const memberService = {
  // Lấy thông tin profile của member hiện tại
  async getMemberProfile() {
    try {
      const response = await apiClient.get("/users/me");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Không thể lấy thông tin profile",
      };
    }
  },

  // Cập nhật thông tin profile của member
  async updateMemberProfile(profileData) {
    try {
      const response = await apiClient.put("/users/update", profileData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Không thể cập nhật thông tin profile",
      };
    }
  },

  // (Deprecated) Cập nhật avatar - đã loại bỏ, dùng chỉnh sửa hồ sơ tổng nếu cần

  // Đổi mật khẩu
  async changePassword(passwordData) {
    try {
      const response = await apiClient.post("/users/me/change-password", passwordData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Không thể đổi mật khẩu",
      };
    }
  },
};

export default memberService;
