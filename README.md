# Nền tảng giao dịch pin và xe điện

Frontend của ứng dụng giao dịch pin và xe điện qua sử dụng, được xây dựng bằng React + Vite.

## Tính năng

- 🏠 **Homepage**: Trang chủ với giao diện hiện đại, hiển thị sản phẩm nổi bật
- 🔐 **Đăng nhập/Đăng ký**: Form đăng nhập và đăng ký với validation
- 👨‍💼 **Admin Panel**: Dashboard quản lý người dùng, sản phẩm và đơn hàng
- 📱 **Responsive**: Giao diện tương thích với mọi thiết bị
- 🎨 **UI/UX**: Giao diện đẹp mắt với gradient và animation

## Công nghệ sử dụng

- **React 18**: Thư viện UI
- **Vite**: Build tool nhanh
- **React Router**: Điều hướng trang
- **Axios**: HTTP client
- **Lucide React**: Icon library
- **CSS3**: Styling với gradient và animation

## Cài đặt và chạy

### Yêu cầu hệ thống

- Node.js >= 16.0.0
- npm >= 8.0.0

### Cài đặt dependencies

```bash
npm install
```

### Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

### Build cho production

```bash
npm run build
```

### Preview build

```bash
npm run preview
```

## Cấu trúc thư mục

```
src/
├── components/          # Các component tái sử dụng
│   └── Navbar.jsx      # Navigation bar
├── pages/              # Các trang chính
│   ├── HomePage.jsx    # Trang chủ
│   ├── LoginPage.jsx   # Trang đăng nhập/đăng ký
│   └── AdminPage.jsx   # Trang quản trị
├── services/           # API services
│   └── authService.js  # Service xử lý authentication
├── utils/              # Utility functions
├── assets/             # Static assets
├── App.jsx            # Component chính
├── App.css            # Global styles
├── index.css          # Base styles
└── main.jsx           # Entry point
```

## API Integration

Frontend được tích hợp với Spring Boot backend thông qua các endpoint:

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/auth/me` - Lấy thông tin user
- `POST /api/auth/logout` - Đăng xuất

## Tính năng chính

### Homepage

- Hero section với search bar
- Features section giới thiệu dịch vụ
- Products showcase
- Statistics section

### Login/Register

- Form validation
- Password visibility toggle
- Error handling
- Responsive design

### Admin Panel

- Dashboard với thống kê
- Quản lý người dùng
- Quản lý sản phẩm
- Quản lý đơn hàng
- Search và filter

## Customization

### Thay đổi màu sắc

Chỉnh sửa CSS variables trong `src/App.css`:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
}
```

### Thêm trang mới

1. Tạo component trong `src/pages/`
2. Thêm route trong `src/App.jsx`
3. Thêm link trong `src/components/Navbar.jsx`

## Troubleshooting

### Lỗi CORS

Đảm bảo backend Spring Boot đã cấu hình CORS cho frontend domain.

### Lỗi kết nối API

Kiểm tra:

- Backend có đang chạy không
- URL API trong `src/services/authService.js` có đúng không
- Port 8080 có bị chiếm dụng không

### Lỗi build

```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

## Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License


