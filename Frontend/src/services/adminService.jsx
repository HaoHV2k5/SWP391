import { apiClient } from "./authService";

const adminService = {
  // Lấy danh sách tất cả users
  async getAllUsers() {
    try {
      const response = await apiClient.get("/admin/users");
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Tạo user mới
  async createUser(userData) {
    try {
      const response = await apiClient.post("/admin/users", userData);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  // Khóa user
  async lockUser(userId) {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/lock`);
      return response.data;
    } catch (error) {
      console.error("Error locking user:", error);
      throw error;
    }
  },

  // Mở khóa user
  async unlockUser(userId) {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/unlock`);
      return response.data;
    } catch (error) {
      console.error("Error unlocking user:", error);
      throw error;
    }
  },
};

export default adminService;
