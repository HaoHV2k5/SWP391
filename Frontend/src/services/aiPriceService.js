import { apiClient } from './authService';

/**
 * AI Price Service
 * Service để gọi API gợi ý giá bằng AI
 */
const aiPriceService = {
  /**
   * Gọi AI để gợi ý giá cho sản phẩm
   * @param {string} productName - Tên sản phẩm
   * @param {string} description - Mô tả sản phẩm
   * @returns {Promise<{success: boolean, price?: string, message?: string}>}
   */
  async suggestPrice(productName, description) {
    try {
      console.log('🤖 Calling AI price suggestion API...', { productName, description });
      
      const response = await apiClient.get('/pricing/suggest', {
        params: { 
          name: productName, 
          desc: description 
        }
      });
      
      console.log('✅ AI response:', response.data);
      
      // Parse price từ response
      let price = response.data?.data || response.data;
      
      // Loại bỏ các ký tự không phải số
      if (price) {
        price = price.toString().replace(/[^0-9]/g, '');
      }
      
      return { 
        success: true, 
        price: price || ''
      };
    } catch (error) {
      console.error('❌ AI suggest price error:', error);
      console.error('❌ Error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message
      });
      
      let message = 'Không thể gợi ý giá. Vui lòng thử lại!';
      
      // Check specific error types
      if (error?.response?.status === 500) {
        message = 'Lỗi backend: API Gemini AI không hoạt động. Vui lòng kiểm tra server logs hoặc thử lại sau.';
      } else if (error?.response?.status === 403) {
        message = 'Bạn không có quyền sử dụng tính năng này. Chỉ tài khoản SELLER mới có thể dùng AI.';
      } else if (error?.response?.status === 401) {
        message = 'Bạn cần đăng nhập để sử dụng tính năng này.';
      } else {
        message = error?.response?.data?.message || error?.message || message;
      }
      
      return { 
        success: false, 
        message 
      };
    }
  }
};

export default aiPriceService;

