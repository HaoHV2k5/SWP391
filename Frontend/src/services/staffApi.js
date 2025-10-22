import api from "./apiClient";

export const kycApi = {
  // Danh sách hồ sơ KYC chờ duyệt
  getPending: () => api.get("/kyc/staff"),

  // Duyệt / Từ chối
  approve: (id) => api.post(`/kyc/${id}/approve`),
  reject: (id, reason) => api.post(`/kyc/${id}/reject`, { reason }),

  // Thông tin user của hồ sơ KYC
  getUserInfo: (id) => api.get(`/kyc/${id}/user`),
};

export const productsApi = {
  // Danh sách tin đăng chờ staff duyệt
  getPending: () => api.get("/products/pending/seller/staff"),
  getDetail: (id) => api.get(`/products/${id}`),

  approve: (id) => api.post(`/products/${id}/approve`),
  reject: (id, reason) => api.post(`/products/${id}/reject`, { reason }),
};

// Cho useStaff dùng chung
export const handleApiError = (err, fallback = "Đã có lỗi") => {
  const status = err?.response?.status;
  const msg = err?.response?.data?.message || err?.message || fallback;
  return `${fallback} (${status ?? "?"}): ${msg}`;
};
