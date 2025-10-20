import { apiClient, authService } from "./authService";
import searchService from "./searchService";

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
      
      // Nếu lỗi 500 (Internal Server Error), trả về dữ liệu rỗng để không vỡ UI
      if (status === 500) {
        return { success: true, data: [] };
      }
      
      return { success: false, message: `Lỗi tải sản phẩm (${status || "network"}): ${backendMessage || "Không rõ"}` };
    }
  },

  // Lấy danh sách tin đăng của chính user (seller/member) - TẤT CẢ trạng thái
  async getMyPosts(username) {
    try {
      let userId = null;
      
      // Lấy userId từ localStorage
      const raw = localStorage.getItem("userData");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          userId = parsed?.userId || parsed?.user?.id || parsed?.id || null;
          username = username || parsed?.username || parsed?.user?.username || parsed?.email || parsed?.user?.email || null;
        } catch {}
      }

      // Ưu tiên dùng endpoint lấy TẤT CẢ tin (kể cả PENDING) theo userId
      let endpoint;
      if (userId) {
        endpoint = `/products/history/seller/${userId}`;
        console.log('🔍 Using history endpoint with userId:', userId);
      } else if (username) {
        endpoint = `/products/seller?username=${encodeURIComponent(username)}`;
        console.log('🔍 Using seller endpoint with username:', username);
      } else {
        endpoint = "/products";
        console.log('🔍 Using public endpoint (no user info)');
      }

      const response = await apiClient.get(endpoint);
      const data = response?.data?.data ?? response?.data?.content ?? response?.data;
      console.log('📦 Received from API:', data);
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      console.error('❌ getMyPosts error:', { status, backendMessage });
      return { success: false, message: `Lỗi tải tin của tôi (${status || "network"}): ${backendMessage || "Không rõ"}` };
    }
  },

  // Tạo tin đăng mới (yêu cầu ROLE_SELLER trên BE)
  async createProduct(form, username) {
    try {
      if (!username) {
        const raw = localStorage.getItem("userData");
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            username = parsed?.username || parsed?.user?.username || parsed?.email || parsed?.user?.email || null;
          } catch {}
        }
      }

      const formData = new FormData();
      const productType = form.category || 'VEHICLE';
      
      // Các field bắt buộc theo CreateProductRequest
      formData.append('title', form.title || '');
      // Đảm bảo price là số hợp lệ
      const price = parseFloat(form.price);
      if (!price || price <= 0) {
        return { success: false, message: 'Giá sản phẩm phải lớn hơn 0' };
      }
      formData.append('price', price);
      formData.append('productType', productType);
      
      // Field tùy chọn
      if (form.description) {
        formData.append('description', form.description);
      }

      // KHÔNG gửi vehicle/battery nếu không có thông tin
      // Backend sẽ tự tạo entity rỗng dựa trên productType

      // Images (nếu có)
      if (Array.isArray(form.images) && form.images.length > 0) {
        form.images.forEach((file) => file && formData.append('images', file));
      }

      const url = username ? `/products/create?username=${encodeURIComponent(username)}` : '/products/create';
      const response = await apiClient.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = response?.data?.data ?? response?.data;
      return { success: true, data };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      return { success: false, message: `Đăng tin thất bại (${status || 'network'}): ${backendMessage || 'Không rõ'}` };
    }
  },

  // Delegate search functions to searchService
  async getAutocompleteSuggestions(keyword) {
    return searchService.getAutocompleteSuggestions(keyword);
  },

  async searchProducts(keyword) {
    return searchService.searchProducts(keyword);
  },

  async getProductsByTag(tagSlug) {
    return searchService.getProductsByTag(tagSlug);
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
  },

  // Xóa sản phẩm theo ID (yêu cầu ROLE_SELLER)
  async deleteProduct(productId) {
    try {
      const response = await apiClient.delete(`/products/delete/${productId}`);
      const data = response?.data?.data ?? response?.data;
      return { success: true, data, message: response?.data?.message || "Xóa sản phẩm thành công" };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      console.error('❌ deleteProduct error:', { productId, status, backendMessage });
      return { success: false, message: `Lỗi xóa sản phẩm (${status || "network"}): ${backendMessage || "Không rõ"}` };
    }
  },

  // Cập nhật sản phẩm (yêu cầu ROLE_SELLER)
  async updateProduct(productId, updateData) {
    try {
      // Backend yêu cầu JSON (@RequestBody), không phải FormData
      const requestBody = {
        title: updateData.title,
        description: updateData.description || '',
        price: updateData.price,
        productType: updateData.productType,
        vehicle: updateData.vehicle || null,
        battery: updateData.battery || null
      };

      const response = await apiClient.put(`/products/update?productId=${productId}`, requestBody, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = response?.data?.data ?? response?.data;
      return { success: true, data, message: response?.data?.message || "Cập nhật sản phẩm thành công" };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      console.error('❌ updateProduct error:', { productId, status, backendMessage });
      return { success: false, message: `Lỗi cập nhật sản phẩm (${status || "network"}): ${backendMessage || "Không rõ"}` };
    }
  }
};

export default productService;