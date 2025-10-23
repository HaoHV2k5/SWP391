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
      const message = error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Submit KYC thất bại (${status || 'network'}): ${message || 'Không rõ'}`
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
      const message = error?.response?.data?.message || error?.message;
      return {
        success: false,
        message: `Lấy thông tin KYC thất bại (${status || 'network'}): ${message || 'Không rõ'}`
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
