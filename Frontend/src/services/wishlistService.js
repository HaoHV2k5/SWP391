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
      console.log("✅ Product saved to database wishlist");
      return true;
    } else {
      console.error("❌ Failed to save to database:", response.data?.message);
      return false;
    }
  } catch (error) {
    console.error("❌ Error saving to database:", error);
    
    // Xử lý lỗi 400 - Wishlist không tồn tại (không nên xảy ra với account mới)
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message || '';
      
      if (errorMessage.includes('WISHLIST_NOT_EXISTED') || 
          errorMessage.includes('wishlist') ||
          errorMessage.includes('Người dùng không có wishlist')) {
        console.log("⚠️ Wishlist not existed - this should not happen with new accounts");
        return false;
      }
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
      console.log("✅ Product removed from database wishlist");
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
      console.log("✅ Loaded wishlist from database:", savedProducts.length, "products");
    } else {
      console.log("⚠️ API response not successful, setting empty wishlist");
      savedProducts = [];
    }
  } catch (error) {
    console.error("❌ Error loading wishlist:", error);
    
    // Xử lý các lỗi HTTP status code
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message || '';
      
      if (errorMessage.includes('WISHLIST_NOT_EXISTED') || 
          errorMessage.includes('wishlist') ||
          errorMessage.includes('Người dùng không có wishlist')) {
        console.log("⚠️ Wishlist not existed - this should not happen with new accounts");
        savedProducts = [];
      } else {
        console.error("❌ Other 400 error:", errorMessage);
        savedProducts = [];
      }
    } else if (error.response?.status === 403) {
      console.error("❌ Forbidden - User does not have ROLE_USER permission");
      savedProducts = [];
    } else if (error.response?.status === 500) {
      console.error("❌ Backend server error:", error.response?.data?.message);
      savedProducts = [];
    } else if (error.response?.status === 401) {
      console.log("⚠️ Unauthorized, redirecting to login");
      setTimeout(() => window.location.href = '/login', 100);
      return;
    } else {
      console.error("❌ Unknown error:", error.response?.status);
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
    console.warn("⚠️ User not logged in, redirecting to login");
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
      console.log("✅ Product added to database wishlist");
      // Cập nhật state frontend
      savedProducts.push({ ...product, userId: freshUserId });
      notifyListeners();
      return true;
    } else {
      console.error("❌ Failed to save to database");
      return false;
    }
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
    console.warn("⚠️ User not logged in");
    return;
  }

  // Lấy user ID
  const freshUserId = await getCurrentUserId();
  if (!freshUserId) {
    console.error("❌ Cannot get current user ID");
    return;
  }

  try {
    // Xóa khỏi database
    const success = await removeFromDatabase(productId);
    if (success) {
      console.log("✅ Product removed from database wishlist");
    } else {
      console.error("❌ Failed to remove from database");
    }
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
  console.log("🔄 Force refreshing wishlist...");
  initialized = false;
  const freshUserId = await getCurrentUserId();
  
  // Kiểm tra đổi account
  if (currentUserId && currentUserId !== freshUserId) {
    console.log("🔄 User changed from", currentUserId, "to", freshUserId, "- clearing old data");
    savedProducts = [];
  }
  
  currentUserId = freshUserId;
  
  if (freshUserId) {
    // Load từ Backend
    loadWishlistFromBackend();
  } else {
    // Set empty nếu không có userId
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
    console.log("🔄 Account switched from", currentUserId, "to", freshUserId);
    console.log("🔄 Clearing old wishlist data and refreshing...");
    savedProducts = [];
    initialized = false;
  }
  
  currentUserId = freshUserId;
  
  // Force refresh nếu có user mới và chưa khởi tạo
  if (freshUserId && !initialized) {
    console.log("🔄 New user detected, initializing wishlist...");
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
    console.log("🔄 Initializing wishlist for logged-in user...");
    await loadWishlistFromBackend();
  } else {
    console.log("ℹ️ User not logged in, setting empty wishlist");
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