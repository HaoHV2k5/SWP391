import apiClient from './apiClient';

const wishlistService = {
  async addToWishlist(productId, userId) {
    try {
      const response = await apiClient.post("/wishlist/add", { productId, userId });
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      
      // Nếu lỗi 403 (Forbidden), có thể user không có quyền truy cập backend API
      if (error.response?.status === 403) {
        console.warn("⚠️ Backend wishlist API không khả dụng (403 Forbidden). Sử dụng localStorage.");
        return { 
          success: false, 
          message: "Backend API không khả dụng. Dữ liệu sẽ được lưu local.",
          fallbackToLocal: true 
        };
      }
      
      return { success: false, message: error.response?.data?.message || "Không thể thêm vào danh sách yêu thích" };
    }
  },

  async getWishlist(userId) {
    try {
      const response = await apiClient.get(`/wishlist?userId=${userId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      
      // Nếu lỗi 403 (Forbidden), fallback về localStorage
      if (error.response?.status === 403) {
        console.warn("⚠️ Backend wishlist API không khả dụng (403 Forbidden). Sử dụng localStorage.");
        return { 
          success: false, 
          message: "Backend API không khả dụng. Sử dụng dữ liệu local.",
          fallbackToLocal: true 
        };
      }
      
      return { success: false, message: error.response?.data?.message || "Không thể tải danh sách yêu thích" };
    }
  },

  async removeFromWishlist(productId, userId) {
    try {
      const response = await apiClient.delete(`/wishlist/delete?productId=${productId}&userId=${userId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      
      // Nếu lỗi 403 (Forbidden), fallback về localStorage
      if (error.response?.status === 403) {
        console.warn("⚠️ Backend wishlist API không khả dụng (403 Forbidden). Sử dụng localStorage.");
        return { 
          success: false, 
          message: "Backend API không khả dụng. Dữ liệu sẽ được lưu local.",
          fallbackToLocal: true 
        };
      }
      
      return { success: false, message: error.response?.data?.message || "Không thể xóa khỏi danh sách yêu thích" };
    }
  }
};

export default wishlistService;
