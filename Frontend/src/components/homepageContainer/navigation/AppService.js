import wishlistService from '../../../services/wishlistService';

// ===========================================
// APP SERVICE
// ===========================================
// Service này thay thế các đoạn code dài trong App.jsx
// Giúp App.jsx gọn gàng và dễ đọc hơn

/**
 * Khởi tạo các service cần thiết khi App load
 * @param {Object} user - User object hiện tại
 */
export const initializeAppServices = (user) => {
  wishlistService.initializeWishlist();
};

/**
 * Xử lý các service khi user login thành công
 * @param {Object} user - User object sau khi login
 * @param {Function} navigate - Navigate function từ React Router
 */
export const handleAppLogin = (user, navigate = null) => {
  // Cập nhật user ID hiện tại
  wishlistService.updateCurrentUserId();
  
  // Refresh wishlist từ Backend sau 500ms
  setTimeout(() => {
    wishlistService.forceRefresh();
  }, 500);
  
  // Sync guest wishlist với Backend sau 1000ms
  setTimeout(() => {
    wishlistService.checkAndSyncGuestWishlist();
    
    // Kiểm tra có cần redirect đến saved-posts không
    if (navigate) {
      const shouldRedirectToSaved = localStorage.getItem('redirectToSaved') === 'true';
      if (shouldRedirectToSaved) {
        localStorage.removeItem('redirectToSaved');
        // Đợi sync wishlist xong rồi redirect
        setTimeout(() => {
          navigate('/saved-posts');
        }, 1000); // Thêm 1s nữa để đảm bảo sync xong
      }
    }
  }, 1000);
};

/**
 * Xử lý các service khi user logout
 */
export const handleAppLogout = () => {
  wishlistService.resetWishlist();
};

/**
 * Lấy danh sách các route liên quan đến member features
 * @param {Object} user - User object hiện tại
 * @returns {Array} Array các route objects
 */
export const getMemberRoutes = (user) => {
  return [
    {
      path: "/saved-posts",
      element: "SavedPosts",
      props: { user },
      description: "Trang hiển thị tin đã lưu"
    }
  ];
};

/**
 * Kiểm tra xem có cần hiển thị member features không
 * @param {Object} user - User object hiện tại
 * @returns {boolean}
 */
export const shouldShowMemberFeatures = (user) => {
  return !!user; // Chỉ hiển thị khi có user
};

/**
 * Lấy wishlist state hiện tại
 * @returns {Object} Wishlist state
 */
export const getWishlistState = () => {
  return wishlistService.getCurrentState();
};

/**
 * Subscribe để nhận thông báo khi wishlist state thay đổi
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToWishlist = (callback) => {
  return wishlistService.subscribe(callback);
};

// ===========================================
// EXPORT DEFAULT OBJECT
// ===========================================
const AppService = {
  initializeAppServices,
  handleAppLogin,
  handleAppLogout,
  getMemberRoutes,
  shouldShowMemberFeatures,
  getWishlistState,
  subscribeToWishlist
};

export default AppService;
