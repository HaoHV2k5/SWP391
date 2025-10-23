// src/hooks/useStaff.js
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { productsApi, kycApi, handleApiError } from "../services/staffApi";
import {
  showSuccessNotification,
  showErrorNotification,
} from "../utils/notificationManager";

/* helper: bóc mảng từ nhiều dạng ApiResponse */
const pickArrayDeep = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  const keys = [
    "data",
    "content",
    "items",
    "results",
    "list",
    "payload",
    "records",
  ];
  for (const k of keys) {
    const v = raw?.[k];
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") {
      const deeper = pickArrayDeep(v);
      if (Array.isArray(deeper)) return deeper;
    }
  }
  if (raw?.data && typeof raw.data === "object") {
    const deeper = pickArrayDeep(raw.data);
    if (Array.isArray(deeper)) return deeper;
  }
  return [];
};

/* ================= Products ================= */
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const res =
        (await productsApi.getPending?.()) ??
        (await productsApi.getPendingProducts?.());
      const raw = res?.data ?? res ?? {};
      console.log("[STAFF] /products/pending payload:", raw);
      setProducts(pickArrayDeep(raw));
      if (typeof raw === "string" && raw.startsWith("<!DOCTYPE html>")) {
        throw new Error("Server trả HTML (có thể là trang login)"); // sẽ rơi vào catch và showErrorNotification
      }
    } catch (err) {
      showErrorNotification(handleApiError(err, "Không thể tải tin đăng"));
      setProducts([]);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  const approveProduct = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const fn = productsApi.approve || productsApi.approveProduct;
        await fn(id);
        // reload để chắc chắn đồng bộ với DB
        await loadProducts();
        showSuccessNotification("Duyệt tin đăng thành công");
      } catch (err) {
        showErrorNotification(handleApiError(err, "Không thể duyệt tin đăng"));
      } finally {
        setLoading(false);
      }
    },
    [loadProducts]
  );

  const rejectProduct = useCallback(
    async (id, reason) => {
      setLoading(true);
      try {
        const fn = productsApi.reject || productsApi.rejectProduct;
        await fn(id, reason);
        await loadProducts();
        showSuccessNotification("Đã từ chối tin đăng");
      } catch (err) {
        showErrorNotification(
          handleApiError(err, "Không thể từ chối tin đăng")
        );
      } finally {
        setLoading(false);
      }
    },
    [loadProducts]
  );

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
    rejectProduct,
  };
};

/* ================= KYC ================= */

// helper: chuẩn hoá id từ row hoặc giá trị truyền vào
const getKycId = (val) => {
  if (val && typeof val === "object") {
    const raw = val.kycId ?? val.id ?? val.kyc_id;
    return Number(raw);
  }
  return Number(val);
};

export const useKyc = () => {
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const loadKyc = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const res =
        (await kycApi.getPending?.()) ?? (await kycApi.getKycList?.());
      const raw = res?.data ?? res ?? {};
      if (typeof raw === "string" && raw.startsWith("<!DOCTYPE html>")) {
        throw new Error("Server trả HTML (có thể là trang login)"); // sẽ rơi vào catch và showErrorNotification
      }
      console.log("[STAFF] /kyc/staff payload:", raw);
      const items = pickArrayDeep(raw).map((x) => ({
        ...x,
        id: x.id ?? x.kycId ?? x.kyc_id, // đảm bảo table có "id"
      }));
      setKycList(items);
    } catch (err) {
      showErrorNotification(handleApiError(err, "Không thể tải danh sách KYC"));
      setKycList([]);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  const loadUserInfo = useCallback(async (idOrRow) => {
    const id = getKycId(idOrRow);
    try {
      const r = await kycApi.getUserInfo(id);
      return r?.data?.data ?? r?.data ?? r ?? null;
    } catch {
      return null;
    }
  }, []);

  const approveKyc = useCallback(
    async (idOrRow) => {
      setLoading(true);
      try {
        const id = getKycId(idOrRow);
        const fn = kycApi.approve || kycApi.approveKyc;
        await fn(id);
        await loadKyc(); // reload thay vì filter local
        showSuccessNotification("Duyệt KYC thành công");
      } catch (err) {
        showErrorNotification(handleApiError(err, "Không thể duyệt KYC"));
      } finally {
        setLoading(false);
      }
    },
    [loadKyc]
  );

  const rejectKyc = useCallback(
    async (idOrRow, reason) => {
      setLoading(true);
      try {
        const id = getKycId(idOrRow);
        const fn = kycApi.reject || kycApi.rejectKyc;
        await fn(id, reason);
        await loadKyc(); // reload thay vì filter local
        showSuccessNotification("Đã từ chối KYC");
      } catch (err) {
        showErrorNotification(handleApiError(err, "Không thể từ chối KYC"));
      } finally {
        setLoading(false);
      }
    },
    [loadKyc]
  );

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
    rejectKyc,
    loadUserInfo,
  };
};

/* ================= Stats (stub – chưa có API trong swagger) ================= */
export const useStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);
  return { stats, loading, reload };
};

/* ================= Auth guard ================= */
export const useStaffAuth = (user) => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  useEffect(() => {
    setIsCheckingAuth(false);
    const role = user?.user?.role ?? user?.role ?? user?.data?.role ?? null;
    if (role !== "ROLE_STAFF" && role !== "staff") {
      navigate("/");
      showErrorNotification("Bạn không có quyền truy cập trang staff!");
    }
  }, [user, navigate]);
  return { isCheckingAuth };
};

/* ===== Aliases để tương thích component cũ ===== */
export const usePendingProducts = () => {
  const h = useProducts();
  return {
    list: h.products,
    reload: h.loadProducts,
    approve: h.approveProduct,
    reject: h.rejectProduct,
    loading: h.loading,
    initial: h.isInitialLoading,
  };
};

export const usePendingKyc = () => {
  const h = useKyc();
  return {
    list: h.kycList,
    reload: h.loadKyc,
    approve: h.approveKyc,
    reject: h.rejectKyc,
    loading: h.loading,
    initial: h.isInitialLoading,
    loadUserInfo: h.loadUserInfo,
  };
};

export const usePendingComplaints = () => {
  const reload = useCallback(async () => {}, []);
  const approve = useCallback(async () => {}, []);
  const reject = useCallback(async () => {}, []);
  return { list: [], loading: false, initial: false, reload, approve, reject };
};
