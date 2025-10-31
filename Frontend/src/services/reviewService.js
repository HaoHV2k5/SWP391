import apiClient from "./apiClient";

// ==================== REVIEW SERVICE ====================
// Dịch vụ đánh giá: quản lý review của user về seller

const reviewService = {
  /**
   * Tạo review mới cho seller
   * @param {Object} reviewData - { revieweeId, rating, comment, images }
   * @param {string} username - Username của người tạo review
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  async createReview(reviewData, username = null) {
    try {
      // Lấy username từ localStorage nếu không truyền vào
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
          } catch (e) {
            return {
              success: false,
              message: "Không thể lấy thông tin người dùng từ localStorage",
            };
          }
        }
      }

      if (!username) {
        return {
          success: false,
          message: "Vui lòng đăng nhập trước khi đánh giá",
        };
      }

      // Tạo FormData cho multipart/form-data
      const formData = new FormData();
      formData.append("revieweeId", reviewData.revieweeId);
      formData.append("rating", reviewData.rating);
      if (reviewData.comment) {
        formData.append("comment", reviewData.comment);
      }
      
      // Thêm images nếu có
      if (reviewData.images && reviewData.images.length > 0) {
        reviewData.images.forEach((image) => {
          formData.append("images", image);
        });
      }

      const response = await apiClient.post(
        `/reviews/create?username=${encodeURIComponent(username)}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data: data,
        message: response?.data?.message || "Tạo review thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage =
        error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Lỗi tạo review (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  /**
   * Lấy danh sách review của một seller
   * @param {number} sellerId - ID của seller
   * @param {number} page - Số trang (default: 0)
   * @param {number} size - Số item mỗi trang (default: 10)
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  async getReviewsForSeller(sellerId, page = 0, size = 10) {
    try {
      const response = await apiClient.get(
        `/reviews/seller/${sellerId}?page=${page}&size=${size}`
      );
      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data: data,
        message: response?.data?.message || "Lấy danh sách review thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage =
        error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Lỗi tải reviews (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  /**
   * Lấy danh sách review mà user đã viết
   * @param {number} userId - ID của user
   * @param {number} page - Số trang (default: 0)
   * @param {number} size - Số item mỗi trang (default: 10)
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  async getReviewsByUser(userId, page = 0, size = 10) {
    try {
      const response = await apiClient.get(
        `/reviews/user/${userId}?page=${page}&size=${size}`
      );
      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data: data,
        message: response?.data?.message || "Lấy danh sách review thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage =
        error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Lỗi tải reviews (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  /**
   * Xóa review
   * @param {number} reviewId - ID của review cần xóa
   * @param {string} username - Username của người xóa (phải là reviewer)
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async deleteReview(reviewId, username = null) {
    try {
      // Lấy username từ localStorage nếu không truyền vào
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
          } catch (e) {
            return {
              success: false,
              message: "Không thể lấy thông tin người dùng từ localStorage",
            };
          }
        }
      }

      if (!username) {
        return {
          success: false,
          message: "Vui lòng đăng nhập trước khi xóa review",
        };
      }

      await apiClient.delete(
        `/reviews/${reviewId}?username=${encodeURIComponent(username)}`
      );

      return {
        success: true,
        message: "Xóa review thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage =
        error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Lỗi xóa review (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  /**
   * Lấy thống kê review của seller
   * @param {number} sellerId - ID của seller
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  async getReviewStats(sellerId) {
    try {
      const response = await apiClient.get(`/reviews/seller/${sellerId}/stats`);
      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data: data,
        message: response?.data?.message || "Lấy thống kê review thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage =
        error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Lỗi tải thống kê review (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },

  /**
   * Lấy reviews của seller theo rating cụ thể
   * @param {number} sellerId - ID của seller
   * @param {number} rating - Rating (1-5)
   * @param {number} page - Số trang (default: 0)
   * @param {number} size - Số item mỗi trang (default: 10)
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  async getReviewsForSellerByRating(sellerId, rating, page = 0, size = 10) {
    try {
      const response = await apiClient.get(
        `/reviews/seller/${sellerId}/rating/${rating}?page=${page}&size=${size}`
      );
      const data = response?.data?.data ?? response?.data;
      return {
        success: true,
        data: data,
        message: response?.data?.message || "Lấy danh sách review theo rating thành công",
      };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage =
        error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Lỗi tải reviews (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },
};

export default reviewService;

