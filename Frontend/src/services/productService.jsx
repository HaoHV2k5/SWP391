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
      if (userDataRaw) {
        try {
          const userData = JSON.parse(userDataRaw);
          const rolesRaw = userData?.roles || userData?.user?.roles || [];
          const roles = Array.isArray(rolesRaw)
            ? rolesRaw.map((r) => (typeof r === "string" ? r : r?.name)).filter(Boolean)
            : [];
          const isAdmin = roles.includes("ROLE_ADMIN") || userData?.user?.role === "ROLE_ADMIN";
          const username = userData?.username || userData?.user?.username || userData?.email || userData?.user?.email;

          if (isAdmin) {
            endpoint = "/products/seller/staff_approved/admin";
          } else if (username) {
            endpoint = `/products/seller?username=${encodeURIComponent(username)}`;
          }
        } catch {}
      }

      // Chưa đăng nhập hoặc không xác định được endpoint phù hợp thì
      // gọi endpoint công khai đang có trong BE
      if (!endpoint) {
        endpoint = "/products"; // BE hiện có GET /products trả danh sách đã post
      }

      const response = await apiClient.get(endpoint);
      // BE thường bọc dữ liệu trong ApiResponse { data, message }
      const data = response?.data?.data ?? response?.data?.content ?? response?.data;
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      console.error("getPublicList thất bại", { endpoint, status, backendMessage });
      // Nếu không có token và bị chặn/không tìm thấy, trả rỗng để không vỡ UI
      if (!localStorage.getItem("token") && (status === 404 || status === 401)) {
        return { success: true, data: [] };
      }
      return { success: false, message: `Lỗi tải sản phẩm (${status || "network"}): ${backendMessage || "Không rõ"}` };
    }
  },

  // Lấy danh sách tin đăng của chính user (seller/member)
  async getMyPosts(username) {
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

      const endpoint = username
        ? `/products/seller?username=${encodeURIComponent(username)}`
        : "/products"; // fallback công khai nếu chưa có username

      const response = await apiClient.get(endpoint);
      const data = response?.data?.data ?? response?.data?.content ?? response?.data;
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      return { success: false, message: `Lỗi tải tin của tôi (${status || "network"}): ${backendMessage || "Không rõ"}` };
    }
  },

  // Tìm kiếm sản phẩm theo từ khóa sử dụng search endpoint của BE
  async searchProducts(keyword) {
    try {
      const response = await apiClient.get(`/tag/vehicle/search?request=${encodeURIComponent(keyword)}`);
      const data = response?.data?.data ?? response?.data?.content ?? response?.data;
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      console.error("searchProducts thất bại", { keyword, status, backendMessage });
      return { success: false, message: `Lỗi tìm kiếm (${status || "network"}): ${backendMessage || "Không rõ"}` };
    }
  },

  // Lấy sản phẩm theo tag/category
  async getProductsByTag(tagSlug) {
    try {
      const response = await apiClient.get(`/tag/${encodeURIComponent(tagSlug)}`);
      const data = response?.data?.data ?? response?.data?.content ?? response?.data;
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      console.error("getProductsByTag thất bại", { tagSlug, status, backendMessage });
      return { success: false, message: `Lỗi tải sản phẩm theo tag (${status || "network"}): ${backendMessage || "Không rõ"}` };
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
      const brands = [...new Set(products.map(product => {
        const brand = product.vehicle?.brand || product.battery?.brand;
        return brand ? brand.trim().toLowerCase() : null;
      }).filter(brand => brand))].sort();

      // Lấy danh sách years duy nhất
      const years = [...new Set(products.map(product => 
        product.vehicle?.yearManufactured || product.battery?.yearManufactured
      ).filter(year => year))].sort((a, b) => b - a); // Sắp xếp giảm dần

      // Lấy product types
      const productTypes = [...new Set(products.map(product => product.productType))];

      return {
        success: true,
        data: {
          brands,
          years,
          productTypes
        }
      };
    } catch (error) {
      console.error("getFilterOptions thất bại", error);
      return { success: false, message: "Lỗi lấy filter options" };
    }
  },

  // Lấy chi tiết sản phẩm theo ID
  async getProductById(id) {
    try {
      // Ưu tiên tìm trong danh sách sản phẩm công khai trước (không cần auth)
      const allProductsResponse = await this.getPublicList();
      if (allProductsResponse.success) {
        const product = allProductsResponse.data.find(p => p.id == id || p.productId == id);
        if (product) {
          return { success: true, data: product };
        }
      }
      
      // Nếu không tìm thấy trong danh sách công khai, thử endpoint trực tiếp
      try {
        const response = await apiClient.get(`/products/${id}`);
        const data = response?.data?.data ?? response?.data?.content ?? response?.data;
        
        // Kiểm tra xem data có phải là HTML không (redirect đến login)
        if (typeof data === 'string' && data.includes('<!DOCTYPE html>')) {
          throw new Error('Authentication required - received HTML login page');
        }
        
        // Kiểm tra xem data có phải là object hợp lệ không
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid data format received');
        }
        
        return { success: true, data: data };
      } catch (error) {
        // Thử endpoint versioned
        try {
          const response2 = await apiClient.get(`/api/v1/products/${id}`);
          const data2 = response2?.data?.data ?? response2?.data?.content ?? response2?.data;
          return { success: true, data: data2 };
        } catch (error2) {
          // Ignore versioned endpoint error
        }
        
        throw error; // Re-throw original error
      }
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      return { success: false, message: `Lỗi tải chi tiết sản phẩm (${status || "network"}): ${backendMessage || "Không rõ"}` };
    }
  }
};

export default productService;