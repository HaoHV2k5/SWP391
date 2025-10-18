/**
 * Custom Hooks for Staff functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { productsApi, kycApi, statsApi, handleApiError } from '../services/staffApi';
import { showSuccessNotification, showErrorNotification } from '../utils/notificationManager';

/**
 * Hook để quản lý Products data và actions
 */
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Load products data
  const loadProducts = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      console.log("🔄 Loading Products data from API...");
      const result = await productsApi.getPendingProducts();
      
      // Debug: Log the actual data structure
      console.log("🔍 Products API Response:", result);
      console.log("🔍 Products Data Structure:", result.data);
      console.log("🔍 Products Data Length:", result.data?.length || 0);
      
      if (result.data && result.data.length > 0) {
        console.log("🔍 First Product Item Structure:", result.data[0]);
        console.log("🔍 First Product Item Keys:", Object.keys(result.data[0]));
        
        // Log all products
        result.data.forEach((product, index) => {
          console.log(`🔍 Product ${index + 1}:`, {
            id: product.id,
            title: product.title || product.name || product.productName,
            status: product.status,
            valid: !!(product.id && (product.title || product.name || product.productName))
          });
        });
      }
      
      const validProducts = (result.data || []).filter(product => {
        const isValid = product && product.id && (product.title || product.name || product.productName);
        const isPending = product.status === 'PENDING';
        
        if (!isValid) {
          console.log("🔍 Invalid product filtered out:", product);
        }
        if (!isPending) {
          console.log("🔍 Non-pending product filtered out:", product);
        }
        
        return isValid && isPending;
      });
      
      console.log("🔍 Valid products count:", validProducts.length);
      console.log("🔍 All products count:", result.data?.length || 0);
      console.log("🔍 Filtered out:", (result.data?.length || 0) - validProducts.length, "invalid products");
      
      setProducts(validProducts);
      console.log("✅ Products loaded:", validProducts.length, "valid records out of", result.data?.length || 0, "total");
      
      // Show notification with correct count
      const totalProducts = result.data?.length || 0;
      const pendingProducts = validProducts.length;
      
      if (pendingProducts === totalProducts) {
        showSuccessNotification(`Đã tải ${pendingProducts} tin đăng chờ duyệt`);
      } else {
        showSuccessNotification(`Đã tải ${pendingProducts} tin đăng chờ duyệt (${totalProducts} tổng cộng)`);
      }
    } catch (error) {
      console.error("❌ Error loading products:", error);
      showErrorNotification(handleApiError(error, "Không thể tải dữ liệu tin đăng"));
      setProducts([]);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  // Approve product
  const approveProduct = useCallback(async (productId) => {
    setLoading(true);
    try {
      console.log("✅ Approving Product ID:", productId);
      const result = await productsApi.approveProduct(productId);
      console.log("🔍 API Response:", result);
      
      // Remove the approved product from the list since it's no longer PENDING
      // Convert both IDs to string for comparison to handle type mismatch
      setProducts(prev => {
        console.log("🔍 Before approval - All products:", prev.map(p => ({ id: p.id, title: p.title || p.productName })));
        console.log("🔍 Approving product ID:", productId, "Type:", typeof productId);
        
        const filtered = prev.filter(p => {
          const match = String(p.id) !== String(productId);
          console.log(`🔍 Product ${p.id} (${typeof p.id}) vs ${productId} (${typeof productId}): ${match ? 'KEEP' : 'REMOVE'}`);
          return match;
        });
        
        console.log("📋 Products before filter:", prev.length);
        console.log("📋 Products after filter:", filtered.length);
        console.log("📋 Removed product ID:", productId);
        console.log("🔍 After approval - Remaining products:", filtered.map(p => ({ id: p.id, title: p.title || p.productName })));
        
        return filtered;
      });
      
      showSuccessNotification("Duyệt tin đăng thành công! Tin đăng đã được loại bỏ khỏi danh sách chờ duyệt.");
      console.log("✅ Product approved and removed from list:", result.data);
    } catch (error) {
      console.error("❌ Error approving product:", error);
      showErrorNotification(handleApiError(error, "Có lỗi xảy ra khi duyệt tin đăng"));
    } finally {
      setLoading(false);
    }
  }, []);

  // Reject product
  const rejectProduct = useCallback(async (productId, reason) => {
    setLoading(true);
    try {
      console.log("❌ Rejecting Product ID:", productId, "Reason:", reason);
      const result = await productsApi.rejectProduct(productId, reason);
      console.log("🔍 API Response:", result);
      
      // Remove the rejected product from the list since it's no longer PENDING
      // Convert both IDs to string for comparison to handle type mismatch
      setProducts(prev => {
        console.log("🔍 Before rejection - All products:", prev.map(p => ({ id: p.id, title: p.title || p.productName })));
        console.log("🔍 Rejecting product ID:", productId, "Type:", typeof productId);
        
        const filtered = prev.filter(p => {
          const match = String(p.id) !== String(productId);
          console.log(`🔍 Product ${p.id} (${typeof p.id}) vs ${productId} (${typeof productId}): ${match ? 'KEEP' : 'REMOVE'}`);
          return match;
        });
        
        console.log("📋 Products before filter:", prev.length);
        console.log("📋 Products after filter:", filtered.length);
        console.log("📋 Removed product ID:", productId);
        console.log("🔍 After rejection - Remaining products:", filtered.map(p => ({ id: p.id, title: p.title || p.productName })));
        
        return filtered;
      });
      
      showSuccessNotification("Từ chối tin đăng thành công! Tin đăng đã được loại bỏ khỏi danh sách chờ duyệt.");
      console.log("✅ Product rejected and removed from list:", result.data);
    } catch (error) {
      console.error("❌ Error rejecting product:", error);
      showErrorNotification(handleApiError(error, "Có lỗi xảy ra khi từ chối tin đăng"));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    setProducts,
    loading,
    isInitialLoading,
    loadProducts,
    approveProduct,
    rejectProduct
  };
};

/**
 * Hook để quản lý KYC data và actions
 */
export const useKyc = () => {
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Load KYC data
  const loadKyc = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      console.log("🔄 Loading KYC data from API...");
      const result = await kycApi.getKycList();
      
      // Debug: Log the actual data structure
      console.log("🔍 KYC API Response:", result);
      console.log("🔍 KYC Data Structure:", result.data);
      if (result.data && result.data.length > 0) {
        console.log("🔍 First KYC Item Structure:", result.data[0]);
        console.log("🔍 First KYC Item Keys:", Object.keys(result.data[0]));
      }
      
      setKycList(result.data || []);
      console.log("✅ KYC loaded:", result.data?.length || 0, "records");
      showSuccessNotification(`Đã tải ${result.data?.length || 0} hồ sơ KYC`);
    } catch (error) {
      console.error("❌ Error loading KYC:", error);
      showErrorNotification(handleApiError(error, "Không thể tải dữ liệu KYC"));
      setKycList([]);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  // Approve KYC
  const approveKyc = useCallback(async (kycId) => {
    setLoading(true);
    try {
      console.log("✅ Approving KYC ID:", kycId);
      const result = await kycApi.approveKyc(kycId);
      
      setKycList(prev => prev.map(k => 
        k.id === kycId ? result.data : k
      ));
      
      showSuccessNotification("Duyệt KYC thành công!");
      console.log("✅ KYC approved:", result.data);
    } catch (error) {
      console.error("❌ Error approving KYC:", error);
      showErrorNotification(handleApiError(error, "Có lỗi xảy ra khi duyệt KYC"));
    } finally {
      setLoading(false);
    }
  }, []);

  // Reject KYC
  const rejectKyc = useCallback(async (kycId, reason) => {
    setLoading(true);
    try {
      console.log("❌ Rejecting KYC ID:", kycId, "Reason:", reason);
      const result = await kycApi.rejectKyc(kycId, reason);
      
      setKycList(prev => prev.map(k => 
        k.id === kycId ? result.data : k
      ));
      
      showSuccessNotification("Từ chối KYC thành công!");
      console.log("✅ KYC rejected:", result.data);
    } catch (error) {
      console.error("❌ Error rejecting KYC:", error);
      showErrorNotification(handleApiError(error, "Có lỗi xảy ra khi từ chối KYC"));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load KYC on mount
  useEffect(() => {
    loadKyc();
  }, [loadKyc]);

  return {
    kycList,
    setKycList,
    loading,
    isInitialLoading,
    loadKyc,
    approveKyc,
    rejectKyc
  };
};

/**
 * Hook để quản lý Stats data
 */
export const useStats = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingProducts: 0,
    approvedProducts: 0,
    rejectedProducts: 0,
    totalKyc: 0,
    pendingKyc: 0,
    approvedKyc: 0,
  });
  const [loading, setLoading] = useState(false);

  // Load stats
  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      console.log("🔄 Loading stats from API...");
      const result = await statsApi.getAllStats();
      
      setStats(result.data);
      console.log("✅ Stats loaded successfully");
    } catch (error) {
      console.error("❌ Error loading stats:", error);
      showErrorNotification(handleApiError(error, "Không thể tải thống kê"));
    } finally {
      setLoading(false);
    }
  }, []);

  // Update stats when products or KYC change
  const updateStats = useCallback((products, kycList) => {
    setStats(prev => ({
      ...prev,
      totalProducts: products.length,
      pendingProducts: products.filter(p => p.status === 'PENDING').length,
      approvedProducts: products.filter(p => p.status === 'STAFF_APPROVED' || p.status === 'ADMIN_APPROVED').length,
      rejectedProducts: products.filter(p => p.status === 'REJECTED').length,
      totalKyc: kycList.length,
      pendingKyc: kycList.filter(k => k.status === 'PENDING').length,
      approvedKyc: kycList.filter(k => k.status === 'STAFF_APPROVED' || k.status === 'ADMIN_APPROVED').length,
    }));
  }, []);

  return {
    stats,
    setStats,
    loading,
    loadStats,
    updateStats
  };
};

/**
 * Hook để quản lý Staff authentication và authorization
 */
export const useStaffAuth = (user, navigate) => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Kiểm tra nếu không có user -> redirect về login
    if (!user) {
      setIsCheckingAuth(true);
      const timer = setTimeout(() => {
        if (!user) {
          navigate("/login");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    setIsCheckingAuth(false);

    // Xác định role của user từ các cấu trúc khác nhau
    let userRole = null;
    if (user.user && user.user.role) {
      userRole = user.user.role;
    } else if (user.role) {
      userRole = user.role;
    }

    // Kiểm tra quyền truy cập - chỉ cho phép ROLE_STAFF hoặc staff
    if (userRole !== "ROLE_STAFF" && userRole !== "staff") {
      navigate("/");
      showErrorNotification("Bạn không có quyền truy cập trang staff!");
      return;
    }
  }, [user, navigate]);

  return { isCheckingAuth };
};
