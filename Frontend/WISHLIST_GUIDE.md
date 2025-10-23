# 🛍️ Hướng dẫn sử dụng chức năng Wishlist

## 📋 Tổng quan

Chức năng Wishlist cho phép người dùng lưu các sản phẩm yêu thích và quản lý chúng. Hệ thống hoạt động với cả backend API và localStorage làm fallback.

## 🏗️ Kiến trúc

### 1. **Backend API Endpoints:**
- `POST /wishlist/add` - Thêm sản phẩm vào wishlist
- `GET /wishlist?userId={id}` - Lấy danh sách wishlist
- `DELETE /wishlist/delete?productId={id}&userId={id}` - Xóa sản phẩm khỏi wishlist

### 2. **Frontend Components:**
- `SavedProductsContext` - Context quản lý state wishlist
- `wishlistService` - Service gọi API backend
- `ProductCard` - Hiển thị trái tim trên homepage
- `ProductDetailPage` - Trái tim trên trang chi tiết
- `SavedPosts` - Trang quản lý tin đã lưu

## 🚀 Cách sử dụng

### **1. Thêm sản phẩm vào wishlist:**

```jsx
import { useSavedProducts } from './contexts/SavedProductsContext';

const MyComponent = () => {
  const { add, toggle, isSaved } = useSavedProducts();
  
  const product = {
    id: 1,
    title: "iPhone 15 Pro",
    price: "25.000.000 ₫",
    image: "https://example.com/image.jpg"
  };

  // Cách 1: Thêm trực tiếp
  const handleAdd = () => {
    add(product);
  };

  // Cách 2: Toggle (thêm/xóa)
  const handleToggle = () => {
    toggle(product);
  };

  // Kiểm tra sản phẩm đã lưu chưa
  const saved = isSaved(product.id);

  return (
    <button onClick={handleToggle}>
      {saved ? "❤️" : "🤍"} {saved ? "Đã lưu" : "Lưu"}
    </button>
  );
};
```

### **2. Hiển thị danh sách wishlist:**

```jsx
import { useSavedProducts } from './contexts/SavedProductsContext';

const WishlistPage = () => {
  const { savedProducts, remove, loading } = useSavedProducts();

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div>
      <h2>Danh sách yêu thích ({savedProducts.length})</h2>
      {savedProducts.map(product => (
        <div key={product.id}>
          <h3>{product.title}</h3>
          <p>{product.price}</p>
          <button onClick={() => remove(product.id)}>
            Xóa khỏi wishlist
          </button>
        </div>
      ))}
    </div>
  );
};
```

### **3. Sử dụng trong ProductCard:**

```jsx
import { useSavedProducts } from '../contexts/SavedProductsContext';

const ProductCard = ({ product }) => {
  const { toggle, isSaved } = useSavedProducts();
  const saved = isSaved(product.id);

  return (
    <div className="product-card">
      <img src={product.image} alt={product.title} />
      <h3>{product.title}</h3>
      <p>{product.price}</p>
      
      <button 
        onClick={async () => {
          try {
            await toggle(product);
          } catch (error) {
            console.error("Error:", error);
          }
        }}
        className={saved ? "saved" : "not-saved"}
      >
        {saved ? "❤️" : "🤍"}
      </button>
    </div>
  );
};
```

## 🔧 API Methods

### **SavedProductsContext Methods:**

| Method | Type | Mô tả |
|--------|------|-------|
| `savedProducts` | Array | Danh sách sản phẩm đã lưu |
| `add(product)` | Function | Thêm sản phẩm vào wishlist |
| `remove(productId)` | Function | Xóa sản phẩm khỏi wishlist |
| `toggle(product)` | Function | Toggle sản phẩm (thêm/xóa) |
| `isSaved(productId)` | Function | Kiểm tra sản phẩm đã lưu chưa |
| `clear()` | Function | Xóa tất cả sản phẩm |
| `loading` | Boolean | Trạng thái loading |
| `refresh()` | Function | Refresh từ backend |
| `initialized` | Boolean | Context đã khởi tạo chưa |
| `currentUserId` | Number | ID của user hiện tại |

### **wishlistService Methods:**

```javascript
// Thêm vào wishlist
const result = await wishlistService.addToWishlist(productId, userId);
if (result.success) {
  console.log("Thêm thành công");
} else {
  console.error("Lỗi:", result.message);
}

// Lấy danh sách wishlist
const result = await wishlistService.getWishlist(userId);
if (result.success) {
  console.log("Danh sách:", result.data);
}

// Xóa khỏi wishlist
const result = await wishlistService.removeFromWishlist(productId, userId);
if (result.success) {
  console.log("Xóa thành công");
}
```

## 🎯 Tính năng chính

### **1. Optimistic Updates:**
- UI cập nhật ngay lập tức khi user click
- Gọi API backend sau đó
- Revert UI nếu API fail

### **2. Fallback Mechanism:**
- Tự động fallback về localStorage nếu backend API không khả dụng
- Dữ liệu không bị mất khi refresh
- Sync với backend khi có thể

### **3. Error Handling:**
- Xử lý lỗi 403 (Forbidden) gracefully
- Hiển thị thông báo lỗi cho user
- Retry mechanism

### **4. Persistence:**
- Dữ liệu lưu trong localStorage làm backup
- Sync với backend khi user login
- Không mất dữ liệu khi refresh

## 🔄 Luồng hoạt động

### **Khi user click trái tim:**

1. **UI Update:** Trái tim đổi màu ngay lập tức
2. **API Call:** Gọi backend API để sync
3. **Success:** Giữ nguyên UI, log success
4. **Error:** Revert UI về trạng thái cũ, hiển thị lỗi

### **Khi load trang:**

1. **Check User:** Kiểm tra user có login không
2. **Load Backend:** Nếu có user, load từ backend API
3. **Fallback:** Nếu backend fail, load từ localStorage
4. **Sync:** Sync với localStorage làm backup

### **Khi refresh:**

1. **Load Data:** Load từ localStorage trước
2. **Try Backend:** Thử sync với backend nếu có user
3. **Update UI:** Cập nhật UI với dữ liệu mới nhất

## 🐛 Debug & Troubleshooting

### **Console Logs:**
```javascript
// Enable debug logs
console.log("🔍 SavedProductsContext: Raw userData:", userData);
console.log("✅ Loaded wishlist from backend:", result.data?.length || 0, "items");
console.log("📦 Loaded wishlist from localStorage:", stored.length, "items");
console.log("➕ Add: Adding product", product.id, product.title);
console.log("🔄 Toggle: Product", product.id, "currently saved:", isCurrentlySaved);
```

### **Common Issues:**

1. **403 Forbidden Error:**
   - Backend API không khả dụng
   - User không có quyền truy cập
   - Hệ thống tự động fallback về localStorage

2. **Data không sync:**
   - Kiểm tra user đã login chưa
   - Kiểm tra network connection
   - Kiểm tra console logs

3. **UI không cập nhật:**
   - Đảm bảo component được wrap trong `SavedProductsProvider`
   - Kiểm tra `useSavedProducts` hook
   - Kiểm tra async/await handling

## 📱 Test Cases

### **Test 1: Basic Functionality**
1. Vào homepage
2. Click trái tim trên sản phẩm
3. Kiểm tra trái tim đổi màu
4. Vào trang "Tin đã lưu"
5. Kiểm tra sản phẩm xuất hiện

### **Test 2: Persistence**
1. Lưu một sản phẩm
2. Refresh trang
3. Kiểm tra sản phẩm vẫn còn
4. Vào trang khác rồi quay lại
5. Kiểm tra dữ liệu không mất

### **Test 3: Error Handling**
1. Disconnect network
2. Click trái tim
3. Kiểm tra UI vẫn cập nhật
4. Reconnect network
5. Kiểm tra data sync với backend

## 🎉 Kết luận

Chức năng Wishlist đã được thiết kế để:
- ✅ Hoạt động mượt mà với optimistic updates
- ✅ Có fallback mechanism khi backend không khả dụng
- ✅ Persist data qua localStorage
- ✅ Handle errors gracefully
- ✅ Sync với backend khi có thể

Hệ thống đảm bảo user experience tốt nhất ngay cả khi có vấn đề với backend API!
