import { apiClient } from "./authService";

/**
 * Complaint Service
 * Dịch vụ quản lý complaints/khiếu nại
 */
const complaintService = {
  /**
   * Seller xem tất cả complaints về mình
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  async getComplaintsAboutMe() {
    try {
      const response = await apiClient.get("/api/complaints/complaints-about-me");
      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data: Array.isArray(data) ? data : [],
        message: response?.data?.message || "Lấy danh sách complaints thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage =
        error?.response?.data?.message || error?.message;
      return {
        success: false,
        data: [],
        message: `Lỗi tải complaints (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  /**
   * Buyer xem tất cả complaints của mình
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  async getMyComplaints() {
    try {
      const response = await apiClient.get("/api/complaints/my-complaints");
      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data: Array.isArray(data) ? data : [],
        message: response?.data?.message || "Lấy danh sách complaints thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage =
        error?.response?.data?.message || error?.message;
      return {
        success: false,
        data: [],
        message: `Lỗi tải complaints (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  /**
   * Lấy chi tiết một complaint
   * @param {number} complaintId - ID của complaint
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  async getComplaintById(complaintId) {
    try {
      const response = await apiClient.get(`/api/complaints/${complaintId}`);
      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data: data,
        message: response?.data?.message || "Lấy chi tiết complaint thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage =
        error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Lỗi tải complaint (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },
};

export default complaintService;

