/**
 * Staff Utility Functions
 * Tập trung các hàm tiện ích cho Staff functionality
 */

/**
 * Format tiền tệ theo định dạng Việt Nam
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "N/A";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Lấy màu sắc cho trạng thái (status)
 */
export const getStatusColor = (status) => {
  switch (status) {
    case "PENDING":
      return "#ffc107"; // Vàng - Chờ duyệt
    case "STAFF_APPROVED":
      return "#17a2b8"; // Xanh dương - Staff đã duyệt
    case "ADMIN_APPROVED":
      return "#28a745"; // Xanh lá - Admin đã duyệt
    case "REJECTED":
      return "#dc3545"; // Đỏ - Đã từ chối
    case "active":
      return "#28a745"; // Xanh lá - Hoạt động
    case "completed":
      return "#28a745"; // Xanh lá - Hoàn thành
    case "processing":
      return "#17a2b8"; // Xanh dương - Đang xử lý
    case "cancelled":
      return "#dc3545"; // Đỏ - Đã hủy
    default:
      return "#6c757d"; // Xám - Mặc định
  }
};

/**
 * Lấy text hiển thị cho trạng thái
 */
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

/**
 * Lấy màu sắc cho mức độ ưu tiên (priority)
 */
export const getPriorityColor = (priority) => {
  switch (priority) {
    case "high":
      return "#dc3545"; // Đỏ - Ưu tiên cao
    case "medium":
      return "#ffc107"; // Vàng - Ưu tiên trung bình
    case "low":
      return "#28a745"; // Xanh lá - Ưu tiên thấp
    default:
      return "#6c757d"; // Xám - Mặc định
  }
};

/**
 * Lấy text hiển thị cho mức độ ưu tiên
 */
export const getPriorityText = (priority) => {
  switch (priority) {
    case "high":
      return "Cao";
    case "medium":
      return "Trung bình";
    case "low":
      return "Thấp";
    default:
      return "Không xác định";
  }
};

/**
 * Format ngày tháng theo định dạng Việt Nam
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

/**
 * Format ngày tháng ngắn gọn
 */
export const formatDateShort = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (Vietnam)
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+84|84|0)[1-9][0-9]{8,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

/**
 * Truncate text với độ dài tùy chỉnh
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Capitalize first letter
 */
export const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Generate random ID (for testing purposes)
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (typeof obj === "object") {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === "string") return obj.length === 0;
  if (typeof obj === "object") return Object.keys(obj).length === 0;
  return false;
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename) => {
  if (!filename) return "";
  return filename.split(".").pop().toLowerCase();
};

/**
 * Check if file is image
 */
export const isImageFile = (filename) => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
  const extension = getFileExtension(filename);
  return imageExtensions.includes(extension);
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
