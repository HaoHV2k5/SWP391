import { apiClient, authService } from "./authService";

// Dịch vụ sản phẩm: gom tất cả các lời gọi API liên quan đến sản phẩm
const productService = {
  // Lấy danh sách sản phẩm hiển thị trên trang chủ
  // Lưu ý: Hiện tại BE chưa có endpoint công khai cho khách (guest).
  // Logic dưới đây tự xác định endpoint theo quyền người dùng:
  // - ADMIN: gọi /products/seller/staff_approved/admin
  // - SELLER/MEMBER: gọi /products/seller?username=<username>
  // - GUEST: gọi /products (BE hiện có @GetMapping ở root "/products")
  async getPublicList() {
    let endpoint = "";
    try {
      // Không gọi /auth/me (BE không có). Đọc từ localStorage để xác định quyền/username
      const userDataRaw = localStorage.getItem("userData");
      console.log("🔍 getPublicList: userDataRaw:", userDataRaw);
      
      if (userDataRaw) {
        try {
          const userData = JSON.parse(userDataRaw);
          const rolesRaw = userData?.roles || userData?.user?.roles || [];
          const roles = Array.isArray(rolesRaw)
            ? rolesRaw
                .map((r) => (typeof r === "string" ? r : r?.name))
                .filter(Boolean)
            : [];
          const isAdmin =
            roles.includes("ROLE_ADMIN") ||
            userData?.user?.role === "ROLE_ADMIN";
          const username =
            userData?.username ||
            userData?.user?.username ||
            userData?.email ||
            userData?.user?.email;

          console.log("🔍 getPublicList: isAdmin:", isAdmin, "username:", username);

          if (isAdmin) {
            endpoint = "/products/seller/staff_approved/admin";
          } else if (username) {
            endpoint = `/products/seller?username=${encodeURIComponent(
              username
            )}`;
          }
        } catch (e) {
          console.error("❌ getPublicList: Error parsing userData:", e);
        }
      }

      // Chưa đăng nhập hoặc không xác định được endpoint phù hợp thì
      // gọi endpoint công khai đang có trong BE
      if (!endpoint) {
        endpoint = "/products"; // BE hiện có GET /products trả danh sách đã post
      }

      console.log("🔍 getPublicList: Using endpoint:", endpoint);
      const response = await apiClient.get(endpoint);
      console.log("📡 getPublicList: API response:", response);
      // BE thường bọc dữ liệu trong ApiResponse { data, message }
      const data =
        response?.data?.data ?? response?.data?.content ?? response?.data;
      console.log("📦 getPublicList: Final data:", data);
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.error("❌ getPublicList: API error:", error);
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      console.error("getPublicList thất bại", {
        endpoint,
        status,
        backendMessage,
      });
      // Nếu không có token và bị chặn/không tìm thấy, trả rỗng để không vỡ UI
      if (
        !localStorage.getItem("token") &&
        (status === 404 || status === 401)
      ) {
        return { success: true, data: [] };
      }
      return {
        success: false,
        message: `Lỗi tải sản phẩm (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  // Tìm kiếm sản phẩm theo từ khóa sử dụng search endpoint của BE
  async searchProducts(keyword) {
    try {
      const response = await apiClient.get(
        `/tag/vehicle/search?request=${encodeURIComponent(keyword)}`
      );
      const data =
        response?.data?.data ?? response?.data?.content ?? response?.data;
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      console.error("searchProducts thất bại", {
        keyword,
        status,
        backendMessage,
      });
      return {
        success: false,
        message: `Lỗi tìm kiếm (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  // Lấy sản phẩm theo tag/category
  async getProductsByTag(tagSlug) {
    try {
      const response = await apiClient.get(
        `/tag/${encodeURIComponent(tagSlug)}`
      );
      const data =
        response?.data?.data ?? response?.data?.content ?? response?.data;
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      console.error("getProductsByTag thất bại", {
        tagSlug,
        status,
        backendMessage,
      });
      return {
        success: false,
        message: `Lỗi tải sản phẩm theo tag (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  // Lấy danh sách filter options từ dữ liệu sản phẩm
  async getFilterOptions() {
    try {
      const result = await this.getPublicList();
      if (!result.success) {
        return { success: false, message: result.message };
      }

      const products = result.data;

      // Lấy danh sách brands duy nhất - chuẩn hóa và loại bỏ trùng lặp
      const brands = [
        ...new Set(
          products
            .map((product) => {
              const brand = product.vehicle?.brand || product.battery?.brand;
              return brand ? brand.trim().toLowerCase() : null;
            })
            .filter((brand) => brand)
        ),
      ].sort();

      // Lấy danh sách years duy nhất
      const years = [
        ...new Set(
          products
            .map(
              (product) =>
                product.vehicle?.yearManufactured ||
                product.battery?.yearManufactured
            )
            .filter((year) => year)
        ),
      ].sort((a, b) => b - a); // Sắp xếp giảm dần

      // Lấy product types
      const productTypes = [
        ...new Set(products.map((product) => product.productType)),
      ];

      return {
        success: true,
        data: {
          brands,
          years,
          productTypes,
        },
      };
    } catch (error) {
      console.error("getFilterOptions thất bại", error);
      return { success: false, message: "Lỗi lấy filter options" };
    }
  },

  // Admin: Lấy tất cả sản phẩm đã được staff approve để admin duyệt
  async getPendingProducts() {
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
      console.error("getPendingProducts thất bại", {
        status,
        backendMessage,
      });
      return {
        success: false,
        message: `Lỗi tải sản phẩm chờ duyệt (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  // Admin: Lấy chi tiết sản phẩm
  async getProductDetail(id) {
    try {
      const response = await apiClient.get(`/products/${id}`);
      const data = response?.data?.data ?? response?.data;
      return { success: true, data };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      console.error("getProductDetail thất bại", {
        id,
        status,
        backendMessage,
      });
      return {
        success: false,
        message: `Lỗi tải chi tiết sản phẩm (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  // Admin: Approve sản phẩm
  async approveProduct(id) {
    try {
      const response = await apiClient.post(`/products/${id}/approve/admin`);
      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data,
        message: response?.data?.message || "Duyệt sản phẩm thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      console.error("approveProduct thất bại", {
        id,
        status,
        backendMessage,
      });
      return {
        success: false,
        message: `Lỗi duyệt sản phẩm (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  // Admin: Reject sản phẩm
  async rejectProduct(id, reason) {
    try {
      const response = await apiClient.post(`/products/${id}/reject`, {
        reason: reason || "Không đạt yêu cầu",
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
      console.error("rejectProduct thất bại", {
        id,
        reason,
        status,
        backendMessage,
      });
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
