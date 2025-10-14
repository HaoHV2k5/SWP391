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
      
      setProducts(result.data || []);
      console.log("✅ Products loaded:", result.data?.length || 0, "records");
      showSuccessNotification(`Đã tải ${result.data?.length || 0} tin đăng`);
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
      
      setProducts(prev => prev.map(p => 
        p.id === productId ? result.data : p
      ));
      
      showSuccessNotification("Duyệt tin đăng thành công!");
      console.log("✅ Product approved:", result.data);
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
      
      setProducts(prev => prev.map(p => 
        p.id === productId ? result.data : p
      ));
      
      showSuccessNotification("Từ chối tin đăng thành công!");
      console.log("✅ Product rejected:", result.data);
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
