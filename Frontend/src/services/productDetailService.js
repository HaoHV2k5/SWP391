import { apiClient } from "./authService";
import displayService from "./displayService";

// ==================== PRODUCT DETAIL SERVICE ====================
// Dịch vụ chi tiết sản phẩm: chuyên xử lý việc lấy thông tin chi tiết sản phẩm

const productDetailService = {
  // 🔍 Lấy chi tiết sản phẩm theo ID
  // 📍 Endpoints: /products/{id}, /api/v1/products/{id}
  // 👥 Users: Guest, Member (có thể cần auth tùy endpoint)
  async getProductById(id) {
    try {
      // Ưu tiên tìm trong danh sách sản phẩm công khai trước (không cần auth)
      const allProductsResponse = await displayService.getPublicList();
      if (allProductsResponse.success) {
        const product = allProductsResponse.data.find(
          (p) => p.id == id || p.productId == id
        );
        if (product) {
          return { success: true, data: product };
        }
      }

      // Nếu không tìm thấy trong danh sách công khai, thử endpoint trực tiếp
      try {
        const response = await apiClient.get(`/products/${id}`);
        const data =
          response?.data?.data ?? response?.data?.content ?? response?.data;

        // Kiểm tra xem data có phải là HTML không (redirect đến login)
        if (typeof data === "string" && data.includes("<!DOCTYPE html>")) {
          throw new Error("Authentication required - received HTML login page");
        }

        // Kiểm tra xem data có phải là object hợp lệ không
        if (!data || typeof data !== "object") {
          throw new Error("Invalid data format received");
        }

        return { success: true, data: data };
      } catch (error) {
        // Thử endpoint versioned
        try {
          const response2 = await apiClient.get(`/api/v1/products/${id}`);
          const data2 =
            response2?.data?.data ??
            response2?.data?.content ??
            response2?.data;
          return { success: true, data: data2 };
        } catch (error2) {
          // Ignore versioned endpoint error
        }

        throw error; // Re-throw original error
      }
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Lỗi tải chi tiết sản phẩm (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  }
};

export default productDetailService;
