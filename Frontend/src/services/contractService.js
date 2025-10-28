import { apiClient } from "./authService";

// ==================== CONTRACT SERVICE ====================
// Dịch vụ quản lý hợp đồng: tạo, xem, ký, thanh toán, hủy

const contractService = {
  // 📋 Lấy tất cả hợp đồng mà user đã tham gia
  // 📍 Endpoint: /api/contracts/user/{userId}
  // 👥 Users: SELLER, USER
  async getContractsByUser(userId) {
    try {
      console.log("🚀 Getting contracts for user:", userId);
      const response = await apiClient.get(`/api/contracts/user/${userId}`);
      const data = response?.data?.data ?? response?.data;
      console.log("✅ Contracts retrieved:", data);
      return { success: true, data };
    } catch (error) {
      console.error("❌ Get contracts error:", error);
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: message || "Lấy danh sách hợp đồng thất bại",
        status
      };
    }
  },

  // ⏳ Lấy danh sách hợp đồng pending
  // 📍 Endpoint: /api/contracts/pending
  // 👥 Users: SELLER, USER
  async getContractsPending(userId) {
    try {
      console.log("🚀 Getting pending contracts for user:", userId);
      const response = await apiClient.get("/api/contracts/pending", {
        params: { userid: userId }
      });
      const data = response?.data?.data ?? response?.data;
      console.log("✅ Pending contracts:", data);
      return { success: true, data };
    } catch (error) {
      console.error("❌ Get pending contracts error:", error);
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: message || "Lấy danh sách hợp đồng pending thất bại",
        status
      };
    }
  },

  // ✍️ Lấy danh sách hợp đồng đã ký
  // 📍 Endpoint: /api/contracts/signed
  // 👥 Users: SELLER, USER
  async getContractsSigned(userId) {
    try {
      console.log("🚀 Getting signed contracts for user:", userId);
      const response = await apiClient.get("/api/contracts/signed", {
        params: { userid: userId }
      });
      const data = response?.data?.data ?? response?.data;
      console.log("✅ Signed contracts:", data);
      return { success: true, data };
    } catch (error) {
      console.error("❌ Get signed contracts error:", error);
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: message || "Lấy danh sách hợp đồng đã ký thất bại",
        status
      };
    }
  },

  // ❌ Lấy danh sách hợp đồng đã hủy
  // 📍 Endpoint: /api/contracts/cancel
  // 👥 Users: SELLER, USER
  async getContractsCancelled(userId) {
    try {
      console.log("🚀 Getting cancelled contracts for user:", userId);
      const response = await apiClient.get("/api/contracts/cancel", {
        params: { userid: userId }
      });
      const data = response?.data?.data ?? response?.data;
      console.log("✅ Cancelled contracts:", data);
      return { success: true, data };
    } catch (error) {
      console.error("❌ Get cancelled contracts error:", error);
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: message || "Lấy danh sách hợp đồng đã hủy thất bại",
        status
      };
    }
  },

  // 📄 Lấy tất cả hợp đồng (admin/staff)
  // 📍 Endpoint: /api/contracts/all
  // 👥 Users: ADMIN, STAFF
  async getAllContracts() {
    try {
      console.log("🚀 Getting all contracts");
      const response = await apiClient.get("/api/contracts/all");
      const data = response?.data?.data ?? response?.data;
      console.log("✅ All contracts:", data);
      return { success: true, data };
    } catch (error) {
      console.error("❌ Get all contracts error:", error);
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: message || "Lấy danh sách hợp đồng thất bại",
        status
      };
    }
  },

  // 💰 Thanh toán hợp đồng đã ký
  // 📍 Endpoint: /api/contracts/{contractId}/pay
  // 👥 Users: USER, SELLER
  async payContract(contractId) {
    try {
      console.log("🚀 Paying contract:", contractId);
      const response = await apiClient.post(`/api/contracts/${contractId}/pay`);
      const data = response?.data?.data ?? response?.data;
      console.log("✅ Contract paid:", data);
      return { success: true, data, message: response?.data?.message };
    } catch (error) {
      console.error("❌ Pay contract error:", error);
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: message || "Thanh toán hợp đồng thất bại",
        status
      };
    }
  },

  // ❌ Seller hủy hợp đồng đã ký quá 3 ngày chưa thanh toán
  // 📍 Endpoint: /api/contracts/{contractId}/cancel-by-seller
  // 👥 Users: SELLER
  async cancelContractBySeller(contractId, sellerId) {
    try {
      console.log("🚀 Cancelling contract by seller:", contractId);
      const response = await apiClient.post(
        `/api/contracts/${contractId}/cancel-by-seller`,
        null,
        { params: { sellerId } }
      );
      const data = response?.data?.data ?? response?.data;
      console.log("✅ Contract cancelled:", data);
      return { success: true, data, message: response?.data?.message };
    } catch (error) {
      console.error("❌ Cancel contract error:", error);
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: message || "Hủy hợp đồng thất bại",
        status
      };
    }
  },

  // ❌ Seller hủy hợp đồng pending (buyer chưa ký quá 3 ngày)
  // 📍 Endpoint: /api/contracts/{contractId}/cancel-pending-by-seller
  // 👥 Users: SELLER
  async cancelPendingContractBySeller(contractId, sellerId) {
    try {
      console.log("🚀 Cancelling pending contract by seller");
      console.log("📋 contractId:", contractId, "sellerId:", sellerId);
      console.log("🌐 API URL:", `/api/contracts/${contractId}/cancel-pending-by-seller?sellerId=${sellerId}`);
      
      const response = await apiClient.post(
        `/api/contracts/${contractId}/cancel-pending-by-seller`,
        null,
        { params: { sellerId } }
      );
      const data = response?.data?.data ?? response?.data;
      console.log("✅ Contract cancelled:", data);
      return { success: true, data, message: response?.data?.message };
    } catch (error) {
      console.error("❌ Cancel pending contract error:", error);
      console.error("📋 Error details:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message
      });
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message;
      
      return {
        success: false,
        message: backendMessage || "Hủy hợp đồng thất bại",
        status
      };
    }
  },

  // 📥 Tải xuống hợp đồng PDF
  // 📍 Endpoint: /api/download
  // 👥 Users: SELLER, USER, STAFF, ADMIN
  async downloadContract(contractHash) {
    try {
      console.log("🚀 Downloading contract:", contractHash);
      const response = await apiClient.get("/api/download", {
        params: { contractHash },
        responseType: 'blob'
      });
      
      // Tạo link download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contract_${contractHash}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      console.log("✅ Contract downloaded");
      return { success: true, message: "Tải xuống hợp đồng thành công" };
    } catch (error) {
      console.error("❌ Download contract error:", error);
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: message || "Tải xuống hợp đồng thất bại",
        status
      };
    }
  },

  // 📄 Tạo hợp đồng với template Eversign
  // 📍 Endpoint: /api/eversign/create-using-template
  // 👥 Users: SELLER
  async createContractWithTemplate(request) {
    try {
      console.log("🚀 Creating contract with template:", request);
      const response = await apiClient.post(
        "/api/eversign/create-using-template",
        request
      );
      const data = response?.data?.data ?? response?.data;
      console.log("✅ Contract created:", data);
      return { success: true, data, message: response?.data?.message };
    } catch (error) {
      console.error("❌ Create contract error:", error);
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: message || "Tạo hợp đồng thất bại",
        status
      };
    }
  }
};

export default contractService;
