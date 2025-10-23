import { createContext, useContext, useEffect, useMemo, useState } from "react";
import wishlistService from "../../../services/wishlistService";

const SavedProductsContext = createContext(null);

export const SavedProductsProvider = ({ children }) => {
  const [savedProducts, setSavedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Lấy userId từ localStorage
  useEffect(() => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        const userId = user.user?.id || user.id;
        setCurrentUserId(userId);
      }
    } catch (error) {
      console.error("Error getting user ID:", error);
    }
  }, []);

  // Load wishlist từ backend khi có userId
  useEffect(() => {
    if (currentUserId && !initialized) {
      loadWishlistFromBackend();
    } else if (!currentUserId && !initialized) {
      // Nếu không có userId, load từ localStorage
      loadFromLocalStorage();
      setInitialized(true);
    }
  }, [currentUserId, initialized]);

  // Load wishlist từ backend
  const loadWishlistFromBackend = async () => {
    if (!currentUserId) return;
    
    setLoading(true);
    try {
      const result = await wishlistService.getWishlist(currentUserId);
      if (result.success) {
        setSavedProducts(result.data || []);
        console.log("✅ Loaded wishlist from backend:", result.data?.length || 0, "items");
      } else {
        console.error("Failed to load wishlist:", result.message);
        
        // Nếu backend API không khả dụng (403), fallback về localStorage
        if (result.fallbackToLocal) {
          console.log("🔄 Backend API không khả dụng, sử dụng localStorage");
          loadFromLocalStorage();
        } else {
          // Fallback to localStorage nếu backend fail
          loadFromLocalStorage();
        }
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
      // Fallback to localStorage nếu backend fail
      loadFromLocalStorage();
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  // Fallback: Load từ localStorage
  const loadFromLocalStorage = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("savedProducts")) || [];
      setSavedProducts(Array.isArray(stored) ? stored : []);
      console.log("📦 Loaded wishlist from localStorage:", stored.length, "items");
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      setSavedProducts([]);
    }
  };

  // Sync với localStorage (backup)
  useEffect(() => {
    if (initialized) {
      localStorage.setItem("savedProducts", JSON.stringify(savedProducts));
    }
  }, [savedProducts, initialized]);

  const isSaved = (productId) => savedProducts.some((p) => p?.id === productId);

  const add = async (product) => {
    if (!product || product.id == null) return;
    
    // Nếu đã có trong danh sách, không thêm nữa
    if (savedProducts.some((p) => p.id === product.id)) return;

    // Thêm vào state trước (optimistic update)
    setSavedProducts((prev) => [...prev, product]);

    // Gọi API backend nếu có userId
    if (currentUserId) {
      try {
        const result = await wishlistService.addToWishlist(product.id, currentUserId);
        if (!result.success) {
          // Nếu backend API không khả dụng (403), không revert state
          if (result.fallbackToLocal) {
            console.log("⚠️ Backend API không khả dụng, dữ liệu đã lưu local");
          } else {
            // Nếu API fail vì lý do khác, revert lại state
            setSavedProducts((prev) => prev.filter((p) => p.id !== product.id));
            console.error("Failed to add to wishlist:", result.message);
          }
        } else {
          console.log("✅ Added to backend wishlist:", product.id);
        }
      } catch (error) {
        // Nếu API fail, revert lại state
        setSavedProducts((prev) => prev.filter((p) => p.id !== product.id));
        console.error("Error adding to wishlist:", error);
      }
    }
  };

  const remove = async (productId) => {
    // Xóa khỏi state trước (optimistic update)
    setSavedProducts((prev) => prev.filter((p) => p.id !== productId));

    // Gọi API backend nếu có userId
    if (currentUserId) {
      try {
        const result = await wishlistService.removeFromWishlist(productId, currentUserId);
        if (!result.success) {
          // Nếu backend API không khả dụng (403), không reload
          if (result.fallbackToLocal) {
            console.log("⚠️ Backend API không khả dụng, dữ liệu đã xóa local");
          } else {
            // Nếu API fail vì lý do khác, reload từ backend
            loadWishlistFromBackend();
            console.error("Failed to remove from wishlist:", result.message);
          }
        } else {
          console.log("✅ Removed from backend wishlist:", productId);
        }
      } catch (error) {
        // Nếu API fail, reload từ backend
        loadWishlistFromBackend();
        console.error("Error removing from wishlist:", error);
      }
    }
  };

  const toggle = async (product) => {
    if (!product || product.id == null) return;
    
    const isCurrentlySaved = savedProducts.some((p) => p.id === product.id);
    
    if (isCurrentlySaved) {
      await remove(product.id);
    } else {
      await add(product);
    }
  };

  const clear = () => setSavedProducts([]);

  const refresh = () => {
    if (currentUserId) {
      loadWishlistFromBackend();
    }
  };

  const value = useMemo(
    () => ({ 
      savedProducts, 
      add, 
      remove, 
      toggle, 
      isSaved, 
      clear, 
      loading, 
      refresh, 
      initialized,
      currentUserId 
    }),
    [savedProducts, loading, initialized, currentUserId]
  );

  return <SavedProductsContext.Provider value={value}>{children}</SavedProductsContext.Provider>;
};

export const useSavedProducts = () => {
  const ctx = useContext(SavedProductsContext);
  if (!ctx) throw new Error("useSavedProducts must be used within SavedProductsProvider");
  return ctx;
};


