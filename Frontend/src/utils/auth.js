// src/utils/auth.js
/**
 * Giải mã payload JWT (Base64URL) không cần thư viện bên ngoài
 */
export const decodeJwtPayload = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/**
 * Lấy role từ token:
 * - Ưu tiên field "scope" trong JWT (chuỗi có ROLE_*)
 */
export const getRoleFromToken = (token) => {
  const payload = decodeJwtPayload(token);
  const scope = (payload?.scope || "").toUpperCase();
  if (scope.includes("ROLE_STAFF")) return "ROLE_STAFF";
  if (scope.includes("ROLE_ADMIN")) return "ROLE_ADMIN";
  if (scope.includes("ROLE_SELLER")) return "ROLE_SELLER";
  if (scope.includes("ROLE_USER")) return "ROLE_USER";
  return null;
};

/**
 * Chuẩn hoá dữ liệu login từ BE thành định dạng FE đang dùng
 */
export const normalizeLoginResponse = (loginRes) => {
  console.log("🔍 normalizeLoginResponse called with:", loginRes);
  const raw = loginRes?.data || loginRes;
  const token = raw?.token || loginRes?.token;
  const refreshToken = raw?.refreshToken || loginRes?.refreshToken;
  const user = raw?.user || loginRes?.user || {};

  const mapped = {
    id: user.id,
    email: user.email || user.username,
    fullName: user.fullname || user.fullName || user.name || user.username,
    avatar: user.avatar || "",
    phone: user.phone || "",
    gender: user.gender ?? null,
    yob: user.yob ?? null,
    address: user.address ?? null,
  };

  const roleFromToken = token ? getRoleFromToken(token) : null;
  const role = user.role || roleFromToken || "ROLE_USER";

  const result = { token, refreshToken, user: { ...mapped, role }, role };
  console.log("🔍 normalizeLoginResponse result:", result);
  return result;
};

/**
 * Lưu token/refreshToken/user vào localStorage theo format FE
 */
export const persistAuth = ({ token, refreshToken, user, role }) => {
  console.log("🔍 persistAuth called with:", {
    token,
    refreshToken,
    user,
    role,
  });
  const userData = {
    ...user,
    role: role || user?.role,
    token, // giữ token trong userData cho tương thích code cũ
  };
  console.log("🔍 userData to save:", userData);
  localStorage.setItem("token", token || "");
  localStorage.setItem("refreshToken", refreshToken || "");
  localStorage.setItem("userData", JSON.stringify(userData));
  console.log("✅ Data saved to localStorage");
  return userData;
};

/**
 * Helper kiểm tra role staff
 */
export const isStaff = (roleLike) =>
  ["ROLE_STAFF", "STAFF", "staff"].includes((roleLike || "").toUpperCase());
