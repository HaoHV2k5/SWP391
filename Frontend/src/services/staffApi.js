// src/services/staffApi.js
import api from "./apiClient"; // axios instance đã có sẵn trong dự án

/* ===== helper chung để lấy message lỗi ===== */
export const handleApiError = (err, fb) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  fb ||
  "Có lỗi xảy ra";

/* ---------- PRODUCTS (Tin đăng) ---------- */
export const productsApi = {
  // Danh sách tin đăng PENDING + kèm seller info
  getPending: () => api.get(`/products/pending/seller/staff`),

  // Duyệt tin → staff-approved
  approve: (id) => api.post(`/products/${id}/approve/staff`),

  // Từ chối tin + lý do
  reject: (id, reason) => api.post(`/products/${id}/reject`, { reason }),

  // (tuỳ BE) Thử lấy chi tiết nếu Swagger có endpoint này; nếu không có cũng không sao.
  getDetail: (id) => api.get(`/products/${id}`),

  updateImages: (id, images) => api.put(`/products/update`, { id, images }), // { id: number, images: string[] }
};

/* ---------- KYC ---------- */
export const kycApi = {
  // Danh sách KYC PENDING
  getPending: () => api.get(`/kyc/staff`),

  // Thông tin user của KYC
  getUserInfo: (id) => api.get(`/kyc/${id}/infor/user`),

  // Duyệt KYC
  approve: (id) => api.post(`/kyc/${id}/staff/approve`),

  // Từ chối KYC + lý do
  reject: (id, reason) => api.post(`/kyc/${id}/reject`, { reason }),
};

/* ---------- COMPLAINT (khiếu nại) — giống luồng tin đăng ---------- */
/* Nếu Swagger của bạn có khác path, chỉ cần đổi 3 dòng dưới */
export const complaintApi = {
  getPending: () => api.get(`/complaints/pending/staff`),
  approve: (id) => api.post(`/complaints/${id}/approve/staff`),
  reject: (id, reason) => api.post(`/complaints/${id}/reject`, { reason }),
};
