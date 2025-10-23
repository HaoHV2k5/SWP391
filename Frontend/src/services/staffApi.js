// src/services/staffApi.js
import api from "./apiClient";

/* =========================================================
 * Helpers
 * =======================================================*/

/** Thử GET qua nhiều endpoint (404/405 thì thử tiếp, lỗi khác ném ra) */
const tryGet = async (paths) => {
  let lastErr;
  for (const p of paths) {
    try {
      return await api.get(p);
    } catch (e) {
      const sc = e?.response?.status;
      if (sc === 404 || sc === 405) {
        lastErr = e;
        continue;
      }
      // 401/403/5xx: dừng để thấy lỗi thật
      throw e;
    }
  }
  throw lastErr;
};

/* =========================================================
 * KYC API
 * =======================================================*/
export const kycApi = {
  /** Danh sách hồ sơ KYC chờ duyệt */
  getPending: () => tryGet(["/kyc/staff", "/admin/kyc/pending"]),

  /** Duyệt KYC (đúng swagger) */
  approve: (id) => api.post(`/kyc/${id}/staff/approve`),

  /**
   * Từ chối KYC — theo swagger:
   * POST /kyc/{id}/reject
   * body: { reason: string }
   */
  reject: (id, reasonRaw) => {
    const reason = String(reasonRaw ?? "").trim();
    if (!reason) {
      return Promise.reject(new Error("Reason is required"));
    }
    return api.post(
      `/kyc/${id}/reject`,
      { reason },
      { headers: { "Content-Type": "application/json", Accept: "*/*" } }
    );
  },

  /** Lấy thông tin user theo KYC id */
  getUserInfo: (id) => tryGet([`/kyc/${id}/infor/user`, `/kyc/${id}/user`]),
};

/* =========================================================
 * Products API
 * =======================================================*/
export const productsApi = {
  getPending: () =>
    tryGet(["/products/pending/seller/staff", "/staff/products/pending"]),
  getDetail: (id) => tryGet([`/products/${id}`]),
  approve: (id) => api.post(`/products/${id}/approve/staff`),
  reject: (id, reason) => api.post(`/products/${id}/reject`, { reason }),
};

/* =========================================================
 * Error helper
 * =======================================================*/
export const handleApiError = (err, fallback = "Đã có lỗi") => {
  const status = err?.response?.status;
  const data = err?.response?.data;

  let serverMsg = "";
  if (typeof data === "string") serverMsg = data.slice(0, 200);
  else if (data?.message) serverMsg = data.message;
  else if (data?.error) serverMsg = data.error;
  else if (data?.errors)
    serverMsg = Array.isArray(data.errors)
      ? data.errors.join(", ")
      : JSON.stringify(data.errors);

  if (status === 403 && !serverMsg) serverMsg = "Bạn không có quyền truy cập";
  if (status === 500 && !serverMsg)
    serverMsg = "Lỗi máy chủ (500). Hãy kiểm tra log BE cho /kyc/{id}/reject.";

  const msg = serverMsg || err?.message || fallback;

  // log gọn, tránh circular JSON
  try {
    console.error("[API ERROR]", {
      status,
      data: typeof data === "object" ? JSON.parse(JSON.stringify(data)) : data,
      message: msg,
    });
  } catch {
    console.error("[API ERROR]", { status, message: msg });
  }
  return `${fallback} (${status ?? "?"}): ${msg}`;
};
