import apiClient from "./apiClient";

/**
 * Permission Service
 * Dịch vụ quản lý Permissions
 */
const permissionService = {
  /**
   * Lấy tất cả permissions
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  async getAllPermissions() {
    try {
      const response = await apiClient.get("/permissions/permissions");
      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data: Array.isArray(data) ? data : [],
        message: response?.data?.message || "Lấy danh sách permissions thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      return {
        success: false,
        data: [],
        message: `Lỗi tải permissions (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  /**
   * Tạo permission mới
   * @param {Object} permissionData - { name, description }
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  async createPermission(permissionData) {
    try {
      const response = await apiClient.post("/permissions/create-permission", permissionData);
      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data: data,
        message: response?.data?.message || "Tạo permission thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Lỗi tạo permission (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  /**
   * Xóa permission
   * @param {string} permissionName - Tên permission
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async deletePermission(permissionName) {
    try {
      await apiClient.delete(`/permissions/${permissionName}`);
      return {
        success: true,
        message: "Xóa permission thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Lỗi xóa permission (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },
};

export default permissionService;

