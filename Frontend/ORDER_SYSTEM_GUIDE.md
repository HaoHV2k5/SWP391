# Hướng dẫn hệ thống đơn hàng (Order System)

## Tổng quan
Hệ thống đơn hàng cho phép member chưa KYC và seller mua sản phẩm bằng cách gửi yêu cầu mua hàng cho seller. Seller có thể xem, chấp nhận hoặc từ chối các yêu cầu này.

## Chức năng chính

### 1. Mua hàng (Buyer - Member chưa KYC hoặc Seller)
- **Vị trí**: Trang chi tiết sản phẩm (`/product/:id`)
- **Điều kiện**: 
  - User phải đăng nhập
  - **Seller có thể mua hàng của seller khác**
  - **Seller không thể mua sản phẩm của chính mình**
  - User phải có role "member" hoặc "seller"
- **Quy trình**:
  1. Click nút "Mua ngay" trên trang chi tiết sản phẩm
  2. Đọc thông tin quan trọng trong modal
  3. Tích vào checkbox xác nhận
  4. Click "Xác nhận mua"
  5. Hệ thống gửi yêu cầu mua hàng cho seller

### 2. Quản lý yêu cầu mua hàng (Seller)
- **Vị trí**: Trang "Yêu cầu mua hàng" (`/my-orders`)
- **Điều kiện**: User phải là chủ sở hữu sản phẩm
- **Chức năng**:
  - **Chỉ hiển thị sản phẩm có yêu cầu mua hàng** (ẩn sản phẩm chưa có yêu cầu)
  - Xem danh sách yêu cầu mua hàng cho từng sản phẩm
  - Chấp nhận yêu cầu (sẽ chuyển sang bước thanh toán - chưa implement)
  - Từ chối yêu cầu

## Cấu trúc file

### Services
- `Frontend/src/services/orderService.js` - Service xử lý API calls cho order
- `Frontend/src/services/productService.jsx` - Service quản lý sản phẩm (có function `getMyProducts`)

### Components
- `Frontend/src/components/order/BuyButton.jsx` - Nút mua hàng với modal xác nhận
- `Frontend/src/components/order/OrderList.jsx` - Danh sách orders cho seller
- `Frontend/src/components/order/ProductWithOrders.jsx` - Component hiển thị sản phẩm có orders

### Pages
- `Frontend/src/pages/member/MyOrders.jsx` - Trang quản lý yêu cầu mua hàng

### Routing
- Route `/my-orders` được thêm vào `App.jsx`
- Menu item "Yêu cầu mua hàng" được thêm vào `UserMenuItems.jsx`

## API Endpoints được sử dụng

### 1. Tạo order request
```
POST /order/create
Body: { productId, userId }
```

### 2. Từ chối order
```
POST /order/reject?orderId={orderId}
```

### 3. Lấy danh sách orders theo sản phẩm
```
GET /order/product/{productId}/orders
```

### 4. Lấy danh sách sản phẩm của user
```
GET /products/history/seller/{userId}
```

## Luồng hoạt động

### Buyer (Member chưa KYC hoặc Seller)
1. Xem sản phẩm → Click "Mua ngay"
2. Đọc thông tin → Xác nhận → Gửi yêu cầu
3. Chờ seller phản hồi

### Seller
1. Vào "Yêu cầu mua hàng" → **Chỉ thấy sản phẩm có yêu cầu mua hàng**
2. Chấp nhận: Chuyển sang bước thanh toán (chưa implement)
3. Từ chối: Đơn hàng bị hủy

## Trạng thái đơn hàng
- `PENDING`: Chờ phản hồi từ seller
- `ACCEPTED`: Đã được chấp nhận (chuyển sang thanh toán)
- `REJECTED`: Đã bị từ chối
- `CANCELLED`: Đã bị hủy

## Lưu ý quan trọng
- **Seller có thể mua hàng của seller khác**
- **Seller không thể mua sản phẩm của chính mình**
- Mỗi sản phẩm chỉ có thể có 1 đơn hàng active
- Khi có yêu cầu mua, sản phẩm sẽ tạm thời ẩn khỏi danh sách
- Chức năng chấp nhận đơn hàng sẽ chuyển sang bước thanh toán (chưa implement)
- **Trang MyOrders chỉ hiển thị sản phẩm có yêu cầu mua hàng, không hiển thị sản phẩm chưa có yêu cầu**

## Các tính năng chưa implement
- Thanh toán sau khi chấp nhận đơn hàng
- Hợp đồng mua bán
- Thông báo real-time
- Chat giữa buyer và seller

## Lưu ý kỹ thuật
- Hệ thống không sử dụng Redux store, thay vào đó sử dụng localStorage để lưu trữ thông tin user
- Tất cả các component đều nhận user từ props hoặc localStorage
- API endpoints cần được implement ở backend để hỗ trợ các chức năng order

## Troubleshooting
- Nếu gặp lỗi "could not find react redux context value", đảm bảo không sử dụng useSelector trong các component
- Nếu user không được load đúng cách, kiểm tra localStorage có chứa userData không
- Nếu API calls fail, kiểm tra backend endpoints có hoạt động đúng không
- Nếu gặp lỗi "productService.getMyProducts is not a function", đảm bảo đã import đúng productService

## Changelog
- **v1.3**: Cập nhật logic để cho phép seller mua hàng của seller khác, nhưng không thể mua sản phẩm của chính mình
- **v1.2**: Cập nhật MyOrders để chỉ hiển thị sản phẩm có yêu cầu mua hàng, không hiển thị sản phẩm chưa có yêu cầu
- **v1.1**: Thêm function `getMyProducts` vào productService để hỗ trợ MyOrders page
- **v1.0**: Tạo hệ thống mua hàng cơ bản với BuyButton và OrderList components
