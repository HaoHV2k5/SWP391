import apiClient from './apiClient';

// KYC Service - Tương tác với backend KYC endpoints
export const kycService = {
  // User submit KYC
  async submitKyc(userId, frontImage, backImage) {
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('frontImage', frontImage);
      formData.append('backImage', backImage);

      const response = await apiClient.post('/kyc/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return { success: true, data: response.data.data };
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || '';
      
      // Thông báo lỗi thân thiện không có mã lỗi
      let userFriendlyMessage = 'Không thể gửi yêu cầu KYC';
      if (status === 401) {
        userFriendlyMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại';
      } else if (status === 403) {
        userFriendlyMessage = 'Bạn không có quyền thực hiện thao tác này';
      } else if (status === 400) {
        if (message.includes('KYC') && (message.includes('chưa') || message.includes('not approved'))) {
          userFriendlyMessage = 'KYC của bạn chưa được duyệt. Vui lòng chờ duyệt hoặc liên hệ admin';
        } else {
          userFriendlyMessage = message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại';
        }
      } else if (status === 404) {
        userFriendlyMessage = 'Không tìm thấy thông tin cần thiết';
      } else if (status >= 500) {
        userFriendlyMessage = 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau';
      } else if (!status) {
        userFriendlyMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet';
      }
      
      return {
        success: false,
        message: userFriendlyMessage
      };
    }
  },

  // User xem KYC của mình
  async getMyKyc(userId) {
    try {
      const response = await apiClient.get(`/kyc/user?userId=${userId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || '';
      
      // Nếu chưa có KYC (không phải lỗi thực sự), trả về thông báo thân thiện
      if (status === 400 && (
        message.includes('không có KYC nào tồn tại') || 
        message.includes('KYC_NOT_EXISTED') ||
        message.toLowerCase().includes('kyc not existed')
      )) {
        return {
          success: false,
          notExists: true, // Flag để biết đây không phải lỗi thực sự
          message: 'Bạn chưa có KYC nào được đăng ký'
        };
      }
      
      // Các lỗi khác - thông báo thân thiện không có mã lỗi
      let userFriendlyMessage = 'Không thể tải thông tin KYC';
      if (status === 401) {
        userFriendlyMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại';
      } else if (status === 403) {
        userFriendlyMessage = 'Bạn không có quyền truy cập thông tin này';
      } else if (status === 404) {
        userFriendlyMessage = 'Không tìm thấy thông tin KYC';
      } else if (status >= 500) {
        userFriendlyMessage = 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau';
      } else if (!status) {
        userFriendlyMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet';
      }
      
      return {
        success: false,
        message: userFriendlyMessage
      };
    }
  },

  // Chỉ giữ lại các function cho member (user)
};

// KYC Status constants
export const KYC_STATUS = {
  PENDING: 'PENDING',
  STAFF_APPROVED: 'STAFF_APPROVED', 
  REJECTED: 'REJECTED',
  ADMIN_APPROVED: 'ADMIN_APPROVED'
};

// KYC Status labels
export const KYC_STATUS_LABELS = {
  [KYC_STATUS.PENDING]: 'Đang chờ duyệt',
  [KYC_STATUS.STAFF_APPROVED]: 'Staff đã duyệt',
  [KYC_STATUS.REJECTED]: 'Bị từ chối',
  [KYC_STATUS.ADMIN_APPROVED]: 'Admin đã duyệt'
};

// KYC Status colors
export const KYC_STATUS_COLORS = {
  [KYC_STATUS.PENDING]: 'warning',
  [KYC_STATUS.STAFF_APPROVED]: 'info',
  [KYC_STATUS.REJECTED]: 'danger',
  [KYC_STATUS.ADMIN_APPROVED]: 'success'
};
