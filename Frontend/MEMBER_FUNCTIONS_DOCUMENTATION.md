# 📚 MEMBER FUNCTIONS DOCUMENTATION

## 🎯 **Tổng quan**
Module Member cung cấp các chức năng quản lý tài khoản người dùng, bao gồm đăng nhập/đăng ký, quản lý tin đăng, đơn hàng và các tính năng khác.

---

## 📁 **Cấu trúc thư mục**

```
src/
├── components/member/           # Components UI cho member
│   ├── LoginButton.jsx         # Nút đăng nhập
│   ├── UserDropdown.jsx        # Dropdown cho user đã đăng nhập
│   ├── GuestDropdown.jsx       # Dropdown cho user chưa đăng nhập
│   ├── UserAvatar.jsx          # Avatar người dùng
│   ├── UserMenuItems.jsx       # Menu items chung
│   ├── LoginRegisterButtons.jsx # Nút đăng nhập/đăng ký
│   ├── LogoutButton.jsx        # Nút đăng xuất
│   ├── MemberHeader.jsx        # Header cho các trang member
│   └── OrdersTab.jsx           # Tab quản lý đơn hàng
├── pages/member/               # Các trang member
│   ├── PostAd.jsx             # Đăng tin bán hàng
│   ├── MyPosts.jsx            # Tin đăng của tôi
│   ├── SavedPosts.jsx         # Tin đã lưu
│   ├── ViewHistory.jsx        # Lịch sử xem tin
│   └── MemberOrders.jsx       # Đơn hàng của tôi
└── styles/member/             # CSS cho member
    ├── index.css              # Import chính
    ├── MemberHeader.css       # Style cho header
    └── OrdersTab.css          # Style cho orders tab
```

---

## 🧩 **COMPONENTS**

### 1. **LoginButton.jsx**
**Mục đích:** Nút đăng nhập hiển thị khi user chưa đăng nhập

**Cú pháp:**
```jsx
import LoginButton from './member/LoginButton';

// Sử dụng
<LoginButton />
```

**Props:** Không có props

**Chức năng:**
- Hiển thị nút "Đăng nhập" với icon User
- Chuyển hướng đến `/login` khi click
- Hover effect với màu xanh (#00A86B)

---

### 2. **UserDropdown.jsx**
**Mục đích:** Dropdown menu cho user đã đăng nhập

**Cú pháp:**
```jsx
import UserDropdown from './member/UserDropdown';

// Sử dụng
<UserDropdown user={user} onLogout={handleLogout} />
```

**Props:**
- `user` (object): Thông tin user
- `onLogout` (function): Callback khi đăng xuất

**Chức năng:**
- Hiển thị avatar và tên user
- Dropdown menu với các tùy chọn
- Link admin (nếu user.role === "admin")
- Nút đăng xuất

**Cấu trúc user object:**
```javascript
{
  fullName: "Nguyễn Văn A",    // hoặc fullname
  email: "user@example.com",
  role: "member" | "admin"
}
```

---

### 3. **GuestDropdown.jsx**
**Mục đích:** Dropdown menu cho user chưa đăng nhập

**Cú pháp:**
```jsx
import GuestDropdown from './member/GuestDropdown';

// Sử dụng
<GuestDropdown />
```

**Props:** Không có props

**Chức năng:**
- Hiển thị icon user mặc định
- Dropdown với menu items và nút đăng nhập/đăng ký

---

### 4. **UserAvatar.jsx**
**Mục đích:** Component hiển thị avatar người dùng

**Cú pháp:**
```jsx
import UserAvatar from './member/UserAvatar';

// Sử dụng
<UserAvatar user={user} size="32px" />
```

**Props:**
- `user` (object): Thông tin user
- `size` (string): Kích thước avatar (default: "32px")

**Chức năng:**
- Hiển thị chữ cái đầu của tên user
- Gradient background xanh
- Responsive size

---

### 5. **UserMenuItems.jsx**
**Mục đích:** Danh sách menu items chung cho dropdown

**Cú pháp:**
```jsx
import UserMenuItems from './member/UserMenuItems';

// Sử dụng
<UserMenuItems onItemClick={handleItemClick} />
```

**Props:**
- `onItemClick` (function): Callback khi click menu item

**Menu items:**
- Tài khoản (`/account`)
- Tin đăng của tôi (`/my-posts`)
- Tin đã lưu (`/saved-posts`)
- Đơn hàng (`/orders`)
- Lịch sử xem tin (`/view-history`)
- Đăng tin ngay (`/post-ad`) - màu xanh đặc biệt

---

### 6. **LoginRegisterButtons.jsx**
**Mục đích:** Nút đăng nhập và đăng ký cho guest dropdown

**Cú pháp:**
```jsx
import LoginRegisterButtons from './member/LoginRegisterButtons';

// Sử dụng
<LoginRegisterButtons onItemClick={handleItemClick} />
```

**Props:**
- `onItemClick` (function): Callback khi click button

**Chức năng:**
- Nút "Đăng nhập" (outline style)
- Nút "Đăng ký" (filled style)
- Hover effects

---

### 7. **LogoutButton.jsx**
**Mục đích:** Nút đăng xuất

**Cú pháp:**
```jsx
import LogoutButton from './member/LogoutButton';

// Sử dụng
<LogoutButton onLogout={handleLogout} />
```

**Props:**
- `onLogout` (function): Callback khi đăng xuất

**Chức năng:**
- Nút đăng xuất màu đỏ
- Hover effect

---

### 8. **MemberHeader.jsx**
**Mục đích:** Header chung cho các trang member

**Cú pháp:**
```jsx
import MemberHeader from './member/MemberHeader';

// Sử dụng
<MemberHeader activeTab="my-posts" />
```

**Props:**
- `activeTab` (string): Tab hiện tại

**Các tab được hỗ trợ:**
- `"post-ad"` → "Đăng tin bán hàng"
- `"my-posts"` → "Tin đăng của tôi"
- `"saved-posts"` → "Tin đã lưu"
- `"view-history"` → "Lịch sử xem tin"
- `"orders"` → "Đơn hàng của tôi"

**Chức năng:**
- Hiển thị title động theo tab
- Nút thông báo với badge
- Bootstrap Card styling

---

### 9. **OrdersTab.jsx**
**Mục đích:** Component quản lý đơn hàng

**Cú pháp:**
```jsx
import OrdersTab from './member/OrdersTab';

// Sử dụng
<OrdersTab orders={orders} formatCurrency={formatCurrency} />
```

**Props:**
- `orders` (array): Danh sách đơn hàng
- `formatCurrency` (function): Function format tiền tệ

**Cấu trúc order object:**
```javascript
{
  id: 1,
  product: "Tên sản phẩm",
  price: 18500000,
  status: "completed" | "shipping" | "pending" | "cancelled",
  date: "2024-01-20",
  image: "/path/to/image.jpg"
}
```

**Chức năng:**
- Lọc đơn hàng theo trạng thái
- Hiển thị thông tin đơn hàng
- Nút "Chi tiết" và "Đánh giá"
- Status colors và text

---

## 📄 **PAGES**

### 1. **PostAd.jsx**
**Mục đích:** Trang đăng tin bán hàng

**Route:** `/post-ad`

**Props:**
- `user` (object): Thông tin user

**Chức năng:**
- Form đăng tin với các trường:
  - Tiêu đề, danh mục, giá, tình trạng
  - Mô tả, địa điểm, số điện thoại
  - Upload hình ảnh
- Validation form
- Submit tin đăng
- Auth check (member hoặc admin)

**Categories:**
```javascript
[
  { value: "xe-may-dien", label: "Xe máy điện" },
  { value: "xe-dap-dien", label: "Xe đạp điện" },
  { value: "phu-kien", label: "Phụ kiện xe điện" },
  { value: "pin-sac", label: "Pin & Sạc" },
  { value: "khac", label: "Khác" }
]
```

---

### 2. **MyPosts.jsx**
**Mục đích:** Quản lý tin đăng của user

**Route:** `/my-posts`

**Props:**
- `user` (object): Thông tin user

**Chức năng:**
- Hiển thị danh sách tin đăng của user
- Filter theo trạng thái (active, pending, expired, sold)
- Actions: Xem, Sửa, Xóa, Gia hạn
- Modal xác nhận xóa
- Auth check

**Post status:**
- `"active"` - Đang hoạt động
- `"pending"` - Chờ duyệt
- `"expired"` - Hết hạn
- `"sold"` - Đã bán

---

### 3. **SavedPosts.jsx**
**Mục đích:** Quản lý tin đăng đã lưu

**Route:** `/saved-posts`

**Props:**
- `user` (object): Thông tin user

**Chức năng:**
- Hiển thị danh sách tin đã lưu
- Filter theo danh mục
- Actions: Xem chi tiết, Bỏ lưu
- Auth check

---

### 4. **ViewHistory.jsx**
**Mục đích:** Lịch sử xem tin

**Route:** `/view-history`

**Props:**
- `user` (object): Thông tin user

**Chức năng:**
- Hiển thị lịch sử xem tin
- Filter theo thời gian và danh mục
- Actions: Xem lại, Xóa khỏi lịch sử
- Auth check

---

### 5. **MemberOrders.jsx**
**Mục đích:** Quản lý đơn hàng

**Route:** `/orders`

**Props:**
- `user` (object): Thông tin user

**Chức năng:**
- Sử dụng `OrdersTab` component
- Auth check
- Mock data cho đơn hàng

---

## 🎨 **STYLES**

### 1. **index.css**
**Mục đích:** Import chính cho tất cả CSS member

```css
@import './MemberHeader.css';
@import './OrdersTab.css';
```

### 2. **MemberHeader.css**
**Classes:**
- `.member-header` - Container chính
- `.member-header-title` - Title styling
- `.member-header-actions` - Actions container
- `.member-notification-btn` - Nút thông báo
- `.member-notification-badge` - Badge thông báo

### 3. **OrdersTab.css**
**Classes:**
- `.orders-tab` - Container chính
- `.orders-header` - Header section
- `.orders-title` - Title styling
- `.orders-filters` - Filter controls
- `.orders-list` - Danh sách đơn hàng
- `.order-item` - Item đơn hàng
- `.order-image` - Hình ảnh sản phẩm
- `.order-content` - Nội dung đơn hàng
- `.order-status` - Trạng thái đơn hàng
- `.order-buttons` - Nút actions

---

## 🔧 **CÁCH SỬ DỤNG**

### 1. **Trong Navbar:**
```jsx
import LoginButton from "./member/LoginButton";
import UserDropdown from "./member/UserDropdown";
import GuestDropdown from "./member/GuestDropdown";

// Trong component
{!user && <LoginButton />}
{user ? (
  <UserDropdown user={user} onLogout={onLogout} />
) : (
  <GuestDropdown />
)}
```

### 2. **Trong App.jsx:**
```jsx
import PostAd from "./pages/member/PostAd";
import MyPosts from "./pages/member/MyPosts";
import SavedPosts from "./pages/member/SavedPosts";
import ViewHistory from "./pages/member/ViewHistory";
import MemberOrders from "./pages/member/MemberOrders";

// Routes
<Route path="/post-ad" element={<PostAd user={user} />} />
<Route path="/my-posts" element={<MyPosts user={user} />} />
<Route path="/saved-posts" element={<SavedPosts user={user} />} />
<Route path="/view-history" element={<ViewHistory user={user} />} />
<Route path="/orders" element={<MemberOrders user={user} />} />
```

### 3. **Auth Check Pattern:**
```jsx
useEffect(() => {
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");
    
    if (!token || !userData) {
      navigate("/login");
      return;
    }
    
    const userRole = JSON.parse(userData).role;
    if (userRole !== "member" && userRole !== "admin") {
      navigate("/");
      return;
    }
    
    setIsCheckingAuth(false);
  };
  
  checkAuth();
}, [navigate]);
```

---

## 🔐 **AUTHENTICATION**

### **User Roles:**
- `"member"` - Thành viên thường
- `"admin"` - Quản trị viên

### **Auth Check:**
Tất cả pages member đều có auth check:
1. Kiểm tra token trong localStorage
2. Kiểm tra userData
3. Kiểm tra role (member hoặc admin)
4. Redirect nếu không hợp lệ

### **Admin Features:**
- Link "Admin" hiển thị trong UserDropdown nếu `user.role === "admin"`
- Truy cập `/admin` page

---

## 📱 **RESPONSIVE**

Tất cả components đều responsive:
- Mobile-first approach
- Flexible layouts
- Touch-friendly buttons
- Adaptive dropdowns

---

## 🎯 **BEST PRACTICES**

1. **Luôn pass user prop** cho các pages member
2. **Implement auth check** trong mọi page member
3. **Sử dụng onItemClick callback** để đóng dropdown
4. **Handle loading states** khi fetch data
5. **Validate form data** trước khi submit
6. **Use toast notifications** cho user feedback

---

## 🐛 **TROUBLESHOOTING**

### **Common Issues:**

1. **Dropdown không đóng:**
   - Đảm bảo pass `onItemClick` callback
   - Check state management

2. **Auth redirect loop:**
   - Kiểm tra localStorage data
   - Verify user role format

3. **Styling conflicts:**
   - Import CSS files đúng thứ tự
   - Check Bootstrap conflicts

4. **Props undefined:**
   - Đảm bảo pass đầy đủ props
   - Check prop types

---

## 📈 **FUTURE ENHANCEMENTS**

1. **Real API integration** thay vì mock data
2. **Image upload** với preview
3. **Pagination** cho danh sách dài
4. **Search & filter** nâng cao
5. **Real-time notifications**
6. **Mobile app integration**

---

*Documentation này được tạo tự động và cập nhật theo code hiện tại.*
