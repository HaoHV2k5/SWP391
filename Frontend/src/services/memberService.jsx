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
          error.response?.data?.message ||
          "Không thể cập nhật thông tin profile",
      };
    }
  },

  // Đổi mật khẩu (khi đã đăng nhập)
  async changePassword(passwordData) {
    try {
      // BE endpoint: PUT /users/change/password
      // Request body: { password: string } (chỉ cần password mới, tối thiểu 6 ký tự)
      const response = await apiClient.put(
        "/users/change/password",
        { password: passwordData.password || passwordData.newPassword }
      );
      return {
        success: true,
        data: response.data,
        message: response.data?.message || "Đổi mật khẩu thành công",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Không thể đổi mật khẩu",
        status: error.response?.status,
      };
    }
  },

  // Quên mật khẩu - Gửi OTP qua email
  async forgotPassword(email) {
    try {
      // BE endpoint: POST /users/forgot-password
      // Request body: { email: string }
      // Note: Endpoint này KHÔNG cần authentication (public endpoint)
      console.log('📧 Calling /users/forgot-password with email:', email);
      
      const response = await apiClient.post("/users/forgot-password", {
        email: email,
      });
      
      console.log('📧 Response from backend:', response.data);
      
      // Backend trả về: ApiResponse<String> với message và data (email)
      return {
        success: true,
        data: response.data,
        message: response.data?.message || "Đã gửi OTP để xác thực",
        email: response.data?.data || email, // Email được trả về từ BE
      };
    } catch (error) {
      console.error('❌ forgotPassword error:', {
        error,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Xử lý các trường hợp lỗi cụ thể
      let errorMessage = "Không thể gửi OTP. Vui lòng kiểm tra email và thử lại.";
      
      if (error.response?.status === 404) {
        errorMessage = "Email không tồn tại trong hệ thống.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || "Email không hợp lệ.";
      } else if (error.response?.status === 500) {
        errorMessage = "Lỗi server. Vui lòng thử lại sau.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
        status: error.response?.status,
        error: error.response?.data,
      };
    }
  },

  // Reset mật khẩu sau khi có OTP
  async resetPassword(email, newPassword, otp) {
    try {
      // BE endpoint: POST /users/reset-password
      // Request body: { email: string, newPassword: string, otp: string }
      // newPassword tối thiểu 6 ký tự
      const response = await apiClient.post("/users/reset-password", {
        email: email,
        newPassword: newPassword,
        otp: otp,
      });
      return {
        success: response.data?.data?.success || true,
        data: response.data,
        message:
          response.data?.message || "Reset mật khẩu thành công",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Không thể reset mật khẩu. Vui lòng kiểm tra OTP và thử lại.",
        status: error.response?.status,
      };
    }
  },

  // Nhập số điện thoại sau khi login Facebook
  async inputPhoneAfterFacebook(phone, email) {
    try {
      // BE endpoint: POST /users/phone/input
      // Request body: { phone: string, email: string }
      // Phone format: ^(84|0[35789])[0-9]{8}\b (ví dụ: 0987654321, 84987654321)
      const response = await apiClient.post("/users/phone/input", {
        phone: phone,
        email: email,
      });
      return {
        success: true,
        data: response.data?.data || response.data,
        message: "Cập nhật số điện thoại thành công",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Không thể cập nhật số điện thoại. Vui lòng kiểm tra định dạng số điện thoại.",
        status: error.response?.status,
      };
    }
  },

  // POST sản phẩm đã được admin duyệt
  async postProduct(productId) {
    try {
      const response = await apiClient.post(
        `/products/post/seller?productId=${productId}`
      );
      return {
        success: true,
        data: response.data,
        message:
          "Đã POST sản phẩm thành công! Sản phẩm sẽ hiển thị trên trang chủ.",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Không thể POST sản phẩm",
      };
    }
  },

  // Lấy danh sách sản phẩm đã được admin approve của seller
  async getApprovedProducts(sellerId) {
    try {
      const response = await apiClient.get(`/products/seller/${sellerId}`);
      return {
        success: true,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Không thể lấy danh sách sản phẩm đã duyệt",
      };
    }
  },

  // Cập nhật avatar - gọi avatarService để xử lý
  async updateAvatar(file) {
    const { uploadAvatar } = await import("./avatarService");
    return await uploadAvatar(file);
  },
  async getBoughtOrders(buyerId) {
    try {
      if (!buyerId) {
        return {
          success: false,
          message: "Không thể xác định user ID",
          data: [],
        };
      }
      const response = await apiClient.get(`/order/get-ordered/${buyerId}`);
      return {
        success: true,
        message: response.data?.message || "OK",
        data: response.data?.data || [], // map đúng theo response
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Không thể lấy danh sách đơn đã mua",
        data: [],
      };
    }
  },
};

export default memberService;
