/**
 * Staff Constants
 * Tập trung các hằng số và cấu hình cho Staff functionality
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3979',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Products
  PRODUCTS: {
    PENDING: '/products/pending/seller/staff',
    APPROVE: (id) => `/products/${id}/approve/staff`,
    REJECT: (id) => `/products/${id}/reject`,
    DETAIL: (id) => `/products/${id}`,
  },
  
  // KYC
  KYC: {
    LIST: '/kyc/staff',
    APPROVE: (id) => `/kyc/${id}/staff/approve`,
    REJECT: (id) => `/kyc/${id}/reject`,
    DETAIL: (id) => `/kyc/${id}`,
  },
  
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  }
};

/**
 * Status Constants
 */
export const STATUS = {
  PENDING: 'PENDING',
  STAFF_APPROVED: 'STAFF_APPROVED',
  ADMIN_APPROVED: 'ADMIN_APPROVED',
  REJECTED: 'REJECTED',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PROCESSING: 'processing',
  CANCELLED: 'cancelled',
};

/**
 * Priority Constants
 */
export const PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

/**
 * User Roles
 */
export const USER_ROLES = {
  ADMIN: 'ROLE_ADMIN',
  STAFF: 'ROLE_STAFF',
  USER: 'ROLE_USER',
  SELLER: 'ROLE_SELLER',
};

/**
 * Tab Keys
 */
export const TAB_KEYS = {
  PRODUCTS: 'products',
  KYC: 'kyc',
  DASHBOARD: 'dashboard',
  ORDERS: 'orders',
};

/**
 * Color Themes
 */
export const COLORS = {
  PRIMARY: '#1890ff',
  SUCCESS: '#52c41a',
  WARNING: '#faad14',
  ERROR: '#f5222d',
  INFO: '#1890ff',
  
  // Status Colors
  PENDING: '#ffc107',
  APPROVED: '#28a745',
  REJECTED: '#dc3545',
  PROCESSING: '#17a2b8',
  
  // Priority Colors
  HIGH_PRIORITY: '#dc3545',
  MEDIUM_PRIORITY: '#ffc107',
  LOW_PRIORITY: '#28a745',
  
  // Background Colors
  LIGHT_BG: '#f5f5f5',
  DARK_BG: '#1f1f1f',
  CARD_BG: 'rgba(26, 26, 46, 0.8)',
};

/**
 * Layout Configuration
 */
export const LAYOUT_CONFIG = {
  SIDEBAR_WIDTH: 200,
  COLLAPSED_SIDEBAR_WIDTH: 80,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 60,
  CONTENT_PADDING: 24,
};

/**
 * Table Configuration
 */
export const TABLE_CONFIG = {
  PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: ['10', '20', '50', '100'],
  SHOW_SIZE_CHANGER: true,
  SHOW_QUICK_JUMPER: true,
  SHOW_TOTAL: (total, range) => 
    `${range[0]}-${range[1]} của ${total} mục`,
};

/**
 * Modal Configuration
 */
export const MODAL_CONFIG = {
  WIDTH: {
    SMALL: 400,
    MEDIUM: 600,
    LARGE: 800,
    XLARGE: 1000,
  },
  MASK_CLOSABLE: true,
  DESTROY_ON_CLOSE: true,
};

/**
 * Form Configuration
 */
export const FORM_CONFIG = {
  LAYOUT: 'vertical',
  REQUIRED_MARK: true,
  VALIDATE_TRIGGER: 'onBlur',
};

/**
 * Toast Configuration
 */
export const TOAST_CONFIG = {
  POSITION: 'top-right',
  AUTO_CLOSE: 3000,
  HIDE_PROGRESS_BAR: false,
  CLOSE_ON_CLICK: true,
  PAUSE_ON_HOVER: true,
  DRAGGABLE: true,
};

/**
 * Loading States
 */
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Không thể kết nối đến server',
  AUTH_ERROR: 'Phiên đăng nhập đã hết hạn',
  PERMISSION_ERROR: 'Bạn không có quyền thực hiện hành động này',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  SERVER_ERROR: 'Lỗi server, vui lòng thử lại sau',
  UNKNOWN_ERROR: 'Có lỗi không xác định xảy ra',
};

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  APPROVE_PRODUCT: 'Duyệt tin đăng thành công!',
  REJECT_PRODUCT: 'Từ chối tin đăng thành công!',
  APPROVE_KYC: 'Duyệt KYC thành công!',
  REJECT_KYC: 'Từ chối KYC thành công!',
  DATA_LOADED: 'Dữ liệu đã được tải thành công',
  OPERATION_SUCCESS: 'Thao tác thành công!',
};

/**
 * Validation Rules
 */
export const VALIDATION_RULES = {
  REQUIRED: (message = 'Trường này là bắt buộc') => ({
    required: true,
    message,
  }),
  
  EMAIL: (message = 'Email không hợp lệ') => ({
    type: 'email',
    message,
  }),
  
  PHONE: (message = 'Số điện thoại không hợp lệ') => ({
    pattern: /^(\+84|84|0)[1-9][0-9]{8,9}$/,
    message,
  }),
  
  MIN_LENGTH: (min, message) => ({
    min,
    message: message || `Tối thiểu ${min} ký tự`,
  }),
  
  MAX_LENGTH: (max, message) => ({
    max,
    message: message || `Tối đa ${max} ký tự`,
  }),
};

/**
 * File Upload Configuration
 */
export const FILE_UPLOAD_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  ALLOWED_EXTENSIONS: [
    '.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'
  ],
};

/**
 * Date Formats
 */
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
};

/**
 * Currency Configuration
 */
export const CURRENCY_CONFIG = {
  LOCALE: 'vi-VN',
  CURRENCY: 'VND',
  MINIMUM_FRACTION_DIGITS: 0,
  MAXIMUM_FRACTION_DIGITS: 0,
};
