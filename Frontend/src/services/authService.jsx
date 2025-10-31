import axios from "axios";
axios.defaults.withCredentials = true;

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
    // if (error.response?.status === 401) {
    //   localStorage.removeItem("token");
    //   window.location.href = "/login";
    // }
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
    } catch {
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

  /**
   * CHỨC NĂNG: Kiểm tra JWT token có còn hợp lệ không bằng cách gửi lên server verify
   * 
   * Khác với việc check expiry ở client (decode JWT), API này:
   * - Server verify chữ ký và tính hợp lệ của token
   * - Có thể phát hiện token đã bị revoke ở server
   * - Đảm bảo token thực sự còn valid trước khi thực hiện hành động quan trọng
   * 
   * @param {string} token - JWT token cần verify
   * @returns {Promise<{success: boolean, authenticated: boolean, data?: any, message?: string}>}
   */
  async introspectToken(token) {
    try {
      const response = await apiClient.post("/auth/introspect", { token });
      return {
        success: true,
        authenticated: response?.data?.data?.authenticated ?? false,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        authenticated: false,
        message: error.response?.data?.message || "Không thể verify token",
      };
    }
  },

  /**
   * CHỨC NĂNG: Tự động lấy token từ localStorage và verify với server
   * 
   * Tiện lợi hơn introspectToken vì tự động tìm token từ:
   * 1. localStorage.getItem("token")
   * 2. localStorage.getItem("userData") -> parse JSON -> lấy token
   * 
   * @returns {Promise<{success: boolean, authenticated: boolean, message?: string}>}
   */
  async verifyCurrentToken() {
    // Lấy token từ localStorage hoặc userData
    let token = localStorage.getItem("token");
    
    if (!token) {
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        token = userData?.token || userData?.data?.token || userData?.user?.token;
      } catch (e) {
        // Parse error
      }
    }

    if (!token) {
      return { success: false, authenticated: false, message: "Không tìm thấy token" };
    }

    return await this.introspectToken(token);
  },
};
export const googleAuthService = {
  // Bước 1: Redirect qua Google login
  loginWithGoogle() {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  },

  // Bước 2: Sau khi Google redirect về BE -> BE redirect về /oauth2/success
  async handleGoogleCallback() {
    try {
      const response = await apiClient.get("/oauth2/success");
      const data = response.data.data;

      // Lưu token vào localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Google login failed",
      };
    }
  },
};

export const facebookAuthService = {
  // Bước 1: Redirect qua Facebook login
  loginWithFacebook() {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/facebook`;
  },

  // Bước 2: Sau khi Facebook redirect về BE -> BE redirect về /oauth2/success
  async handleFacebookCallback() {
    try {
      const response = await apiClient.get("/oauth2/success");
      const data = response.data.data;

      // Lưu token vào localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Facebook login failed",
      };
    }
  },
};

export default authService;
export { apiClient };
