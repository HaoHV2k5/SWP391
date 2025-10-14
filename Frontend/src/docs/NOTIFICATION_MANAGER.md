# Notification Manager - Hệ thống quản lý thông báo

## 📋 Tổng quan

Notification Manager là một hệ thống quản lý thông báo tập trung được thiết kế để:
- **Ngăn chặn thông báo trùng lặp**
- **Quản lý cache thông báo**
- **Cung cấp API thống nhất cho tất cả thông báo**

## 🚀 Tính năng chính

### 1. **Ngăn chặn thông báo trùng lặp**
- Sử dụng `toastId` để tránh hiển thị cùng một thông báo nhiều lần
- Cache thời gian hiển thị thông báo cuối cùng
- Thời gian cache mặc định: **3 giây**

### 2. **API thống nhất**
```javascript
// Thông báo thành công
showSuccessNotification("Duyệt tin đăng thành công!");

// Thông báo lỗi
showErrorNotification("Không thể tải dữ liệu");

// Thông báo cảnh báo
showWarningNotification("Dữ liệu có thể không chính xác");

// Thông báo thông tin
showInfoNotification("Đã cập nhật thành công");
```

### 3. **Quản lý thông báo**
```javascript
// Xóa tất cả thông báo
clearAllNotifications();

// Xóa thông báo cụ thể
clearNotification("Duyệt tin đăng thành công!", "success");

// Kiểm tra thông báo đang hiển thị
isNotificationShowing("Duyệt tin đăng thành công!", "success");

// Reset cache
resetNotificationCache();
```

## 🔧 Cấu hình

### Cấu hình mặc định
```javascript
// Trong App.jsx
import { getToastDefaults } from "./utils/notificationManager";

<ToastContainer
  {...getToastDefaults()}
  theme="light"
/>
```

### Cấu hình chi tiết
```javascript
const toastDefaults = {
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
```

### Tùy chỉnh thời gian cache
```javascript
// Thay đổi thời gian cache (milliseconds)
const NOTIFICATION_CACHE_TIME = 5000; // 5 giây
```

## 📝 Cách sử dụng

### 1. Import notification manager
```javascript
import { 
  showSuccessNotification, 
  showErrorNotification,
  showWarningNotification,
  showInfoNotification 
} from '../utils/notificationManager';
```

### 2. Thay thế toast cũ
```javascript
// Trước
toast.success("Duyệt tin đăng thành công!");
toast.error("Có lỗi xảy ra");

// Sau
showSuccessNotification("Duyệt tin đăng thành công!");
showErrorNotification("Có lỗi xảy ra");
```

### 3. Sử dụng trong hooks
```javascript
// useStaff.js
import { showSuccessNotification, showErrorNotification } from '../utils/notificationManager';

const approveProduct = useCallback(async (productId) => {
  try {
    const result = await productsApi.approveProduct(productId);
    showSuccessNotification("Duyệt tin đăng thành công!");
  } catch (error) {
    showErrorNotification(handleApiError(error, "Có lỗi xảy ra khi duyệt tin đăng"));
  }
}, []);
```

## 🎯 Lợi ích

### 1. **Trải nghiệm người dùng tốt hơn**
- Không có thông báo spam
- Thông báo rõ ràng và nhất quán
- Tự động ẩn sau 3 giây

### 2. **Code sạch hơn**
- API thống nhất
- Dễ bảo trì
- Tái sử dụng cao

### 3. **Performance tốt hơn**
- Giảm số lượng DOM elements
- Cache thông minh
- Memory efficient

## 🔍 Ví dụ thực tế

### Trước khi sử dụng Notification Manager
```javascript
// Có thể hiển thị nhiều thông báo trùng lặp
const handleApprove = async () => {
  try {
    await api.approve();
    toast.success("Duyệt thành công!"); // Thông báo 1
    toast.success("Duyệt thành công!"); // Thông báo 2 (trùng lặp)
    toast.success("Duyệt thành công!"); // Thông báo 3 (trùng lặp)
  } catch (error) {
    toast.error("Có lỗi xảy ra");
  }
};
```

### Sau khi sử dụng Notification Manager
```javascript
// Chỉ hiển thị 1 thông báo duy nhất
const handleApprove = async () => {
  try {
    await api.approve();
    showSuccessNotification("Duyệt thành công!"); // Chỉ hiển thị 1 lần
    showSuccessNotification("Duyệt thành công!"); // Bị chặn (cache 3s)
    showSuccessNotification("Duyệt thành công!"); // Bị chặn (cache 3s)
  } catch (error) {
    showErrorNotification("Có lỗi xảy ra");
  }
};
```

## 🛠️ Tùy chỉnh nâng cao

### Thêm options cho toast
```javascript
showSuccessNotification("Duyệt thành công!", {
  autoClose: 5000, // 5 giây
  position: "top-left",
  hideProgressBar: true
});
```

### Xử lý callback
```javascript
showSuccessNotification("Duyệt thành công!", {
  onClose: () => console.log("Toast đã đóng"),
  onClick: () => console.log("Toast được click")
});
```

## 📊 So sánh hiệu suất

| Metric | Trước | Sau |
|--------|-------|-----|
| **Duplicate Notifications** | Có | Không |
| **Memory Usage** | Cao | Thấp |
| **User Experience** | Kém | Tốt |
| **Code Maintainability** | Khó | Dễ |
| **Performance** | Chậm | Nhanh |

## 🎉 Kết luận

Notification Manager đã giải quyết hoàn toàn vấn đề thông báo trùng lặp và cung cấp một hệ thống quản lý thông báo mạnh mẽ, dễ sử dụng cho toàn bộ ứng dụng Staff.

**Kết quả:**
- ✅ **Không còn thông báo trùng lặp**
- ✅ **Trải nghiệm người dùng tốt hơn**
- ✅ **Code sạch và dễ bảo trì**
- ✅ **Performance tối ưu**
