import apiClient from './apiClient';

// ===========================================
// STATE MANAGEMENT - Quản lý trạng thái wishlist
// ===========================================

let savedProducts = [];     // Danh sách sản phẩm đã lưu
let loading = false;        // Trạng thái đang tải
let initialized = false;    // Đã khởi tạo chưa
let currentUserId = null;   // ID user hiện tại
let listeners = [];         // Danh sách listener để thông báo thay đổi

/**
 * Thông báo cho tất cả listener khi state thay đổi
 */
const notifyListeners = () => {
  listeners.forEach(listener => listener({
    savedProducts: [...savedProducts],
    loading,
    currentUserId,
    initialized
  }));
};

/**
 * Lấy user ID từ localStorage (ưu tiên nguồn đáng tin cậy nhất)
 */
const getCurrentUserId = async () => {
  try {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      const userId = user.id || user.userId || user.user?.id;
      if (userId) {
        const numericUserId = parseInt(userId);
        if (!isNaN(numericUserId)) {
          return numericUserId;
        }
      }
    }
  } catch (error) {
    console.error("❌ Error parsing userData:", error);
  }
  
  console.error("❌ Cannot get current user ID");
  return null;
};

/**
 * Kiểm tra user có đăng nhập không (dựa vào token)
 */
const isUserLoggedIn = () => {
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");
  return !!(token || refreshToken);
};

// ===========================================
// BACKEND API OPERATIONS - Gọi API Backend
// ===========================================

/**
 * Lưu sản phẩm vào database qua API POST /wishlist/add
 */
const saveToDatabase = async (product) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn("No userId found, cannot save to database");
      return false;
    }

    const response = await apiClient.post('/wishlist/add', {
      productId: product.id,
      userId: userId
    });

    // Kiểm tra response theo format BE: {code: 1000, message: '...', data: true}
    if (response.data && response.data.code === 1000 && response.data.data === true) {
      return true;
    } else {
      console.error("❌ Failed to save to database:", response.data?.message);
      return false;
    }
  } catch (error) {
    console.error("❌ Error saving to database:", error);
    
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message;
    
    // Xử lý lỗi 403 - Forbidden (không có quyền)
    if (status === 403) {
      console.error("❌ 403 Forbidden - Permission denied");
      
      // Debug: Decode JWT token để kiểm tra claim scope
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("userData");
        let jwtToken = token || (userData ? JSON.parse(userData)?.token : null);
        
        if (jwtToken) {
          const parts = jwtToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.error("   🔍 JWT Token Debug:", {
              username: payload.sub,
              scope: payload.scope,
              hasRoleUser: payload.scope?.includes('ROLE_USER'),
              hasRoleSeller: payload.scope?.includes('ROLE_SELLER')
            });
          }
        }
      } catch (e) {
        console.error("   Error decoding JWT:", e);
      }
      
      return false;
    }
    
    // Xử lý lỗi 400 - Wishlist không tồn tại
    if (status === 400) {
      if (errorMessage.includes('WISHLIST_NOT_EXISTED') || 
          errorMessage.includes('wishlist')) {
        console.error("❌ Wishlist not found");
        return false;
      }
    }
    
    // Xử lý lỗi 401 - Unauthorized
    if (status === 401) {
      console.error("❌ 401 Unauthorized - Please login again");
      return false;
    }
    
    return false;
  }
};

/**
 * Xóa sản phẩm khỏi database qua API DELETE /wishlist/delete
 */
const removeFromDatabase = async (productId) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn("No userId found, cannot remove from database");
      return false;
    }

    const response = await apiClient.delete(`/wishlist/delete?productId=${productId}&userId=${userId}`);

    // Kiểm tra response theo format BE: {code: 1000, message: '...'}
    if (response.data && response.data.code === 1000) {
      return true;
    } else {
      console.error("❌ Failed to remove from database:", response.data?.message);
      return false;
    }
  } catch (error) {
    console.error("❌ Error removing from database:", error);
    return false;
  }
};

/**
 * Load danh sách wishlist từ Backend API GET /wishlist?userId=xxx
 */
const loadWishlistFromBackend = async () => {
  const freshUserId = await getCurrentUserId();
  
  if (!freshUserId) {
    console.warn("No userId found, setting empty wishlist");
    savedProducts = [];
    loading = false;
    initialized = true;
    notifyListeners();
    return;
  }

  loading = true;
  notifyListeners();

  try {
    const response = await apiClient.get(`/wishlist?userId=${freshUserId}`);
    
    // Kiểm tra response theo format BE: {code: 1000, message: '...', data: [...]}
    if (response.data && response.data.code === 1000 && response.data.data) {
      savedProducts = response.data.data || [];
    } else {
      savedProducts = [];
    }
  } catch (error) {
    console.error("❌ Error loading wishlist:", error);
    
    // Xử lý các lỗi HTTP status code
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message || '';
      
      savedProducts = [];
    } else if (error.response?.status === 403) {
      console.error("❌ 403 Forbidden - Permission denied");
      savedProducts = [];
    } else if (error.response?.status === 500) {
      console.error("❌ Backend server error");
      savedProducts = [];
    } else if (error.response?.status === 401) {
      console.error("❌ 401 Unauthorized, redirecting to login");
      setTimeout(() => window.location.href = '/login', 100);
      return;
    } else {
      console.error("❌ Error loading wishlist:", error.response?.status);
      savedProducts = [];
    }
  } finally {
    loading = false;
    initialized = true;
    notifyListeners();
  }
};

// ===========================================
// CORE WISHLIST OPERATIONS - Các thao tác chính
// ===========================================

/**
 * Thêm sản phẩm vào wishlist (Frontend + Backend)
 */
const add = async (product) => {
  // Validate dữ liệu sản phẩm
  if (!product || !product.id) {
    console.error("❌ Invalid product data");
    return false;
  }

  // Kiểm tra đăng nhập
  if (!isUserLoggedIn()) {
    if (window.location.pathname !== '/login') {
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
    return false;
  }

  // Lấy user ID
  const freshUserId = await getCurrentUserId();
  if (!freshUserId) {
    console.error("❌ Cannot get current user ID");
    return false;
  }

  try {
    // Lưu vào database trước
    const success = await saveToDatabase(product);
    if (success) {
      // Cập nhật state frontend
      savedProducts.push({ ...product, userId: freshUserId });
      notifyListeners();
      return true;
    }
    return false;
  } catch (error) {
    console.error("❌ Error adding to wishlist:", error);
    return false;
  }
};

/**
 * Xóa sản phẩm khỏi wishlist (Frontend trước, Backend sau)
 */
const remove = async (productId) => {
  // Cập nhật state frontend ngay lập tức (UX tốt hơn)
  savedProducts = savedProducts.filter((p) => p.id !== productId);
  notifyListeners();
  
  // Kiểm tra đăng nhập
  if (!isUserLoggedIn()) {
    return;
  }

  // Lấy user ID
  const freshUserId = await getCurrentUserId();
  if (!freshUserId) {
    console.error("❌ Cannot get current user ID");
    return;
  }

  try {
    await removeFromDatabase(productId);
  } catch (error) {
    console.error("❌ Error removing from database:", error);
  }
};

/**
 * Toggle sản phẩm (thêm nếu chưa có, xóa nếu đã có)
 */
const toggle = async (product) => {
  if (!product || product.id == null) return;
  
  if (isSaved(product.id)) {
    await remove(product.id);
  } else {
    await add(product);
  }
};

// ===========================================
// STATE MANAGEMENT - Quản lý trạng thái
// ===========================================

/**
 * Subscribe để nhận thông báo khi state thay đổi
 */
const subscribe = (listener) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

/**
 * Lấy state hiện tại của wishlist
 */
const getCurrentState = () => {
  if (!initialized) {
    initializeWishlist();
  }
  
  // Guest user trả về empty state
  if (!isUserLoggedIn()) {
    return {
      savedProducts: [],
      loading: false,
      currentUserId: null,
      initialized: true
    };
  }
  
  return {
    savedProducts: [...savedProducts],
    loading,
    currentUserId,
    initialized
  };
};

/**
 * Reset toàn bộ state wishlist (khi logout)
 */
const resetWishlist = () => {
  savedProducts = [];
  loading = false;
  currentUserId = null;
  initialized = false;
  notifyListeners();
};

/**
 * Force refresh wishlist (khi login hoặc đổi account)
 */
const forceRefresh = async () => {
  initialized = false;
  const freshUserId = await getCurrentUserId();
  
  // Kiểm tra đổi account
  if (currentUserId && currentUserId !== freshUserId) {
    savedProducts = [];
  }
  
  currentUserId = freshUserId;
  
  if (freshUserId) {
    loadWishlistFromBackend();
  } else {
    savedProducts = [];
    loading = false;
    initialized = true;
    notifyListeners();
  }
};

/**
 * Cập nhật currentUserId khi user login (phát hiện đổi account)
 */
const updateCurrentUserId = async () => {
  const freshUserId = await getCurrentUserId();
  
  // Kiểm tra đổi account
  if (currentUserId && currentUserId !== freshUserId) {
    savedProducts = [];
    initialized = false;
  }
  
  currentUserId = freshUserId;
  
  // Force refresh nếu có user mới và chưa khởi tạo
  if (freshUserId && !initialized) {
    forceRefresh();
  }
};

/**
 * Kiểm tra sản phẩm đã được lưu trong wishlist chưa
 */
const isSaved = (productId) => {
  return savedProducts.some(p => p.id === productId);
};

/**
 * Khởi tạo wishlist service (App startup)
 */
const initializeWishlist = async () => {
  if (initialized) return;
  
  if (isUserLoggedIn()) {
    await loadWishlistFromBackend();
  } else {
    savedProducts = [];
    loading = false;
    initialized = true;
    notifyListeners();
  }
};

// ===========================================
// EXPORT SERVICE - Xuất service
// ===========================================

const wishlistService = {
  initializeWishlist,    // Khởi tạo service
  subscribe,             // Subscribe state changes
  add,                   // Thêm sản phẩm
  remove,                // Xóa sản phẩm
  toggle,                // Toggle sản phẩm
  isSaved,               // Kiểm tra đã lưu
  getCurrentState,       // Lấy state hiện tại
  resetWishlist,         // Reset state
  forceRefresh,          // Force refresh
  updateCurrentUserId    // Cập nhật user ID
};

export default wishlistService;