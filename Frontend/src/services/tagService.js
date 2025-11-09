import { apiClient } from "./authService";

/**
 * Tag Service
 * Dịch vụ quản lý Tags (phân loại sản phẩm)
 */
const tagService = {
  /**
   * Tạo tag mới
   * @param {Object} tagData - { slugs, displayName, brand, model, yearModel, type }
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  async createTag(tagData) {
    try {
      const response = await apiClient.post("/tag/create", tagData);
      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data: data,
        message: response?.data?.message || "Tạo tag thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      
      let errorMessage = "Không thể tạo tag";
      if (status === 401) {
        errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại";
      } else if (status === 403) {
        errorMessage = "Bạn không có quyền tạo tag";
      } else if (status === 400) {
        errorMessage = backendMessage || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại";
      } else if (status >= 500) {
        errorMessage = "Hệ thống đang gặp sự cố. Vui lòng thử lại sau";
      } else if (!status) {
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet";
      }
      
      return {
        success: false,
        message: errorMessage,
        status: status,
      };
    }
  },
};

export default tagService;

