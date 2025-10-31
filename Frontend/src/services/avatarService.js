import axios from "axios";

const API_BASE_URL = "http://localhost:3979";

// Tạo instance axios với config mặc định cho API calls
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

/**
 * Validate file ảnh trước khi upload
 * @param {File} file - File cần validate
 * @returns {{valid: boolean, message?: string}}
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, message: 'Vui lòng chọn file' };
  }

  // Kiểm tra loại file
  if (!file.type.startsWith('image/')) {
    return { valid: false, message: 'Chỉ được upload file ảnh!' };
  }

  // Kiểm tra kích thước (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, message: 'Kích thước file không được vượt quá 5MB!' };
  }

  return { valid: true };
};

/**
 * Upload avatar - gửi MultipartFile trực tiếp lên BE, BE sẽ upload lên Cloudinary
 * @param {File} file - File ảnh cần upload
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export const uploadAvatar = async (file) => {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.message,
      };
    }

    // Tạo FormData để gửi file lên BE
    const formData = new FormData();
    formData.append('file', file);

    // Gọi API update avatar - BE nhận @RequestParam MultipartFile file và tự upload lên Cloudinary
    // Backend endpoint: PUT /users/update/image/profile
    // Backend cần được sửa để nhận MultipartFile file (giống registerUser)
    const response = await apiClient.put('/users/update/image/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return {
      success: true,
      data: response.data,
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
};

export default {
  validateImageFile,
  uploadAvatar,
};

