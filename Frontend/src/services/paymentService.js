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
      return response.data;
    } catch (error) {
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
