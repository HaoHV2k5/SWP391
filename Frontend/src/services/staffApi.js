/**
 * Staff API Service
 * Tập trung tất cả API calls liên quan đến Staff functionality
 */

const BASE_URL = 'http://localhost:3979';

// Helper function để tạo headers với token
const createHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error("No authentication token found");
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Helper function để handle API response
const handleApiResponse = async (response) => {
  const data = await response.json();
  
  if (response.ok && data.code === 1000) {
    return { success: true, data: data.data, message: data.message };
  } else {
    throw new Error(data.message || "API request failed");
  }
};

/**
 * Products API
 */
export const productsApi = {
  // Lấy danh sách tin đăng chờ duyệt
  getPendingProducts: async () => {
    const response = await fetch(`${BASE_URL}/products/pending/seller/staff`, {
      method: 'GET',
      headers: createHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Duyệt tin đăng
  approveProduct: async (productId) => {
    const response = await fetch(`${BASE_URL}/products/${productId}/approve/staff`, {
      method: 'POST',
      headers: createHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Từ chối tin đăng
  rejectProduct: async (productId, reason) => {
    const response = await fetch(`${BASE_URL}/products/${productId}/reject`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ reason })
    });
    
    return handleApiResponse(response);
  },

  // Xem chi tiết tin đăng
  getProductDetail: async (productId) => {
    const response = await fetch(`${BASE_URL}/products/${productId}`, {
      method: 'GET',
      headers: createHeaders()
    });
    
    return handleApiResponse(response);
  }
};

/**
 * KYC API
 */
export const kycApi = {
  // Lấy danh sách KYC cho staff
  getKycList: async () => {
    const response = await fetch(`${BASE_URL}/kyc/staff`, {
      method: 'GET',
      headers: createHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Duyệt KYC
  approveKyc: async (kycId) => {
    const response = await fetch(`${BASE_URL}/kyc/${kycId}/staff/approve`, {
      method: 'POST',
      headers: createHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Từ chối KYC
  rejectKyc: async (kycId, reason) => {
    const response = await fetch(`${BASE_URL}/kyc/${kycId}/reject`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ reason })
    });
    
    return handleApiResponse(response);
  },

  // Xem chi tiết KYC
  getKycDetail: async (kycId) => {
    const response = await fetch(`${BASE_URL}/kyc/${kycId}`, {
      method: 'GET',
      headers: createHeaders()
    });
    
    return handleApiResponse(response);
  }
};

/**
 * Stats API - Tổng hợp thống kê
 */
export const statsApi = {
  // Lấy tất cả stats cho dashboard
  getAllStats: async () => {
    try {
      const [kycResult, productsResult] = await Promise.all([
        kycApi.getKycList(),
        productsApi.getPendingProducts()
      ]);

      const kycList = kycResult.data || [];
      const productsList = productsResult.data || [];

      return {
        success: true,
        data: {
          // Products stats
          totalProducts: productsList.length,
          pendingProducts: productsList.filter(p => p.status === 'PENDING').length,
          approvedProducts: productsList.filter(p => p.status === 'STAFF_APPROVED' || p.status === 'ADMIN_APPROVED').length,
          rejectedProducts: productsList.filter(p => p.status === 'REJECTED').length,
          
          // KYC stats
          totalKyc: kycList.length,
          pendingKyc: kycList.filter(k => k.status === 'PENDING').length,
          approvedKyc: kycList.filter(k => k.status === 'STAFF_APPROVED' || k.status === 'ADMIN_APPROVED').length,
          
          // Raw data
          productsList,
          kycList
        }
      };
    } catch (error) {
      throw new Error(`Failed to load stats: ${error.message}`);
    }
  }
};

/**
 * Error handling utility
 */
export const handleApiError = (error, defaultMessage = "Có lỗi xảy ra") => {
  console.error("API Error:", error);
  
  if (error.message.includes("No authentication token")) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }
  
  if (error.message.includes("Failed to fetch")) {
    return "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
  }
  
  return error.message || defaultMessage;
};
