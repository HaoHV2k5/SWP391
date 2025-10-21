// ---- GIỮ nguyên ở đầu file ----
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

// ===== Chuẩn hoá URL ảnh (kể cả Google Drive, path tương đối) =====
export const resolveImageUrl = (s) => {
  if (!s) return "";
  if (Array.isArray(s)) return s.map(resolveImageUrl).filter(Boolean);

  const v = String(s).trim();
  if (!v) return "";

  // Link Google Drive -> chuyển sang direct view
  const gd = v.match(
    /https?:\/\/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([\w-]+)/
  );
  if (gd?.[1]) return `https://drive.google.com/uc?export=view&id=${gd[1]}`;

  // http(s) tuyệt đối
  if (/^https?:\/\//i.test(v)) return v;

  // Đường dẫn tuyệt đối theo server (bắt đầu bằng /)
  if (v.startsWith("/")) return `${API_BASE}${v}`;

  // Còn lại coi như relative path
  return `${API_BASE}/${v}`;
};

// ===== Gom ảnh từ nhiều key khác nhau =====
export const collectImages = (obj = {}) => {
  const set = new Set();

  const push = (val) => {
    if (!val) return;
    // Chuỗi CSV -> tách ra
    if (typeof val === "string" && val.includes(",")) {
      val
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach(push);
      return;
    }
    const r = resolveImageUrl(val);
    if (Array.isArray(r)) r.forEach((x) => x && set.add(x));
    else if (r) set.add(r);
  };

  // 1) Các trường mảng/chuỗi nhiều URL phổ biến
  const arrayish = [
    obj.images,
    obj.photos,
    obj.pictures,
    obj.gallery,
    obj.files,
    obj.resources,
    obj.photoUrls,
    obj.imageUrls,
    obj.imagesUrl,
    obj.image_links,
  ];
  arrayish.filter(Boolean).forEach((v) => {
    if (Array.isArray(v)) v.forEach(push);
    else push(v);
  });

  // 2) Trường đơn lẻ 1 URL
  [
    obj.image,
    obj.imageUrl,
    obj.mainImage,
    obj.cover,
    obj.thumbnail,
    obj.featuredImage,
  ].forEach(push);

  // 3) Các field tách rời kiểu image1..image5 (nếu DB lưu vậy)
  ["image1", "image2", "image3", "image4", "image5"].forEach((k) =>
    push(obj[k])
  );

  // 4) Nếu dữ liệu lồng bên trong vehicle/battery -> gom tiếp
  if (obj.vehicle) collectImages(obj.vehicle).forEach((u) => set.add(u));
  if (obj.battery) collectImages(obj.battery).forEach((u) => set.add(u));

  return [...set];
};
export const vnDate = (d) => {
  try {
    const x = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
    if (isNaN(x?.getTime?.())) return "—";
    return x.toLocaleString("vi-VN", { hour12: false });
  } catch {
    return "—";
  }
};

export const money = (v) =>
  (Number(v) || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

export const statusTag = (s) => {
  const k = String(s || "").toUpperCase();
  if (k === "PENDING") return { color: "gold", text: "Chờ duyệt" };
  if (k === "STAFF_APPROVED" || k === "APPROVED")
    return { color: "green", text: "Đã duyệt" };
  if (k === "STAFF_DECLINED" || k === "REJECTED")
    return { color: "red", text: "Bị từ chối" };
  return { color: "default", text: s || "—" };
};

/* ===== Alias tương thích với code cũ ===== */
export const formatDate = vnDate; // đã báo ở bước trước
export const formatCurrency = money;

// ✅ Thêm 2 alias này để fix ComplaintTab
export const getStatusColor = (s) => statusTag(s).color;
export const getStatusText = (s) => statusTag(s).text;
