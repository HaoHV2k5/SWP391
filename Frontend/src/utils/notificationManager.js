/**
 * Notification Manager
 * Quản lý thông báo tập trung để tránh hiển thị trùng lặp
 */

import { toast } from 'react-toastify';

// Set để theo dõi các thông báo đã hiển thị
const shownNotifications = new Set();

// Thời gian cache thông báo (milliseconds)
const NOTIFICATION_CACHE_TIME = 3000; // 3 giây

// Map để lưu thời gian hiển thị thông báo cuối cùng
const lastNotificationTime = new Map();

/**
 * Hiển thị thông báo thành công với kiểm tra trùng lặp
 */
export const showSuccessNotification = (message, options = {}) => {
  const key = `success_${message}`;
  const now = Date.now();
  const lastTime = lastNotificationTime.get(key) || 0;
  
  // Kiểm tra nếu thông báo đã được hiển thị trong thời gian cache
  if (now - lastTime < NOTIFICATION_CACHE_TIME) {
    return;
  }
  
  // Cập nhật thời gian hiển thị cuối cùng
  lastNotificationTime.set(key, now);
  
  // Hiển thị thông báo
  toast.success(message, {
    toastId: key, // Sử dụng toastId để tránh duplicate
    ...options
  });
};

/**
 * Hiển thị thông báo lỗi với kiểm tra trùng lặp
 */
export const showErrorNotification = (message, options = {}) => {
  const key = `error_${message}`;
  const now = Date.now();
  const lastTime = lastNotificationTime.get(key) || 0;
  
  // Kiểm tra nếu thông báo đã được hiển thị trong thời gian cache
  if (now - lastTime < NOTIFICATION_CACHE_TIME) {
    return;
  }
  
  // Cập nhật thời gian hiển thị cuối cùng
  lastNotificationTime.set(key, now);
  
  // Hiển thị thông báo
  toast.error(message, {
    toastId: key, // Sử dụng toastId để tránh duplicate
    ...options
  });
};

/**
 * Hiển thị thông báo cảnh báo với kiểm tra trùng lặp
 */
export const showWarningNotification = (message, options = {}) => {
  const key = `warning_${message}`;
  const now = Date.now();
  const lastTime = lastNotificationTime.get(key) || 0;
  
  // Kiểm tra nếu thông báo đã được hiển thị trong thời gian cache
  if (now - lastTime < NOTIFICATION_CACHE_TIME) {
    return;
  }
  
  // Cập nhật thời gian hiển thị cuối cùng
  lastNotificationTime.set(key, now);
  
  // Hiển thị thông báo
  toast.warning(message, {
    toastId: key,
    ...options
  });
};

/**
 * Hiển thị thông báo thông tin với kiểm tra trùng lặp
 */
export const showInfoNotification = (message, options = {}) => {
  const key = `info_${message}`;
  const now = Date.now();
  const lastTime = lastNotificationTime.get(key) || 0;
  
  // Kiểm tra nếu thông báo đã được hiển thị trong thời gian cache
  if (now - lastTime < NOTIFICATION_CACHE_TIME) {
    return;
  }
  
  // Cập nhật thời gian hiển thị cuối cùng
  lastNotificationTime.set(key, now);
  
  // Hiển thị thông báo
  toast.info(message, {
    toastId: key,
    ...options
  });
};

/**
 * Xóa tất cả thông báo đang hiển thị
 */
export const clearAllNotifications = () => {
  toast.dismiss();
  shownNotifications.clear();
  lastNotificationTime.clear();
};

/**
 * Xóa thông báo cụ thể
 */
export const clearNotification = (message, type = 'success') => {
  const key = `${type}_${message}`;
  toast.dismiss(key);
  shownNotifications.delete(key);
  lastNotificationTime.delete(key);
};

/**
 * Kiểm tra xem thông báo có đang hiển thị không
 */
export const isNotificationShowing = (message, type = 'success') => {
  const key = `${type}_${message}`;
  return shownNotifications.has(key);
};

/**
 * Reset cache thông báo
 */
export const resetNotificationCache = () => {
  shownNotifications.clear();
  lastNotificationTime.clear();
};

/**
 * Cấu hình toast mặc định
 * Lưu ý: react-toastify không có method configure
 * Cấu hình sẽ được thực hiện trong ToastContainer component
 */
export const getToastDefaults = () => {
  return {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    newestOnTop: false,
    closeOnClick: true,
    rtl: false,
    pauseOnFocusLoss: true,
    draggable: true,
    pauseOnHover: true,
    preventDuplicates: true, // Ngăn chặn duplicate toast
  };
};
