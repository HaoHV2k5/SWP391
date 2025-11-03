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

  // Xóa user
  async deleteUser(userId) {
    try {
      const response = await apiClient.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  // Cập nhật user
  async updateUser(userId, userData) {
    try {
      const response = await apiClient.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  // Revenue APIs
  async getAllWalletTransactions() {
    try {
      const response = await apiClient.get("/api/admin/wallettransactions");
      return response.data;
    } catch (error) {
      console.error("Error fetching wallet transactions:", error);
      throw error;
    }
  },

  async getRechargeTransactions() {
    try {
      const response = await apiClient.get("/api/admin/wallettransactions/recharge");
      return response.data;
    } catch (error) {
      console.error("Error fetching recharge transactions:", error);
      throw error;
    }
  },

  async getUserWalletTransactions(userId) {
    try {
      const response = await apiClient.get(`/api/admin/user/walletTransaction?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user wallet transactions:", error);
      throw error;
    }
  },

  async getUserTransactions(userId) {
    try {
      const response = await apiClient.get(`/api/admin/user/transaction?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      throw error;
    }
  },

  async getUserPackages(userId) {
    try {
      const response = await apiClient.get(`/api/admin/user/transaction/package?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user packages:", error);
      throw error;
    }
  },

  async getTransactionHistory() {
    try {
      const response = await apiClient.get("/api/admin/transaction/history");
      return response.data;
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      throw error;
    }
  },

  async getAdminBalance() {
    try {
      const response = await apiClient.get("/api/admin/balance");
      return response.data;
    } catch (error) {
      console.error("Error fetching admin balance:", error);
      throw error;
    }
  },
};

export default adminService;
