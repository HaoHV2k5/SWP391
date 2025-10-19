// src/utils/staffUtils.js
import { API_CONFIG } from "../constants/staffConstants";

/* ---------------- Common helpers ---------------- */

const safeJsonParse = (str, label = "json") => {
  try {
    return JSON.parse(str);
  } catch (err) {
    console.warn(`[staffUtils] Failed to parse ${label}:`, err, str);
    return null;
  }
};

export const firstNonEmpty = (...vals) => {
  for (const v of vals) {
    if (v === 0) return 0;
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return undefined;
};

/** chuẩn hoá path: bỏ khoảng trắng, chuyển \ -> /, loại base lặp, ghép BASE_URL cho đường dẫn tương đối */
export const resolveImageUrl = (u) => {
  if (!u) return "";
  let raw =
    typeof u === "object" && u !== null
      ? u.url || u.path || u.src || u.imageUrl || u.link
      : String(u);

  if (!raw) return "";
  raw = String(raw)
    .trim()
    .replace(/^['"]|['"]$/g, ""); // cắt quote
  raw = raw.replace(/\\/g, "/"); // \ -> /
  if (raw.startsWith("blob:") || raw.startsWith("data:")) return raw;

  // nếu đã là absolute
  if (/^https?:\/\//i.test(raw)) return raw;

  // bỏ // đầu và BASE_URL lặp
  const base = API_CONFIG.BASE_URL.replace(/\/+$/, "");
  raw = raw.replace(
    new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
    ""
  );
  raw = raw.replace(/^\/+/, "");
  return `${base}/${raw}`;
};

/** tách chuỗi nhiều url: "a.jpg, b.jpg | c.png" -> [a,b,c] */
const splitMaybeMultiUrls = (val) => {
  if (typeof val !== "string") return null;
  if (!val.includes(",") && !val.includes("|")) return null;
  return val
    .split(/[,|]/)
    .map((s) => s.trim())
    .filter(Boolean);
};

/** lấy tất cả string ứng viên URL từ mảng/object không biết cấu trúc */
const collectStringsFromUnknown = (src) => {
  const out = [];
  const visit = (v) => {
    if (!v && v !== 0) return;
    if (typeof v === "string") {
      const parts = splitMaybeMultiUrls(v);
      if (parts) parts.forEach((p) => out.push(p));
      else out.push(v);
      return;
    }
    if (Array.isArray(v)) {
      v.forEach(visit);
      return;
    }
    if (typeof v === "object") {
      // kiểu {url},{path},...
      const basic = v.url || v.path || v.src || v.imageUrl || v.link;
      if (basic) visit(basic);
      Object.values(v).forEach(visit);
    }
  };
  visit(src);
  return out;
};

/** quét sâu object để tìm ảnh có key gợi ý (front/back/id/card/cccd) */
export const deepFindImageByHints = (obj, hintRegex) => {
  let found = "";
  const visit = (node, keyPath = "") => {
    if (!node || found) return;
    if (typeof node === "string") {
      const url = resolveImageUrl(node);
      if (url) found = url;
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((it, i) => visit(it, keyPath + `[${i}]`));
      return;
    }
    if (typeof node === "object") {
      for (const [k, v] of Object.entries(node)) {
        if (found) break;
        if (hintRegex.test(k.toLowerCase())) {
          // nhận trực tiếp hoặc qua {url}
          const direct =
            typeof v === "string"
              ? v
              : v && (v.url || v.path || v.src || v.imageUrl);
          if (direct) {
            found = resolveImageUrl(direct);
            if (found) break;
          }
        }
        visit(v, keyPath ? `${keyPath}.${k}` : k);
      }
    }
  };
  visit(obj);
  return found;
};

/** tìm giá trị sâu theo danh sách key ưu tiên (fullName/email/phone) */
export const deepPick = (obj, keys) => {
  const lowerKeys = keys.map((k) => k.toLowerCase());
  let result;
  const visit = (node) => {
    if (result !== undefined || !node) return;
    if (typeof node === "string" || typeof node === "number") return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeof node === "object") {
      for (const [k, v] of Object.entries(node)) {
        if (result !== undefined) break;
        if (lowerKeys.includes(k.toLowerCase())) {
          const val =
            typeof v === "string" || typeof v === "number"
              ? v
              : (v && (v.fullName || v.fullname || v.name)) || "";
          if (val !== undefined && String(val).trim() !== "") {
            result = val;
            break;
          }
        }
        visit(v);
      }
    }
  };
  visit(obj);
  return result;
};

/** gom ảnh sản phẩm từ rất nhiều biến thể */
export const extractProductImages = (p) => {
  if (!p) return [];
  const list = [];

  // 1) candidates mảng
  const arrCandidates = [
    p.images,
    p.imageUrls,
    p.photos,
    p.gallery,
    p.media,
    p.pictures,
    p.thumbnails,
    p.files,
    p.attachments,
    p.assets,
    p.productImages,
    p.imagesJson,
    p.imagesJSON,
  ].filter(Boolean);

  for (const c of arrCandidates) {
    if (Array.isArray(c)) list.push(...collectStringsFromUnknown(c));
    else if (typeof c === "string") {
      const parsed = safeJsonParse(c, "imagesJson");
      if (parsed) list.push(...collectStringsFromUnknown(parsed));
      else list.push(...collectStringsFromUnknown(c));
    } else if (typeof c === "object") {
      list.push(...collectStringsFromUnknown(c));
    }
  }

  // 2) single candidates
  const singleCandidates = [
    p.image,
    p.thumbnail,
    p.cover,
    p.mainImage,
    p.avatar,
    p.picture,
    p.imageUrl,
  ].filter(Boolean);
  singleCandidates.forEach((s) => list.push(...collectStringsFromUnknown(s)));

  // 3) gợi ý qua key (thường thấy trên detail)
  if (list.length === 0) {
    const anyImg = deepFindImageByHints(
      p,
      /(image|photo|picture|thumb|url|path)/i
    );
    if (anyImg) list.push(anyImg);
  }

  const normalized = list.map(resolveImageUrl).filter(Boolean);
  return Array.from(new Set(normalized));
};

/* ---------------- Money / Status ---------------- */

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const getStatusColor = (status) => {
  switch (status) {
    case "PENDING":
      return "#ffc107";
    case "STAFF_APPROVED":
      return "#17a2b8";
    case "ADMIN_APPROVED":
      return "#28a745";
    case "REJECTED":
      return "#dc3545";
    case "active":
      return "#28a745";
    case "completed":
      return "#28a745";
    case "processing":
      return "#17a2b8";
    case "cancelled":
      return "#dc3545";
    default:
      return "#6c757d";
  }
};

export const getStatusText = (status) => {
  switch (status) {
    case "PENDING":
      return "Chờ duyệt";
    case "STAFF_APPROVED":
      return "Staff đã duyệt";
    case "ADMIN_APPROVED":
      return "Admin đã duyệt";
    case "REJECTED":
      return "Đã từ chối";
    case "active":
      return "Hoạt động";
    case "pending":
      return "Chờ xử lý";
    case "processing":
      return "Đang xử lý";
    case "completed":
      return "Hoàn thành";
    case "cancelled":
      return "Đã hủy";
    default:
      return status || "Không xác định";
  }
};

/* ---------------- Date / text ---------------- */

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    console.warn("[staffUtils] formatDate error:", e, dateString);
    return dateString;
  }
};

export const formatDateShort = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("vi-VN");
  } catch (e) {
    console.warn("[staffUtils] formatDateShort:", e, dateString);
    return dateString;
  }
};

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isValidPhone = (phone) =>
  /^(\+84|84|0)[1-9][0-9]{8,9}$/.test(phone.replace(/\s/g, ""));
export const truncateText = (t, n = 100) =>
  !t ? "" : t.length <= n ? t : t.substring(0, n) + "...";
export const capitalizeFirst = (s) =>
  !s ? "" : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

/* ---------------- Misc ---------------- */

export const generateId = () => Math.random().toString(36).substr(2, 9);
export const debounce = (fn, wait) => {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), wait);
  };
};
export const throttle = (fn, ms) => {
  let ok = true;
  return (...a) => {
    if (!ok) return;
    ok = false;
    fn(...a);
    setTimeout(() => (ok = true), ms);
  };
};

export const deepClone = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (Array.isArray(obj)) return obj.map(deepClone);
  const o = {};
  for (const k of Object.keys(obj)) o[k] = deepClone(obj[k]);
  return o;
};

export const isEmpty = (obj) => {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === "string") return obj.length === 0;
  if (typeof obj === "object") return Object.keys(obj).length === 0;
  return false;
};

export const getFileExtension = (filename) =>
  !filename ? "" : filename.split(".").pop().toLowerCase();
export const isImageFile = (filename) =>
  ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(
    getFileExtension(filename)
  );
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024,
    sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
