// src/services/staffApi.js
import { API_CONFIG } from "../constants/staffConstants";

const BASE = API_CONFIG.BASE_URL;

/* ---------- helpers ---------- */
const readResponseSafely = async (res) => {
  try {
    const t = await res.text();
    if (!t) return null;
    try {
      return JSON.parse(t);
    } catch {
      return t;
    }
  } catch {
    return null;
  }
};

const headersBase = () => {
  const token = localStorage.getItem("token");
  const h = { Accept: "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
};

const handleApiResponse = async (res) => {
  const payload = await readResponseSafely(res);
  if (res.status === 401) {
    const e = new Error(payload?.message || "Unauthorized");
    e.status = 401;
    throw e;
  }
  if (!res.ok) {
    const e = new Error(payload?.message || `HTTP ${res.status}`);
    e.status = res.status;
    throw e;
  }
  return payload ?? null;
};

const GET = async (path) => {
  const res = await fetch(`${BASE}${path}`, { headers: headersBase() });
  const data = await handleApiResponse(res);
  return { success: true, data, raw: data };
};

const POST = async (path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      ...headersBase(),
      ...(body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
    },
    body: body instanceof FormData ? body : JSON.stringify(body || {}),
  });
  const data = await handleApiResponse(res);
  return { success: true, data, raw: data };
};

// Ép dữ liệu về mảng an toàn
const toArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.items && Array.isArray(data.items)) return data.items;
  if (data?.content && Array.isArray(data.content)) return data.content;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

/* ---------- PRODUCTS (đúng spec) ---------- */
export const productsApi = {
  // GET/products/pending/seller/staff
  getPendingProducts: () => GET(`/products/pending/seller/staff`),

  // POST/products/{id}/approve/staff
  approveProduct: (id) => POST(`/products/${id}/approve/staff`),

  // POST/products/{id}/reject  (kèm reason)
  rejectProduct: (id, reason) => POST(`/products/${id}/reject`, { reason }),

  // tuỳ bạn còn dùng hay không; giữ lại cho an toàn
  getProductDetail: (id) => GET(`/products/${id}`),

  // nếu cần lấy seller theo productId (không có trong spec, nhưng để dự phòng)
  getSellerByProductId: (id) => GET(`/products/seller/${id}`),
};

/* ---------- KYC (đúng spec) ---------- */
export const kycApi = {
  // GET/kyc/staff
  getKycList: () => GET(`/kyc/staff`),

  // GET/kyc/{id}/infor/user  (thông tin seller đã gửi KYC)
  getKycDetail: (id) => GET(`/kyc/${id}/infor/user`),

  // POST/kyc/{id}/staff/approve
  approveKyc: (id) => POST(`/kyc/${id}/staff/approve`),

  // POST/kyc/{id}/reject (kèm reason)
  rejectKyc: (id, reason) => POST(`/kyc/${id}/reject`, { reason }),

  // ✅ NEW: lấy thông tin seller đã gửi KYC
  getKycUserInfo: (id) => GET(`/kyc/${id}/infor/user`),
};

/* ---------- STATS ---------- */
export const statsApi = {
  getAllStats: async () => {
    const [kyc, prod] = await Promise.allSettled([
      kycApi.getKycList(),
      productsApi.getPendingProducts(),
    ]);

    const kycList = toArray(kyc.status === "fulfilled" ? kyc.value.data : []);
    const products = toArray(
      prod.status === "fulfilled" ? prod.value.data : []
    );

    return {
      success: true,
      data: {
        totalProducts: products.length,
        pendingProducts: products.filter(
          (p) => (p.status || "").toUpperCase() === "PENDING"
        ).length,
        approvedProducts: products.filter((p) =>
          ["STAFF_APPROVED", "ADMIN_APPROVED"].includes(
            (p.status || "").toUpperCase()
          )
        ).length,
        rejectedProducts: products.filter(
          (p) => (p.status || "").toUpperCase() === "REJECTED"
        ).length,

        totalKyc: kycList.length,
        pendingKyc: kycList.filter(
          (k) => (k.status || "").toUpperCase() === "PENDING"
        ).length,
        approvedKyc: kycList.filter((k) =>
          ["STAFF_APPROVED", "ADMIN_APPROVED"].includes(
            (k.status || "").toUpperCase()
          )
        ).length,

        kycList,
        products,
      },
    };
  },
};

/* ---------- common error ---------- */
export const handleApiError = (err, fallback = "Có lỗi xảy ra") => {
  if (!err) return fallback;
  if (err.status === 401) return "Phiên đăng nhập đã hết hạn";
  if (err.message?.toLowerCase().includes("failed to fetch"))
    return "Không thể kết nối máy chủ";
  if (err.status === 500) return "Lỗi máy chủ (500)";
  return err.message || fallback;
};
