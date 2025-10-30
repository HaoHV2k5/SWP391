import { apiClient } from './authService';

/**
 * AI Price Service
 * Service để gọi API gợi ý giá bằng AI
 */
const aiPriceService = {
  /**
   * Gọi AI theo đặc tả PriceRequest (BE yêu cầu body JSON)
   * @param {Object} priceRequest - theo Backend PriceRequest
   * @returns {Promise<{success: boolean, price?: number, details?: any, message?: string}>}
   */
  async suggestPriceBySpec(priceRequest) {
    try {
      // Gọi POST theo contract mới của Backend
      const response = await apiClient.post('/pricing/suggest', priceRequest);
      const payload = response?.data?.data ?? response?.data;
      const price = payload?.suggestedPrice ?? null;
      return { success: true, price, details: payload };
    } catch (firstError) {
      // Fallback: thử GET với query params nếu môi trường BE chưa cập nhật
      try {
        const response = await apiClient.get('/pricing/suggest', { params: { ...priceRequest } });
        const payload = response?.data?.data ?? response?.data;
        const price = payload?.suggestedPrice ?? null;
        return { success: true, price, details: payload };
      } catch (error) {
        let message = 'Không thể gợi ý giá. Vui lòng thử lại!';
        if (error?.response?.status === 500) message = 'Lỗi backend: API Gemini AI không hoạt động. Vui lòng thử lại sau.';
        else if (error?.response?.status === 403) message = 'Bạn không có quyền sử dụng tính năng này. Chỉ tài khoản SELLER mới có thể dùng AI.';
        else if (error?.response?.status === 401) message = 'Bạn cần đăng nhập để sử dụng tính năng này.';
        else message = error?.response?.data?.message || error?.message || message;
        return { success: false, message };
      }
    }
  },
};

export default aiPriceService;
