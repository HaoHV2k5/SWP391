import wishlistService from '../../../services/wishlistService';

// ===========================================
// APP SERVICE - Quản lý các service app-wide
// ===========================================

/**
 * Khởi tạo các service khi App load
 */
export const initializeAppServices = (user) => {
  wishlistService.initializeWishlist();
};

/**
 * Xử lý service khi user login thành công
 */
export const handleAppLogin = (user, navigate = null) => {
  // Cập nhật user ID hiện tại
  wishlistService.updateCurrentUserId();
  
  // Refresh wishlist từ Backend
  setTimeout(async () => {
    await wishlistService.forceRefresh();
    
    // Kiểm tra redirect đến saved-posts hoặc post-ad
    if (navigate) {
      const shouldRedirectToSaved = localStorage.getItem('redirectToSaved') === 'true';
      const shouldRedirectToPostAd = localStorage.getItem('redirectToPostAd') === 'true';
      
      if (shouldRedirectToPostAd) {
        localStorage.removeItem('redirectToPostAd');
        setTimeout(() => {
          navigate('/post-ad');
        }, 500);
      } else if (shouldRedirectToSaved) {
        localStorage.removeItem('redirectToSaved');
        setTimeout(() => {
          navigate('/saved-posts');
        }, 500);
      }
    }
  }, 500);
};

/**
 * Xử lý service khi user logout
 */
export const handleAppLogout = () => {
  wishlistService.resetWishlist();
};

/**
 * Lấy danh sách member routes
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
 * Kiểm tra có hiển thị member features không
 */
export const shouldShowMemberFeatures = (user) => {
  return !!user;
};

/**
 * Lấy wishlist state hiện tại
 */
export const getWishlistState = () => {
  return wishlistService.getCurrentState();
};

/**
 * Subscribe wishlist state changes
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