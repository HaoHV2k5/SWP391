// src/services/paymentService.js
import apiClient from "./apiClient";

export const paymentService = {
  // Nạp tiền vào ví
  async rechargeWallet(formPayload) {
    try {
      const formData = new FormData();

      // Bắt buộc
      if (formPayload?.userId != null)
        formData.append("userId", formPayload.userId);
      if (formPayload?.amount != null)
        formData.append("amount", formPayload.amount);
      if (formPayload?.vnp_OrderInfo)
        formData.append("vnp_OrderInfo", formPayload.vnp_OrderInfo);
      formData.append("ordertype", formPayload?.ordertype || "recharge");

      // Tuỳ chọn/khuyến nghị theo ảnh Postman
      if (formPayload?.bankcode)
        formData.append("bankcode", formPayload.bankcode);
      formData.append("language", formPayload?.language || "vn");
      if (formPayload?.txt_billing_fullname)
        formData.append(
          "txt_billing_fullname",
          formPayload.txt_billing_fullname
        );
      if (formPayload?.txt_billing_mobile)
        formData.append("txt_billing_mobile", formPayload.txt_billing_mobile);
      if (formPayload?.txt_billing_email)
        formData.append("txt_billing_email", formPayload.txt_billing_email);
      if (formPayload?.txt_inv_addr1)
        formData.append("txt_inv_addr1", formPayload.txt_inv_addr1);
      if (formPayload?.txt_bill_city)
        formData.append("txt_bill_city", formPayload.txt_bill_city);
      if (formPayload?.txt_bill_country)
        formData.append("txt_bill_country", formPayload.txt_bill_country);

      const response = await apiClient.post(`/api/payment/recharge`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Kiểm tra response từ backend - có thể response.data là Map với code "99"
      const responseData = response?.data?.data || response?.data;
      if (responseData?.code === "99") {
        // Backend trả về lỗi với code "99" (thường là "Wallet không tồn tại")
        const errorMessage = responseData?.message || "Có lỗi xảy ra khi tạo link thanh toán";
        const error = new Error(errorMessage);
        error.code = "WALLET_ERROR";
        error.response = {
          data: {
            data: responseData
          }
        };
        throw error;
      }
      
      return response.data;
    } catch (error) {
      // Xử lý lỗi từ backend
      const errorData = error?.response?.data?.data || error?.response?.data;
      const errorMessage = 
        errorData?.message || 
        error?.message || 
        "Có lỗi xảy ra khi nạp tiền";
      
      // Kiểm tra nếu là lỗi wallet không tồn tại
      if (
        errorMessage.toLowerCase().includes("wallet không tồn tại") ||
        errorMessage.toLowerCase().includes("wallet khong ton tai") ||
        errorMessage.toLowerCase().includes("wallet does not exist")
      ) {
        const walletError = new Error(
          "Ví của bạn chưa được khởi tạo. Vui lòng liên hệ quản trị viên để được hỗ trợ."
        );
        walletError.code = "WALLET_NOT_EXIST";
        throw walletError;
      }
      
      // Các lỗi khác giữ nguyên
      console.error("Error recharging wallet:", error);
      throw error;
    }
  },

  // Xử lý VNPay redirect (payment-return)
  async paymentReturn(queryString) {
    try {
      const qs = typeof queryString === "string" ? queryString : "";
      const url = `/api/payment/payment-return${
        qs.startsWith("?") ? qs : `?${qs}`
      }`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Error handling payment return:", error);
      throw error;
    }
  },

  // Callback server-to-server (ít dùng trên FE, thêm để đủ bộ API)
  async paymentCallback(queryString) {
    try {
      const qs = typeof queryString === "string" ? queryString : "";
      const url = `/api/payment/callback${qs.startsWith("?") ? qs : `?${qs}`}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Error handling payment callback:", error);
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
      // Kiểm tra nếu lỗi là do ví chưa tồn tại (user chưa nạp tiền lần nào)
      const errorData = error?.response?.data;
      const errorMessage = 
        errorData?.data?.message || 
        errorData?.data?.data?.message ||
        errorData?.message || 
        error?.message || 
        "";
      
      // Kiểm tra error code trong response (có thể là "99" hoặc code khác)
      const errorCode = errorData?.data?.code || errorData?.code;
      
      const isWalletNotExist = 
        error?.response?.status === 400 && 
        (errorMessage.toLowerCase().includes("wallet không tồn tại") ||
         errorMessage.toLowerCase().includes("wallet khong ton tai") ||
         errorMessage.toLowerCase().includes("wallet does not exist") ||
         errorCode === "99" || // Error code từ backend response
         errorCode === 99 ||
         errorCode === 1041); // WALLET_NOT_EXIST error code từ ErrorCode enum
      
      if (isWalletNotExist) {
        // Ví chưa tồn tại là trường hợp bình thường (user chưa nạp tiền lần nào)
        // Trả về mảng rỗng mà không log lỗi để tránh làm nhiễu console
        return { data: [] };
      }
      
      // Các lỗi khác thì vẫn log để debug
      console.error("Error getting wallet transactions:", error);
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
