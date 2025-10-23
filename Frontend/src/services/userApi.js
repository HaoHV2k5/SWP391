// src/services/userApi.js
import api from "./apiClient";

// Unwrap kiểu {code, message, data} hoặc trả thẳng data
const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

/** Chỉ cho phép 6 field được cập nhật */
const pickUpdatable = (src = {}) => ({
  phone: src.phone ?? "",
  fullname: src.fullname ?? "",
  gender: src.gender ?? "",
  yob: src.yob ?? "", // "dd-MM-yyyy"
  avatar: src.avatar ?? "",
  address: src.address ?? "",
});

export const userApi = {
  /** Lấy thông tin người dùng hiện tại */
  async getMe() {
    const res = await api.get("/users/me");
    // backend trả đúng 6 field; nếu dư thì cũng chỉ return về unwrap
    return unwrap(res);
  },

  /** Cập nhật 6 field cho user hiện tại */
  async updateMe(payload) {
    const body = pickUpdatable(payload);
    const res = await api.put("/users/update", body, {
      headers: { "Content-Type": "application/json", Accept: "*/*" },
    });
    return unwrap(res);
  },
};

export default userApi;
