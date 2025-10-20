// src/hooks/useStaff.js
import { useState, useEffect, useCallback } from "react";
import {
  productsApi,
  kycApi,
  statsApi,
  handleApiError,
} from "../services/staffApi";
import {
  showSuccessNotification,
  showErrorNotification,
} from "../utils/notificationManager";

import { firstNonEmpty, resolveImageUrl } from "../utils/staffUtils";

/* ------------------------------------------------------------------
   Small helper: concurrency limiter for detail enrichment
------------------------------------------------------------------- */
const withConcurrency = async (items, limit, worker) => {
  const ret = new Array(items.length);
  let idx = 0,
    running = 0;

  return new Promise((resolve) => {
    const next = () => {
      if (idx === items.length && running === 0) return resolve(ret);
      while (running < limit && idx < items.length) {
        const cur = idx++;
        running++;
        Promise.resolve(worker(items[cur], cur))
          .then((v) => (ret[cur] = v))
          .catch(() => (ret[cur] = items[cur]))
          .finally(() => {
            running--;
            next();
          });
      }
    };
    next();
  });
};

/* ------------------------------------------------------------------
   PRODUCTS HOOK
------------------------------------------------------------------- */
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const res = await productsApi.getPendingProducts();

      const pickArray = (raw) => {
        if (Array.isArray(raw)) return raw;
        if (Array.isArray(raw?.content)) return raw.content;
        if (Array.isArray(raw?.items)) return raw.items;
        if (Array.isArray(raw?.results)) return raw.results;
        if (Array.isArray(raw?.data)) return raw.data;
        return [];
      };

      const raw = res?.data ?? res ?? [];
      const data = pickArray(raw);

      setProducts(data);
      showSuccessNotification(`Đã tải ${data.length} tin đăng (chờ duyệt)`);
    } catch (err) {
      const msg = handleApiError(err, "Không thể tải tin đăng");
      showErrorNotification(msg);
      if (err?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
      }
      setProducts([]);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  const approveProduct = useCallback(async (id) => {
    setLoading(true);
    try {
      await productsApi.approveProduct(id);
      showSuccessNotification("Duyệt tin đăng thành công");
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
    } catch (err) {
      showErrorNotification(handleApiError(err, "Không thể duyệt tin đăng"));
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectProduct = useCallback(async (id, reason) => {
    setLoading(true);
    try {
      await productsApi.rejectProduct(id, reason);
      showSuccessNotification("Từ chối tin đăng thành công");
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
    } catch (err) {
      showErrorNotification(handleApiError(err, "Không thể từ chối tin đăng"));
    } finally {
      setLoading(false);
    }
  }, []);

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

//* ---------- KYC HOOK (FIXED + ENRICH) ---------- */
export const useKyc = () => {
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const normalizeList = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (payload.data && Array.isArray(payload.data.content))
      return payload.data.content;
    if (Array.isArray(payload.content)) return payload.content;
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.results)) return payload.results;
    if (Array.isArray(payload.list)) return payload.list;
    return [];
  };

  const DEFAULT_FRONT = "https://placehold.co/600x380?text=CCCD+Front";
  const DEFAULT_BACK = "https://placehold.co/600x380?text=CCCD+Back";

  const isEmailLike = (v) => typeof v === "string" && /\S+@\S+\.\S+/.test(v);
  const toAbs = (url) => (url ? resolveImageUrl(url) : "");

  // Chỉ lấy tên từ các key tên, KHÔNG động vào username (có thể là email)
  const pickNameOnly = (obj) =>
    firstNonEmpty(obj?.fullName, obj?.fullname, obj?.name);

  const pickImages = (detail, row) => {
    const front =
      firstNonEmpty(
        detail?.frontIdImage,
        detail?.frontImage,
        detail?.front_id_image,
        row?.frontIdImage,
        row?.frontImage,
        row?.front_id_image
      ) || DEFAULT_FRONT;

    const back =
      firstNonEmpty(
        detail?.backIdImage,
        detail?.backImage,
        detail?.back_id_image,
        row?.backIdImage,
        row?.backImage,
        row?.back_id_image
      ) || DEFAULT_BACK;

    return { frontIdImage: toAbs(front), backIdImage: toAbs(back) };
  };

  const enrichOne = async (row) => {
    try {
      // lấy detail + cố gắng lấy user info nếu service có
      const detailP = kycApi.getKycDetail(row.id);
      const userP =
        typeof kycApi.getKycUserInfo === "function"
          ? kycApi.getKycUserInfo(row.id) // GET /kyc/{id}/infor/user
          : Promise.resolve(null);

      const [detailRes, userRes] = await Promise.allSettled([detailP, userP]);

      const detail =
        detailRes.status === "fulfilled"
          ? detailRes.value?.data || detailRes.value || {}
          : {};

      const userInfo =
        userRes.status === "fulfilled"
          ? userRes.value?.data || userRes.value || {}
          : {};

      // Tập ứng viên tên: userInfo → detail → row (lọc bỏ email-like)
      const nameCandidates = [
        pickNameOnly(userInfo),
        pickNameOnly(detail?.user || {}),
        pickNameOnly(detail),
        pickNameOnly(row?.user || {}),
        pickNameOnly(row),
      ].filter(Boolean);

      const fullName =
        nameCandidates.find((v) => v && !isEmailLike(v)) || "N/A";

      const email =
        firstNonEmpty(
          userInfo?.email,
          detail?.email,
          detail?.user?.email,
          row?.email,
          row?.user?.email
        ) || "—";

      const phone =
        firstNonEmpty(
          userInfo?.phone,
          userInfo?.phoneNumber,
          detail?.phone,
          detail?.phoneNumber,
          detail?.user?.phone,
          detail?.user?.phoneNumber,
          row?.phone,
          row?.phoneNumber,
          row?.user?.phone,
          row?.user?.phoneNumber
        ) || "—";

      const imgs = pickImages(detail, row);

      return {
        ...row,
        user: detail?.user || row.user || userInfo || null,
        _fullName: fullName, // luôn là tên, không phải email
        _email: email,
        _phone: phone,
        frontIdImage: imgs.frontIdImage,
        backIdImage: imgs.backIdImage,
        submittedAt:
          firstNonEmpty(
            row.submittedAt,
            row.createdAt,
            row.created_at,
            detail.submittedAt,
            detail.createdAt,
            detail.created_at
          ) || null,
      };
    } catch {
      const imgs = pickImages({}, row);
      const nameFallback = firstNonEmpty(
        row?.fullName,
        row?.fullname,
        row?.name // KHÔNG lấy username
      );
      return {
        ...row,
        _fullName:
          nameFallback && !isEmailLike(nameFallback) ? nameFallback : "N/A",
        _email: row?.email || "—",
        _phone: firstNonEmpty(row?.phone, row?.phoneNumber) || "—",
        frontIdImage: imgs.frontIdImage,
        backIdImage: imgs.backIdImage,
        submittedAt:
          firstNonEmpty(row?.submittedAt, row?.createdAt, row?.created_at) ||
          null,
      };
    }
  };

  const loadKyc = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const res = await kycApi.getKycList();
      const raw = res?.data ?? res?.raw ?? res ?? [];
      const list = normalizeList(raw);
      const enriched = await withConcurrency(list, 4, enrichOne);
      setKycList(enriched);
      showSuccessNotification(`Đã tải ${enriched.length} hồ sơ KYC`);
    } catch (err) {
      showErrorNotification(handleApiError(err, "Không thể tải KYC"));
      setKycList([]);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  const approveKyc = useCallback(async (id) => {
    setLoading(true);
    try {
      await kycApi.approveKyc(id);
      setKycList((prev) => prev.filter((k) => String(k.id) !== String(id)));
      showSuccessNotification("Duyệt KYC thành công");
    } catch (err) {
      showErrorNotification(handleApiError(err, "Không thể duyệt KYC"));
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectKyc = useCallback(async (id, reason) => {
    setLoading(true);
    try {
      await kycApi.rejectKyc(id, reason);
      setKycList((prev) => prev.filter((k) => String(k.id) !== String(id)));
      showSuccessNotification("Từ chối KYC thành công");
    } catch (err) {
      showErrorNotification(handleApiError(err, "Không thể từ chối KYC"));
    } finally {
      setLoading(false);
    }
  }, []);

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
  };
};

/* ------------------------------------------------------------------
   STATS HOOK
------------------------------------------------------------------- */
export const useStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await statsApi.getAllStats();
      setStats(res.data || res);
    } catch (err) {
      showErrorNotification(handleApiError(err, "Không thể tải thống kê"));
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, setStats, loading, loadStats };
};

/* ------------------------------------------------------------------
   AUTH CHECK HOOK
------------------------------------------------------------------- */
export const useStaffAuth = (user, navigate) => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!user) {
      const t = setTimeout(() => navigate("/login"), 800);
      return () => clearTimeout(t);
    }
    setIsCheckingAuth(false);

    let userRole = null;
    if (user.user && user.user.role) userRole = user.user.role;
    else if (user.role) userRole = user.role;

    if (userRole !== "ROLE_STAFF" && userRole !== "staff") {
      navigate("/");
      showErrorNotification("Bạn không có quyền truy cập trang staff!");
    }
  }, [user, navigate]);

  return { isCheckingAuth };
};
