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

  /**
   * Admin/Staff lấy tất cả complaints
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  async getAllComplaints() {
    try {
      const response = await apiClient.get("/api/complaints/admin/all");
      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data: Array.isArray(data) ? data : [],
        message: response?.data?.message || "Lấy tất cả complaints thành công",
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
   * Buyer tạo complaint mới
   * @param {Object} complaintData - Dữ liệu complaint {contractId, title, description, category, evidenceImages}
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  async createComplaint(complaintData) {
    try {
      const formData = new FormData();
      formData.append("contractId", complaintData.contractId);
      formData.append("title", complaintData.title);
      formData.append("description", complaintData.description);
      formData.append("category", complaintData.category);
      
      // Append evidence images nếu có
      if (complaintData.evidenceImages && complaintData.evidenceImages.length > 0) {
        complaintData.evidenceImages.forEach((file, index) => {
          formData.append("evidenceImages", file);
        });
      }

      const response = await apiClient.post("/api/complaints", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data: data,
        message: response?.data?.message || "Tạo complaint thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage =
        error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Lỗi tạo complaint (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  /**
   * Kiểm tra buyer và seller đã có giao dịch hoàn thành
   * @param {number} sellerId - ID của seller
   * @returns {Promise<{success: boolean, data?: boolean, message?: string}>}
   */
  async checkCompletedTransaction(sellerId) {
    try {
      const response = await apiClient.get(`/api/complaints/check-transaction/${sellerId}`);
      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data: data,
        message: response?.data?.message || "Kiểm tra giao dịch thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage =
        error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Lỗi kiểm tra giao dịch (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  /**
   * Admin/Staff bắt đầu xem xét complaint
   * @param {number} complaintId - ID của complaint
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  async startReview(complaintId) {
    try {
      const response = await apiClient.put(`/api/complaints/admin/${complaintId}/start-review`);
      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data: data,
        message: response?.data?.message || "Bắt đầu xem xét thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage =
        error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Lỗi bắt đầu xem xét (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  /**
   * Admin/Staff giải quyết complaint
   * @param {number} complaintId - ID của complaint
   * @param {Object} resolutionData - Dữ liệu giải quyết {status, staffNotes}
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  async resolveComplaint(complaintId, resolutionData) {
    try {
      const response = await apiClient.put(`/api/complaints/admin/${complaintId}/resolve`, resolutionData);
      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data: data,
        message: response?.data?.message || "Giải quyết complaint thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage =
        error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Lỗi giải quyết complaint (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },
};

export default complaintService;

