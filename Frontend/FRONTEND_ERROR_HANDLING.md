# Xử lý lỗi 403 Forbidden ở Frontend

## Vấn đề
Khi seller cố gắng mua hàng của seller khác, hệ thống trả về lỗi 403 (Forbidden) với thông báo "Bạn không có quyền mua sản phẩm".

## Giải pháp Frontend (không sửa backend)

### 1. Cập nhật thông báo lỗi thân thiện hơn
**File:** `Frontend/src/components/order/BuyButton.jsx`

- Thay thế toast error đơn giản bằng component thông báo chi tiết
- Hiển thị thông báo rõ ràng về nguyên nhân lỗi
- Cung cấp hướng dẫn cho người dùng

### 2. Tạo component thông báo lỗi chuyên dụng
**File:** `Frontend/src/components/order/OrderErrorAlert.jsx`

- Component hiển thị thông báo lỗi theo từng loại (401, 403, 400)
- Giao diện thân thiện với người dùng
- Cung cấp thông tin chi tiết về lỗi

### 3. Cập nhật orderService
**File:** `Frontend/src/services/orderService.js`

- Cải thiện thông báo lỗi 403
- Thêm thông tin hướng dẫn cho người dùng

## Các thay đổi đã thực hiện

### BuyButton.jsx
```javascript
// Thêm state để quản lý lỗi
const [showError, setShowError] = useState(false);
const [errorType, setErrorType] = useState(null);

// Xử lý lỗi với thông báo chi tiết
if (status === 403) {
  setErrorType('403');
  setShowError(true);
}

// Hiển thị component thông báo lỗi
<OrderErrorAlert 
  show={showError} 
  errorType={errorType}
  onClose={() => {
    setShowError(false);
    setErrorType(null);
  }}
/>
```

### OrderErrorAlert.jsx
```javascript
// Component hiển thị thông báo lỗi theo loại
const getErrorMessage = () => {
  switch (errorType) {
    case '403':
      return {
        title: "Không có quyền mua hàng",
        message: "Tài khoản của bạn không có quyền mua sản phẩm này. Vui lòng kiểm tra lại thông tin tài khoản hoặc liên hệ admin để được hỗ trợ.",
        variant: "warning"
      };
    // ... các loại lỗi khác
  }
};
```

## Kết quả
- ✅ Thông báo lỗi thân thiện hơn với người dùng
- ✅ Cung cấp thông tin chi tiết về nguyên nhân lỗi
- ✅ Hướng dẫn người dùng cách khắc phục
- ✅ Không cần sửa backend
- ✅ Giao diện đẹp và chuyên nghiệp

## Lưu ý
- Giải pháp này chỉ xử lý hiển thị lỗi ở frontend
- Backend vẫn trả về lỗi 403 như cũ
- Người dùng sẽ nhận được thông báo rõ ràng hơn
- Có thể mở rộng để xử lý các loại lỗi khác

## Test
1. Đăng nhập bằng account seller
2. Vào trang chi tiết sản phẩm của seller khác
3. Click "Mua ngay"
4. Xác nhận mua hàng
5. Kiểm tra thông báo lỗi có thân thiện không
