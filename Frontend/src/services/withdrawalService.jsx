import { apiClient } from "./authService";

const withdrawalService = {
  // Tạo yêu cầu rút tiền
  async createWithdrawalRequest(userId, requestData) {
    try {
      const response = await apiClient.post(
        `/api/withdrawal/request?userId=${userId}`,
        requestData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating withdrawal request:", error);
      throw error;
    }
  },

  // Xác nhận yêu cầu rút tiền (Admin)
  async confirmWithdrawal(withdrawalId, adminId) {
    try {
      const response = await apiClient.put(
        `/api/withdrawal/${withdrawalId}/confirm?adminId=${adminId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error confirming withdrawal:", error);
      throw error;
    }
  },

  // Từ chối yêu cầu rút tiền (Admin)
  async rejectWithdrawal(withdrawalId, adminId, reason) {
    try {
      const response = await apiClient.put(
        `/api/withdrawal/${withdrawalId}/reject?adminId=${adminId}&reason=${encodeURIComponent(reason || "Không đủ điều kiện")}`
      );
      return response.data;
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      throw error;
    }
  },

  // Hủy yêu cầu rút tiền (User)
  async cancelWithdrawal(withdrawalId, userId) {
    try {
      const response = await apiClient.put(
        `/api/withdrawal/${withdrawalId}/cancel?userId=${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error canceling withdrawal:", error);
      throw error;
    }
  },

  // Lấy danh sách yêu cầu rút tiền của user
  async getUserWithdrawals(userId) {
    try {
      const response = await apiClient.get(
        `/api/withdrawal/my-requests?userId=${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user withdrawals:", error);
      throw error;
    }
  },

  // Lấy danh sách tất cả yêu cầu rút tiền (Admin)
  async getAllWithdrawals() {
    try {
      const response = await apiClient.get("/api/withdrawal/all");
      return response.data;
    } catch (error) {
      console.error("Error fetching all withdrawals:", error);
      throw error;
    }
  },

  // Lấy chi tiết yêu cầu rút tiền
  async getWithdrawalDetail(withdrawalId) {
    try {
      const response = await apiClient.get(`/api/withdrawal/${withdrawalId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching withdrawal detail:", error);
      throw error;
    }
  },

  // Lấy danh sách yêu cầu rút tiền theo trạng thái (Admin)
  async getWithdrawalsByStatus(status) {
    try {
      const response = await apiClient.get(`/api/withdrawal/status/${status}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching withdrawals by status:", error);
      throw error;
    }
  },
};

export default withdrawalService;
