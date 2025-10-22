import { apiClient, authService } from "./authService";
import searchService from "./searchService";
import displayService from "./displayService";
import filterService from "./filterService";
import productDetailService from "./productDetailService";

// ==================== PRODUCT SERVICE ====================
// Dịch vụ sản phẩm: gom tất cả các lời gọi API liên quan đến sản phẩm
const productService = {
  // ==================== HOMEPAGE RELATED API ====================
  // 🏠 CHÍNH: Lấy danh sách sản phẩm hiển thị trên trang chủ/HomePage
  // 📍 Endpoints: /products, /products/seller?username=xxx, /products/seller/staff_approved/admin
  // 👥 Users: Guest, Member, Admin (tự động detect quyền)
  async getPublicList() {
    return displayService.getPublicList();
  },

  // 🔧 PHỤ: Lấy danh sách filter options từ dữ liệu sản phẩm (brands, years, types)
  // 📍 Logic: Gọi getPublicList() rồi xử lý dữ liệu
  // 👥 Users: Guest, Member (không cần auth)
  async getFilterOptions() {
    return filterService.getFilterOptions();
  },

  // 🔍 Delegate search functions to searchService (không gọi API trực tiếp)
  // 📍 Logic: Frontend search với fallback API
  // 👥 Users: Guest, Member (không cần auth)
  async getAutocompleteSuggestions(keyword) {
    return searchService.getAutocompleteSuggestions(keyword);
  },

  async searchProducts(keyword) {
    return searchService.searchProducts(keyword);
  },

  async getProductsByTag(tagSlug) {
    return searchService.getProductsByTag(tagSlug);
  },

  // Delegate to productDetailService
  async getProductById(id) {
    return productDetailService.getProductById(id);
  },

  // ==================== USER MANAGEMENT API ====================
  // 📋 PHỤ: Lấy danh sách tin đăng của chính user (seller/member) - TẤT CẢ trạng thái
  // 📍 Endpoints: /products/history/seller/{userId}, /products/seller?username=xxx
  // 👥 Users: Member, Seller (cần đăng nhập)
  async getMyPosts(username) {
    try {
      let userId = null;

      // Lấy userId từ localStorage
      const raw = localStorage.getItem("userData");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          userId = parsed?.userId || parsed?.user?.id || parsed?.id || null;
          username =
            username ||
            parsed?.username ||
            parsed?.user?.username ||
            parsed?.email ||
            parsed?.user?.email ||
            null;
        } catch {}
      }

      // Ưu tiên dùng endpoint lấy TẤT CẢ tin (kể cả PENDING) theo userId
      let endpoint;
      if (userId) {
        endpoint = `/products/history/seller/${userId}`;
        console.log("🔍 Using history endpoint with userId:", userId);
      } else if (username) {
        endpoint = `/products/seller?username=${encodeURIComponent(username)}`;
        console.log("🔍 Using seller endpoint with username:", username);
      } else {
        endpoint = "/products";
        console.log("🔍 Using public endpoint (no user info)");
      }

      const response = await apiClient.get(endpoint);
      const data =
        response?.data?.data ?? response?.data?.content ?? response?.data;
      console.log("📦 Received from API:", data);
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      console.error("❌ getMyPosts error:", { status, backendMessage });
      return {
        success: false,
        message: `Lỗi tải tin của tôi (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  // ==================== PRODUCT MANAGEMENT API ====================
  // ➕ Tạo tin đăng mới (yêu cầu ROLE_SELLER trên BE)
  // 📍 Endpoint: /products/create?username=xxx
  // 👥 Users: Seller (cần đăng nhập + quyền SELLER)
  async createProduct(form, username) {
    try {
      if (!username) {
        const raw = localStorage.getItem("userData");
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            username =
              parsed?.username ||
              parsed?.user?.username ||
              parsed?.email ||
              parsed?.user?.email ||
              null;
          } catch {}
        }
      }

      const formData = new FormData();
      const productType = form.category || "VEHICLE";

      // Các field bắt buộc theo CreateProductRequest
      formData.append("title", form.title || "");
      // Đảm bảo price là số hợp lệ
      const price = parseFloat(form.price);
      if (!price || price <= 0) {
        return { success: false, message: "Giá sản phẩm phải lớn hơn 0" };
      }
      formData.append("price", price);
      formData.append("productType", productType);

      // Field tùy chọn
      if (form.description) {
        formData.append("description", form.description);
      }

      // Gửi vehicle/battery object theo yêu cầu của backend
      if (productType === "VEHICLE") {
        formData.append("vehicle.brand", form.brand || "Unknown");
        formData.append("vehicle.model", form.model || "Unknown");
        formData.append("vehicle.yearManufactured", form.yearManufactured || new Date().getFullYear());
      } else if (productType === "BATTERY") {
        formData.append("battery.brand", form.brand || "Unknown");
        formData.append("battery.model", form.model || "Unknown");
        formData.append("battery.yearManufactured", form.yearManufactured || new Date().getFullYear());
        formData.append("battery.batteryLevel", form.batteryLevel || 80);
      }

      // Images (nếu có)
      if (Array.isArray(form.images) && form.images.length > 0) {
        form.images.forEach((file) => file && formData.append("images", file));
      }

      const url = username
        ? `/products/create?username=${encodeURIComponent(username)}`
        : "/products/create";
      const response = await apiClient.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = response?.data?.data ?? response?.data;
      return { success: true, data };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Đăng tin thất bại (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },


  // ==================== PRODUCT CRUD API ====================
  // 🗑️ Xóa sản phẩm theo ID (yêu cầu ROLE_SELLER)
  // 📍 Endpoint: /products/delete/{productId}
  // 👥 Users: Seller (cần đăng nhập + quyền SELLER)
  async deleteProduct(productId) {
    try {
      const response = await apiClient.delete(`/products/delete/${productId}`);
      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data,
        message: response?.data?.message || "Xóa sản phẩm thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      console.error("❌ deleteProduct error:", {
        productId,
        status,
        backendMessage,
      });
      return {
        success: false,
        message: `Lỗi xóa sản phẩm (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  // ✏️ Cập nhật sản phẩm (yêu cầu ROLE_SELLER)
  // 📍 Endpoint: /products/update?productId={productId}
  // 👥 Users: Seller (cần đăng nhập + quyền SELLER)
  async updateProduct(productId, updateData) {
    try {
      // Backend yêu cầu JSON (@RequestBody), không phải FormData
      const requestBody = {
        title: updateData.title,
        description: updateData.description || "",
        price: updateData.price,
        productType: updateData.productType,
        vehicle: updateData.vehicle || null,
        battery: updateData.battery || null,
      };

      const response = await apiClient.put(
        `/products/update?productId=${productId}`,
        requestBody,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data,
        message: response?.data?.message || "Cập nhật sản phẩm thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      console.error("❌ updateProduct error:", {
        productId,
        status,
        backendMessage,
      });
      return {
        success: false,
        message: `Lỗi cập nhật sản phẩm (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  // ==================== ADMIN API ====================
  // 📋 Lấy danh sách sản phẩm đã được staff duyệt - chờ admin duyệt
  // 📍 Endpoint: /products/seller/staff_approved/admin
  // 👥 Users: Admin (cần đăng nhập + quyền ADMIN)
  async getStaffApprovedProducts() {
    try {
      const response = await apiClient.get(
        "/products/seller/staff_approved/admin"
      );
      const data =
        response?.data?.data ?? response?.data?.content ?? response?.data;
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Lỗi tải sản phẩm đã duyệt staff (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  // ✅ Admin duyệt sản phẩm
  // 📍 Endpoint: /products/{productId}/approve/admin
  // 👥 Users: Admin (cần đăng nhập + quyền ADMIN)
  async approveProductByAdmin(productId) {
    try {
      const response = await apiClient.post(
        `/products/${productId}/approve/admin`
      );
      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data,
        message: response?.data?.message || "Duyệt sản phẩm thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Lỗi duyệt sản phẩm (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  // ❌ Admin từ chối sản phẩm
  // 📍 Endpoint: /products/{productId}/reject
  // 👥 Users: Admin (cần đăng nhập + quyền ADMIN)
  async rejectProductByAdmin(productId, reason) {
    try {
      const response = await apiClient.post(`/products/${productId}/reject`, {
        reason: reason,
      });
      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data,
        message: response?.data?.message || "Từ chối sản phẩm thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Lỗi từ chối sản phẩm (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },
};

export default productService;