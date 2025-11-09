import apiClient from "./apiClient";

/**
 * Role Service
 * Dịch vụ quản lý Roles và Permissions
 */
const roleService = {
  /**
   * Lấy tất cả roles
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  async getAllRoles() {
    try {
      const response = await apiClient.get("/roles/roles");
      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data: Array.isArray(data) ? data : [],
        message: response?.data?.message || "Lấy danh sách roles thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      return {
        success: false,
        data: [],
        message: `Lỗi tải roles (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  /**
   * Tạo role mới
   * @param {Object} roleData - { name, description, permissions }
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  async createRole(roleData) {
    try {
      const response = await apiClient.post("/roles/create-role", roleData);
      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data: data,
        message: response?.data?.message || "Tạo role thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Lỗi tạo role (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  /**
   * Xóa role
   * @param {string} roleName - Tên role
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async deleteRole(roleName) {
    try {
      await apiClient.delete(`/roles/${roleName}`);
      return {
        success: true,
        message: "Xóa role thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Lỗi xóa role (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  /**
   * Thêm permission vào role
   * @param {string} roleName - Tên role
   * @param {string} permissionName - Tên permission
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async addPermissionToRole(roleName, permissionName) {
    try {
      const response = await apiClient.post("/admin/add/role", {
        roleName: roleName,
        permissionName: permissionName,
      });
      return {
        success: true,
        message: response?.data?.message || "Thêm permission vào role thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Lỗi thêm permission (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  /**
   * Xóa permission khỏi role
   * @param {string} roleName - Tên role
   * @param {string} permissionName - Tên permission
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async removePermissionFromRole(roleName, permissionName) {
    try {
      const response = await apiClient.delete("/admin/remove/role", {
        data: {
          roleName: roleName,
          permissionName: permissionName,
        },
      });
      return {
        success: true,
        message: response?.data?.message || "Xóa permission khỏi role thành công",
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

export default roleService;

