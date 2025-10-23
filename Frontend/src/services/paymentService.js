// src/services/paymentService.js
import apiClient from "./apiClient";

export const paymentService = {
  // Nạp tiền vào ví
  async rechargeWallet(userId) {
    try {
      const response = await apiClient.post(
        `/api/payment/recharge?userId=${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error recharging wallet:", error);
      throw error;
    }
  },

  // Mua gói dịch vụ
  async buyPackage(userId, packageId) {
    try {
      const response = await apiClient.post("/api/payment/buy-package", {
        userId,
        packageId,
      });
      return response.data;
    } catch (error) {
      console.error("Error buying package:", error);
      throw error;
    }
  },

  // Lấy gói hiện tại đang dùng
  async getCurrentPackage() {
    try {
      const response = await apiClient.get("/api/user/package/current");
      return response.data;
    } catch (error) {
      console.error("Error getting current package:", error);
      // Return mock data for testing
      return { data: null };
    }
  },

  // Lấy lịch sử mua gói
  async getPackageHistory() {
    try {
      const response = await apiClient.get("/api/user/package/history");
      return response.data;
    } catch (error) {
      console.error("Error getting package history:", error);
      // Return mock data for testing
      return { data: [] };
    }
  },

  // Lấy lịch sử giao dịch ví
  async getWalletTransactions() {
    try {
      const response = await apiClient.get("/users/walletTransaction");
      return response.data;
    } catch (error) {
      console.error("Error getting wallet transactions:", error);
      // Return mock data for testing
      return { data: [] };
    }
  },

  // Lấy lịch sử mua gói (transaction)
  async getTransactionHistory() {
    try {
      const response = await apiClient.get("/users/transaction");
      return response.data;
    } catch (error) {
      console.error("Error getting transaction history:", error);
      throw error;
    }
  },
};
