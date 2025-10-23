// src/services/staffApi.js
import api from "./apiClient";

// Helper thử nhiều endpoint phòng khi BE đổi path
const tryGet = async (paths) => {
  let lastErr;
  for (const p of paths) {
    try {
      return await api.get(p);
    } catch (e) {
      const sc = e?.response?.status;
      // nếu 404/405 thì thử path tiếp theo, còn 401/500 thì ném luôn
      if (sc === 404 || sc === 405) {
        lastErr = e;
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
};

export const kycApi = {
  // Danh sách hồ sơ KYC chờ duyệt
  getPending: () =>
    tryGet([
      "/kyc/staff", // swagger bạn gửi
      "/staff/kyc", // fallback thường gặp
      "/admin/kyc/pending", // fallback dự phòng
    ]),

  // Duyệt / Từ chối
  approve: (id) => api.post(`/kyc/${id}/staff/approve`), // ✅ đúng swagger
  reject: (id, reason) => api.post(`/kyc/${id}/reject`, { reason }),

  // Thông tin user của hồ sơ KYC
  getUserInfo: (id) =>
    tryGet([
      `/kyc/${id}/infor/user`, // ✅ swagger
      `/kyc/${id}/user`, // fallback
    ]),
};

export const productsApi = {
  // Danh sách tin đăng chờ staff duyệt
  getPending: () =>
    tryGet([
      "/products/pending/seller/staff", // ✅ swagger
      "/staff/products/pending", // fallback
    ]),

  getDetail: (id) => tryGet([`/products/${id}`]),

  approve: (id) => api.post(`/products/${id}/approve/staff`), // ✅ đúng swagger
  reject: (id, reason) => api.post(`/products/${id}/reject`, { reason }),
};

// Cho useStaff dùng chung
export const handleApiError = (err, fallback = "Đã có lỗi") => {
  const status = err?.response?.status;
  const data = err?.response?.data;
  let serverMsg = "";

  if (typeof data === "string") {
    serverMsg = data.slice(0, 200);
  } else if (data?.message) {
    serverMsg = data.message;
  } else if (data?.error) {
    serverMsg = data.error;
  }

  const msg = serverMsg || err?.message || fallback;
  console.error("[API ERROR]", { status, data, err });
  return `${fallback} (${status ?? "?"}): ${msg}`;
};
