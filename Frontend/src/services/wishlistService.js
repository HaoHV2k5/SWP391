import apiClient from './apiClient';

// ===========================================
// GLOBAL STATE MANAGEMENT
// ===========================================

let savedProducts = [];        // Danh sách sản phẩm đã lưu
let loading = false;           // Trạng thái loading
let currentUserId = null;      // ID user hiện tại
let initialized = false;       // Đã khởi tạo chưa
let listeners = [];            // Danh sách listeners để notify khi state thay đổi

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Thông báo cho tất cả listeners khi state thay đổi
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
 * Lấy user ID từ localStorage
 * Ưu tiên: userData > savedProducts > wallet_balance keys
 */
const getCurrentUserId = () => {
  try {
    const userData = localStorage.getItem("userData");
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    
    // Nếu có userData, parse và lấy userId
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const userId = user.user?.id || user.id || user.email || user.user?.email;
        if (userId) return userId;
      } catch (error) {
        console.error("Error parsing userData:", error);
      }
    }
    
    // Fallback: lấy từ savedProducts
    const savedProducts = localStorage.getItem("savedProducts");
    if (savedProducts) {
      try {
        const products = JSON.parse(savedProducts);
        if (products.length > 0 && products[0].userId) {
          return products[0].userId;
        }
      } catch (error) {
        console.error("Error parsing savedProducts:", error);
      }
    }
    
    // Fallback: lấy từ wallet_balance keys
    const walletKeys = Object.keys(localStorage).filter(key => key.startsWith('wallet_balance_'));
    if (walletKeys.length > 0) {
      return walletKeys[0].replace('wallet_balance_', '');
    }
    
  } catch (error) {
    console.error("Error getting user ID:", error);
  }
  return null;
};

/**
 * Kiểm tra user có đăng nhập không
 */
const isUserLoggedIn = () => {
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");
  return !!(token || refreshToken);
};

// ===========================================
// LOCAL STORAGE OPERATIONS
// ===========================================

/**
 * Lưu sản phẩm vào localStorage với timestamp
 */
const saveToLocalStorage = (product, userId) => {
  try {
    const productWithMetadata = { 
      ...product, 
      userId,
      addedAt: new Date().toISOString() // Thêm timestamp
    };
    const existingData = JSON.parse(localStorage.getItem("savedProducts")) || [];
    
    if (!existingData.some(p => p.id === product.id)) {
      existingData.push(productWithMetadata);
      localStorage.setItem("savedProducts", JSON.stringify(existingData));
    }
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

/**
 * Xóa sản phẩm khỏi localStorage
 */
const removeFromLocalStorage = (productId) => {
  try {
    const existingData = JSON.parse(localStorage.getItem("savedProducts")) || [];
    const filteredData = existingData.filter(p => p.id !== productId);
    localStorage.setItem("savedProducts", JSON.stringify(filteredData));
  } catch (error) {
    console.error("Error removing from localStorage:", error);
  }
};

/**
 * Lưu sản phẩm vào guestWishlist (cho user chưa đăng nhập)
 */
const saveToGuestWishlist = (product) => {
  try {
    const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist")) || [];
    if (!guestWishlist.some(p => p.id === product.id)) {
      guestWishlist.push(product);
      localStorage.setItem("guestWishlist", JSON.stringify(guestWishlist));
    }
  } catch (error) {
    console.error("Error saving to guestWishlist:", error);
  }
};

/**
 * Xóa sản phẩm khỏi guestWishlist
 */
const removeFromGuestWishlist = (productId) => {
  try {
    const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist")) || [];
    const filteredGuestWishlist = guestWishlist.filter(p => p.id !== productId);
    localStorage.setItem("guestWishlist", JSON.stringify(filteredGuestWishlist));
  } catch (error) {
    console.error("Error removing from guestWishlist:", error);
  }
};

// ===========================================
// DATA LOADING FUNCTIONS
// ===========================================

/**
 * Load dữ liệu từ localStorage (cho guest users)
 */
const loadFromLocalStorage = () => {
  try {
    // Guest chỉ load từ savedProducts, không load guestWishlist
    const savedProductsStored = JSON.parse(localStorage.getItem("savedProducts")) || [];
    savedProducts = savedProductsStored;
    initialized = true;
    notifyListeners();
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    savedProducts = [];
    initialized = true;
    notifyListeners();
  }
};

/**
 * Load dữ liệu từ Backend API
 */
const loadWishlistFromBackend = async () => {
  const freshUserId = getCurrentUserId();
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");
  
  // Nếu không có auth data, load từ localStorage
  if (!freshUserId && !token && !refreshToken) {
    loadFromLocalStorage();
    return;
  }
  
  if (!token && !refreshToken) {
    loadFromLocalStorage();
    return;
  }
  
  loading = true;
  notifyListeners();
  
  try {
    const response = await apiClient.get(`/wishlist?userId=${freshUserId}`);
    if (response.data && response.data.success && response.data.data) {
      savedProducts = response.data.data || [];
    } else {
      // API response không thành công, fallback về localStorage
      loadFromLocalStorage();
      return;
    }
  } catch (error) {
    console.error("Error loading wishlist:", error);
    
    // Xử lý lỗi WISHLIST_NOT_EXISTED
    if (error.response?.data?.message?.includes('WISHLIST_NOT_EXISTED') || 
        error.response?.data?.message?.includes('wishlist')) {
      console.log("⚠️ Wishlist not existed during load, creating new one...");
      await handleWishlistNotExistedError(freshUserId);
      
      // Retry load operation sau khi tạo wishlist
      try {
        const retryResponse = await apiClient.get(`/wishlist?userId=${freshUserId}`);
        if (retryResponse.data && retryResponse.data.success && retryResponse.data.data) {
          savedProducts = retryResponse.data.data || [];
        } else {
          loadFromLocalStorage();
          return;
        }
      } catch (retryError) {
        console.error("Retry load failed, falling back to localStorage:", retryError);
        loadFromLocalStorage();
        return;
      }
    } else {
      // Với mọi lỗi khác, fallback về localStorage
      loadFromLocalStorage();
      return;
    }
  } finally {
    loading = false;
    initialized = true;
    notifyListeners();
  }
};

/**
 * Sync guest wishlist với Backend sau khi login
 */
const syncGuestWishlistWithBackend = async () => {
  try {
    const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist")) || [];
    const freshUserId = getCurrentUserId();
    
    if (guestWishlist.length > 0 && freshUserId) {
      // Merge guest wishlist với savedProducts để hiển thị ngay
      const existingSavedProducts = JSON.parse(localStorage.getItem("savedProducts")) || [];
      const mergedProducts = [...existingSavedProducts];
      
      for (const product of guestWishlist) {
        // Thêm vào merged products nếu chưa tồn tại
        if (!mergedProducts.some(p => p.id === product.id)) {
          mergedProducts.push({ ...product, userId: freshUserId });
        }
        
        // Thử sync với Backend
        try {
          const response = await apiClient.post("/wishlist/add", { 
            productId: product.id, 
            userId: freshUserId 
          });
          if (response.data && response.data.success) {
            // Sync thành công
          } else {
            // Sync thất bại, giữ trong localStorage
          }
        } catch (error) {
          // Xử lý lỗi WISHLIST_NOT_EXISTED trong sync
          if (error.response?.data?.message?.includes('WISHLIST_NOT_EXISTED') || 
              error.response?.data?.message?.includes('wishlist')) {
            console.log("⚠️ Wishlist not existed during sync, creating new one...");
            await handleWishlistNotExistedError(freshUserId);
            
            // Retry sync sau khi tạo wishlist
            try {
              const retryResponse = await apiClient.post("/wishlist/add", { 
                productId: product.id, 
                userId: freshUserId 
              });
              if (retryResponse.data && retryResponse.data.success) {
                console.log("✅ Product synced after creating wishlist");
              }
            } catch (retryError) {
              console.error("Retry sync failed:", retryError);
            }
          }
          // Sync thất bại, giữ trong localStorage
        }
      }
      
      // Cập nhật localStorage với dữ liệu đã merge
      localStorage.setItem("savedProducts", JSON.stringify(mergedProducts));
      
      // Cập nhật state ngay lập tức
      savedProducts = mergedProducts;
      notifyListeners();
      
      // Xóa guestWishlist
      localStorage.removeItem("guestWishlist");
      
      // Thử load từ Backend (sẽ fallback về localStorage nếu lỗi)
      setTimeout(() => loadWishlistFromBackend(), 500);
    }
  } catch (error) {
    console.error("Error syncing guest wishlist:", error);
    loadFromLocalStorage();
  }
};

// ===========================================
// INITIALIZATION
// ===========================================

/**
 * Khởi tạo wishlist service
 */
const initializeWishlist = () => {
  const freshUserId = getCurrentUserId();
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");
  currentUserId = freshUserId;
  
  if ((freshUserId || token || refreshToken) && !initialized) {
    // User đã đăng nhập
    const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist")) || [];
    if (guestWishlist.length > 0) {
      // Có guest wishlist cần sync
      syncGuestWishlistWithBackend();
    } else {
      // Load từ Backend
      loadWishlistFromBackend();
    }
  } else if (!initialized) {
    // Guest user, load từ localStorage
    loadFromLocalStorage();
  }
};

// ===========================================
// WISHLIST VALIDATION & CREATION
// ===========================================

/**
 * Xử lý khi wishlist không tồn tại
 * Backend tự tạo wishlist khi user đăng ký, Frontend chỉ fallback
 */
const createWishlistForUser = async (userId) => {
  console.log("⚠️ Wishlist not existed for user:", userId);
  console.log("📝 Backend should auto-create wishlist during registration");
  console.log("📝 Creating fallback wishlist in localStorage");
  
  // Backend tự tạo wishlist khi user đăng ký, Frontend chỉ fallback
  const emptyWishlist = [];
  localStorage.setItem("savedProducts", JSON.stringify(emptyWishlist));
  return true;
};

/**
 * Validate One-to-One relationship (mỗi user chỉ có 1 wishlist)
 */
const validateWishlistOwnership = (userId) => {
  const savedProducts = JSON.parse(localStorage.getItem("savedProducts")) || [];
  const userWishlist = savedProducts.filter(p => p.userId === userId);
  return userWishlist.length > 0;
};

/**
 * Xử lý lỗi WISHLIST_NOT_EXISTED
 * Backend không có API tạo wishlist riêng, chỉ fallback về localStorage
 */
const handleWishlistNotExistedError = async (userId) => {
  console.log("⚠️ Wishlist not existed for user:", userId);
  console.log("📝 Backend should have created wishlist during user registration");
  console.log("📝 Falling back to localStorage for now");
  
  // Tạo fallback wishlist trong localStorage
  await createWishlistForUser(userId);
  return true;
};

// ===========================================
// CORE WISHLIST OPERATIONS
// ===========================================

/**
 * Kiểm tra sản phẩm có được lưu không
 */
const isSaved = (productId) => {
  // Guest không thấy sản phẩm nào được lưu
  if (!isUserLoggedIn()) {
    return false;
  }
  
  return savedProducts.some((p) => p?.id === productId);
};

/**
 * Thêm sản phẩm vào wishlist
 */
const add = async (product) => {
  if (!product || product.id == null) return;
  if (isSaved(product.id)) return;

  // Thêm vào state trước
  savedProducts = [...savedProducts, product];
  notifyListeners();

  const freshUserId = getCurrentUserId();
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");
  
  // Nếu chưa đăng nhập, lưu vào guestWishlist và redirect login
  if (!token && !refreshToken) {
    saveToGuestWishlist(product);
    
    // Xóa khỏi state vì guest không nên thấy
    savedProducts = savedProducts.filter((p) => p.id !== product.id);
    notifyListeners();
    
    if (window.location.pathname !== '/login') {
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
    return;
  }
  
  // Lấy userId nếu cần
  if (!freshUserId && token) {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const userId = user.user?.id || user.id || user.email || user.user?.email;
        if (userId) {
          currentUserId = userId;
        } else {
          setTimeout(() => window.location.href = '/login', 100);
          return;
        }
      } catch (error) {
        setTimeout(() => window.location.href = '/login', 100);
        return;
      }
    } else {
      setTimeout(() => window.location.href = '/login', 100);
      return;
    }
  }

  const finalUserId = freshUserId || currentUserId;

  // Gọi Backend API
  try {
    const response = await apiClient.post("/wishlist/add", { 
      productId: product.id, 
      userId: finalUserId 
    });
    
    if (!response.data || !response.data.success) {
      // API thất bại, fallback về localStorage
      saveToLocalStorage(product, finalUserId);
    }
  } catch (error) {
    // Xử lý lỗi WISHLIST_NOT_EXISTED
    if (error.response?.data?.message?.includes('WISHLIST_NOT_EXISTED') || 
        error.response?.data?.message?.includes('wishlist')) {
      console.log("⚠️ Wishlist not existed, creating new one...");
      await handleWishlistNotExistedError(finalUserId);
      
      // Retry add operation sau khi tạo wishlist
      try {
        const retryResponse = await apiClient.post("/wishlist/add", { 
          productId: product.id, 
          userId: finalUserId 
        });
        if (retryResponse.data && retryResponse.data.success) {
          console.log("✅ Product added after creating wishlist");
          return;
        }
      } catch (retryError) {
        console.error("Retry failed, falling back to localStorage:", retryError);
      }
    }
    
    // Với mọi lỗi khác, fallback về localStorage
    saveToLocalStorage(product, finalUserId);
  }
};

/**
 * Xóa sản phẩm khỏi wishlist
 */
const remove = async (productId) => {
  savedProducts = savedProducts.filter((p) => p.id !== productId);
  notifyListeners();
  
  const freshUserId = getCurrentUserId();
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");
  
  // Luôn xóa khỏi localStorage
  removeFromLocalStorage(productId);
  removeFromGuestWishlist(productId);
  
  // Gọi Backend API nếu đã đăng nhập
  if ((freshUserId || token || refreshToken) && (token || refreshToken)) {
    const finalUserId = freshUserId || currentUserId;
    try {
      const response = await apiClient.delete(`/wishlist/delete?productId=${productId}&userId=${finalUserId}`);
      // Không cần xử lý response vì đã xóa khỏi localStorage
    } catch (error) {
      // Xử lý lỗi WISHLIST_NOT_EXISTED
      if (error.response?.data?.message?.includes('WISHLIST_NOT_EXISTED') || 
          error.response?.data?.message?.includes('wishlist')) {
        console.log("⚠️ Wishlist not existed during delete, creating new one...");
        await handleWishlistNotExistedError(finalUserId);
      }
      // Không cần xử lý error khác vì đã xóa khỏi localStorage
    }
  }
};

/**
 * Toggle sản phẩm (thêm/xóa)
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
// STATE MANAGEMENT
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
 * Lấy state hiện tại
 */
const getCurrentState = () => {
  if (!initialized) {
    loadFromLocalStorage();
  }
  
  // Guest trả về empty state
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
 * Reset wishlist service (khi logout)
 */
const resetWishlist = () => {
  savedProducts = [];
  loading = false;
  currentUserId = null;
  initialized = false;
  notifyListeners();
};

/**
 * Force refresh wishlist (khi login)
 */
const forceRefresh = () => {
  initialized = false;
  const freshUserId = getCurrentUserId();
  currentUserId = freshUserId;
  
  if (freshUserId) {
    const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist")) || [];
    if (guestWishlist.length > 0) {
      // Có guest wishlist cần sync
      syncGuestWishlistWithBackend();
    } else {
      // Load từ Backend
      loadWishlistFromBackend();
    }
  } else {
    initializeWishlist();
  }
};

/**
 * Check và sync guest wishlist khi user login
 */
const checkAndSyncGuestWishlist = () => {
  const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist")) || [];
  const freshUserId = getCurrentUserId();
  
  if (guestWishlist.length > 0 && freshUserId) {
    syncGuestWishlistWithBackend();
  }
};

/**
 * Cập nhật currentUserId khi user login
 */
const updateCurrentUserId = () => {
  const freshUserId = getCurrentUserId();
  currentUserId = freshUserId;
};

// ===========================================
// EXPORT SERVICE
// ===========================================

const wishlistService = {
  // State management methods
  initializeWishlist,
  subscribe,
  add,
  remove,
  toggle,
  isSaved,
  getCurrentState,
  resetWishlist,
  forceRefresh,
  checkAndSyncGuestWishlist,
  updateCurrentUserId,
  
  // New methods for enhanced functionality
  createWishlistForUser,
  validateWishlistOwnership,
  handleWishlistNotExistedError
};

export default wishlistService;