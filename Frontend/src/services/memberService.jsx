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

  // POST sản phẩm đã được admin duyệt
  async postProduct(productId) {
    try {
      const response = await apiClient.post(`/products/post/seller?productId=${productId}`);
      return {
        success: true,
        data: response.data,
        message: "Đã POST sản phẩm thành công! Sản phẩm sẽ hiển thị trên trang chủ.",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Không thể POST sản phẩm",
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
          error.response?.data?.message || "Không thể lấy danh sách sản phẩm đã duyệt",
      };
    }
  },

  // Cập nhật avatar - upload lên Cloudinary trước, sau đó gọi API update
  async updateAvatar(file) {
    try {
      // Import dynamic để tránh circular dependency
      const { uploadToCloudinary, validateImageFile } = await import('./cloudinaryService');
      
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message,
        };
      }

      // Upload lên Cloudinary
      const imageUrl = await uploadToCloudinary(file);

      // Gọi API update avatar (theo endpoint của Backend: PUT /update/image/profile)
      // Backend endpoint nhận @RequestParam String img
      const response = await apiClient.put(`/update/image/profile?img=${encodeURIComponent(imageUrl)}`);
      
      return {
        success: true,
        data: response.data,
        imageUrl: imageUrl,
        message: response.data?.message || "Avatar đã được cập nhật thành công",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || 
          error.message || 
          "Không thể cập nhật avatar",
      };
    }
  },
};

export default memberService;
