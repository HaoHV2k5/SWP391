import { apiClient } from "./authService";

// ==================== ORDER SERVICE ====================
// Dịch vụ quản lý đơn hàng: tạo order request, từ chối order, xem danh sách orders

const orderService = {
  // 🛒 Tạo order request (mua sản phẩm)
  // 📍 Endpoint: /order/create
  // 👥 Users: Member (ROLE_USER)
  async createOrder(productId, userId) {
    try {
      const requestData = {
        productId: productId,
        userId: userId
      };

      console.log("🚀 Creating order request:", requestData);

      const response = await apiClient.post("/order/create", requestData);
      const data = response?.data?.data ?? response?.data;
      
      console.log("✅ Order created successfully:", data);
      
      return { success: true, data };
    } catch (error) {
      console.error("❌ Create order error:", error);
      
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      
      let errorMessage = "Tạo đơn hàng thất bại";
      
      if (status === 401) {
        errorMessage = "Bạn cần đăng nhập để mua sản phẩm";
      } else if (status === 403) {
        errorMessage = "Bạn không có quyền mua sản phẩm. Chỉ có member/user mới có thể mua hàng. Vui lòng liên hệ admin để được hỗ trợ.";
      } else if (status === 400) {
        if (backendMessage?.includes('sản phẩm') || backendMessage?.includes('product')) {
          errorMessage = "Sản phẩm không tồn tại hoặc đã được bán";
        } else if (backendMessage?.includes('user') || backendMessage?.includes('người dùng')) {
          errorMessage = "Thông tin người dùng không hợp lệ";
        } else {
          errorMessage = backendMessage || "Thông tin không hợp lệ";
        }
      } else if (status === 404) {
        errorMessage = "Không tìm thấy sản phẩm hoặc người dùng";
      } else if (status === 500) {
        errorMessage = "Lỗi hệ thống. Vui lòng thử lại sau";
      } else if (!status) {
        errorMessage = "Lỗi kết nối mạng. Vui lòng kiểm tra internet";
      }
      
      return {
        success: false,
        message: errorMessage,
        status: status,
        originalMessage: backendMessage
      };
    }
  },

  // ❌ Từ chối order
  // 📍 Endpoint: /order/reject
  // 👥 Users: Seller (ROLE_SELLER)
  async rejectOrder(orderId) {
    try {
      console.log("🚀 Rejecting order:", orderId);

      const response = await apiClient.post("/order/reject", null, {
        params: { orderId: orderId }
      });
      
      console.log("✅ Order rejected successfully");
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("❌ Reject order error:", error);
      
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      
      let errorMessage = "Từ chối đơn hàng thất bại";
      
      if (status === 401) {
        errorMessage = "Bạn cần đăng nhập để thực hiện thao tác này";
      } else if (status === 403) {
        errorMessage = "Bạn không có quyền từ chối đơn hàng này";
      } else if (status === 400) {
        if (backendMessage?.includes('ACCEPTED') || backendMessage?.includes('đã được chấp nhận')) {
          errorMessage = "Không thể từ chối đơn hàng đã được chấp nhận";
        } else {
          errorMessage = backendMessage || "Không thể từ chối đơn hàng";
        }
      } else if (status === 404) {
        errorMessage = "Không tìm thấy đơn hàng";
      } else if (status === 500) {
        errorMessage = "Lỗi hệ thống. Vui lòng thử lại sau";
      }
      
      return {
        success: false,
        message: errorMessage,
        status: status,
        originalMessage: backendMessage
      };
    }
  },

  // 📋 Lấy danh sách orders của sản phẩm
  // 📍 Endpoint: /order/product/{productId}/orders
  // 👥 Users: Seller (ROLE_SELLER)
  async getOrdersByProduct(productId) {
    try {
      console.log("🚀 Getting orders for product:", productId);

      const response = await apiClient.get(`/order/product/${productId}/orders`);
      const data = response?.data?.data ?? response?.data;
      
      console.log("✅ Orders retrieved successfully:", data);
      
      return { success: true, data };
    } catch (error) {
      console.error("❌ Get orders error:", error);
      
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      
      let errorMessage = "Lấy danh sách đơn hàng thất bại";
      
      if (status === 401) {
        errorMessage = "Bạn cần đăng nhập để xem đơn hàng";
      } else if (status === 403) {
        errorMessage = "Bạn không có quyền xem đơn hàng của sản phẩm này";
      } else if (status === 404) {
        errorMessage = "Không tìm thấy sản phẩm hoặc đơn hàng";
      } else if (status === 500) {
        errorMessage = "Lỗi hệ thống. Vui lòng thử lại sau";
      }
      
      return {
        success: false,
        message: errorMessage,
        status: status,
        originalMessage: backendMessage
      };
    }
  },

  // ✅ Buyer xác nhận đã nhận hàng
  // 📍 Endpoint: POST /order/confirm-received?orderId={orderId}
  // 👥 Users: Buyer (ROLE_USER)
  async confirmReceived(orderId) {
    try {
      console.log("🚀 Confirming receipt for order:", orderId);

      const response = await apiClient.post("/order/confirm-received", null, {
        params: { orderId: orderId }
      });
      
      console.log("✅ Order confirmed received successfully");
      
      return { 
        success: true, 
        message: response?.data?.message || "Xác nhận đã nhận hàng thành công",
        data: response.data 
      };
    } catch (error) {
      console.error("❌ Confirm received error:", error);
      
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      
      let errorMessage = "Xác nhận nhận hàng thất bại";
      
      if (status === 401) {
        errorMessage = "Bạn cần đăng nhập để thực hiện thao tác này";
      } else if (status === 403) {
        errorMessage = "Bạn không có quyền xác nhận đơn hàng này";
      } else if (status === 400) {
        if (backendMessage?.includes('escrow') || backendMessage?.includes('trạng thái')) {
          errorMessage = "Đơn hàng không ở trạng thái có thể xác nhận nhận hàng";
        } else {
          errorMessage = backendMessage || "Không thể xác nhận nhận hàng";
        }
      } else if (status === 404) {
        errorMessage = "Không tìm thấy đơn hàng";
      } else if (status === 500) {
        errorMessage = "Lỗi hệ thống. Vui lòng thử lại sau";
      }
      
      return {
        success: false,
        message: errorMessage,
        status: status,
        originalMessage: backendMessage
      };
    }
  },

  // 📤 Seller gửi yêu cầu admin review escrow (submit proof)
  // 📍 Endpoint: POST /order/request-complete
  // 👥 Users: Seller (ROLE_SELLER)
  async requestOrderComplete(orderId, shippingCode, proofImage) {
    try {
      console.log("🚀 Requesting admin review for order:", orderId);

      const formData = new FormData();
      formData.append("orderId", orderId);
      if (shippingCode) {
        formData.append("shippingCode", shippingCode);
      }
      if (proofImage) {
        formData.append("proofImage", proofImage);
      }

      const response = await apiClient.post("/order/request-complete", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Request submitted successfully");

      return {
        success: true,
        message: response?.data?.message || "Đã gửi yêu cầu xác nhận tới admin",
        data: response.data,
      };
    } catch (error) {
      console.error("❌ Request order complete error:", error);

      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;

      let errorMessage = "Gửi yêu cầu thất bại";

      if (status === 401) {
        errorMessage = "Bạn cần đăng nhập để thực hiện thao tác này";
      } else if (status === 403) {
        errorMessage = "Bạn không có quyền gửi yêu cầu này";
      } else if (status === 400) {
        if (backendMessage?.includes("escrow") || backendMessage?.includes("trạng thái")) {
          errorMessage = "Đơn hàng không ở trạng thái có thể gửi yêu cầu";
        } else {
          errorMessage = backendMessage || "Không thể gửi yêu cầu";
        }
      } else if (status === 404) {
        errorMessage = "Không tìm thấy đơn hàng";
      } else if (status === 500) {
        errorMessage = "Lỗi hệ thống. Vui lòng thử lại sau";
      }

      return {
        success: false,
        message: errorMessage,
        status: status,
        originalMessage: backendMessage,
      };
    }
  },
};

export default orderService;
