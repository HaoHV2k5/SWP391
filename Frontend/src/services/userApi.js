// src/services/userApi.js
import api from "./apiClient";

// Unwrap kiểu {code, message, data} hoặc trả thẳng data
const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

// Chuẩn hoá yob về dd/MM/yyyy
const toYobDDMMYYYY = (val) => {
  if (!val) return ""; // caller phải đảm bảo NotNull theo BE
  // Nếu là đối tượng Date hoặc dayjs-like có format()
  if (typeof val === "object") {
    try {
      // dayjs / moment
      if (typeof val.format === "function") return val.format("DD/MM/YYYY");
      // Date
      if (val instanceof Date) {
        const d = val;
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      }
    } catch (e) {}
  }
  // Chuỗi: thử các format phổ biến
  const s = String(val).trim();
  // yyyy-MM-dd -> dd/MM/yyyy
  const m1 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m1) return `${m1[3]}/${m1[2]}/${m1[1]}`;
  // dd-MM-yyyy -> dd/MM/yyyy
  const m2 = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s);
  if (m2) return `${m2[1]}/${m2[2]}/${m2[3]}`;
  // dd/MM/yyyy (đã đúng)
  const m3 = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (m3) return s;
  // Fallback: cứ trả lại chuỗi (BE sẽ báo lỗi nếu sai)
  return s;
};

/** Chỉ cho phép 6 field được cập nhật */
const pickUpdatable = (src = {}) => ({
  phone: (src.phone ?? "").trim(),
  fullname: (src.fullname ?? "").trim(),
  gender: (src.gender ?? "").trim(), // ví dụ: MALE/FEMALE/OTHER
  yob: toYobDDMMYYYY(src.yob), // ✅ luôn dd/MM/yyyy
  avatar: (src.avatar ?? "").trim(),
  address: (src.address ?? "").trim(),
});

export const userApi = {
  /** Lấy thông tin người dùng hiện tại */
  async getMe() {
    const res = await api.get("/users/me");
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
