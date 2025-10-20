# Hướng dẫn Facebook Login

## Tổng quan

Frontend đã được tích hợp Facebook Login sử dụng OAuth2 flow với backend Spring Boot.

## Cấu trúc code

### 1. Services

- **`authService.jsx`**: Chứa `facebookAuthService` để xử lý Facebook OAuth
- **`LoginPage.jsx`**: Có nút "Đăng nhập với Facebook"
- **`FacebookCallbackPage.jsx`**: Xử lý callback từ Facebook OAuth
- **`App.jsx`**: Route `/facebook-callback` cho callback page

### 2. Backend Integration

- **`RedirectController.java`**: Xử lý OAuth success và redirect về frontend
- **`AuthService.java`**: Xử lý logic đăng nhập Facebook
- **`application.properties`**: Cấu hình Facebook OAuth

## Luồng hoạt động

### 1. User nhấn "Đăng nhập với Facebook"

```javascript
// LoginPage.jsx
const handleFacebookLogin = () => {
  facebookAuthService.loginWithFacebook();
};
```

### 2. Redirect đến Facebook OAuth

```javascript
// authService.jsx
loginWithFacebook() {
  window.location.href = `${API_BASE_URL}/oauth2/authorization/facebook`;
}
```

### 3. Facebook xử lý OAuth và redirect về backend

- URL: `http://localhost:3979/login/oauth2/code/facebook`
- Backend xử lý OAuth token và tạo JWT
- Backend redirect về frontend với token trong URL

### 4. Frontend xử lý callback

```javascript
// FacebookCallbackPage.jsx
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");
const email = urlParams.get("email");
const name = urlParams.get("name");
```

### 5. Đăng nhập thành công

- Lưu token vào localStorage
- Cập nhật user state
- Chuyển hướng đến trang phù hợp

## Cấu hình Backend

### application.properties

```properties
# Facebook OAuth
spring.security.oauth2.client.registration.facebook.client-id=YOUR_APP_ID
spring.security.oauth2.client.registration.facebook.client-secret=YOUR_APP_SECRET
spring.security.oauth2.client.registration.facebook.scope=public_profile
spring.security.oauth2.client.registration.facebook.redirect-uri={baseUrl}/login/oauth2/code/facebook
spring.security.oauth2.client.registration.facebook.client-name=Facebook

spring.security.oauth2.client.provider.facebook.authorization-uri=https://www.facebook.com/v20.0/dialog/oauth
spring.security.oauth2.client.provider.facebook.token-uri=https://graph.facebook.com/v20.0/oauth/access_token
spring.security.oauth2.client.provider.facebook.user-info-uri=https://graph.facebook.com/me?fields=id,name,email,picture
spring.security.oauth2.client.provider.facebook.user-name-attribute=id
```

## Thông tin lấy được từ Facebook

### Scope hiện tại: `public_profile`

- ✅ **id**: Facebook ID
- ✅ **name**: Tên đầy đủ
- ✅ **email**: Email (có thể null nếu tài khoản dùng số điện thoại)
- ✅ **picture**: URL ảnh đại diện

### Xử lý email null

Nếu tài khoản Facebook dùng số điện thoại, backend sẽ throw exception `EMAIL_NULL`. Cần xử lý case này trong frontend.

## Testing

### 1. Khởi động ứng dụng

```bash
# Backend
cd SWP391/Backend
./mvnw spring-boot:run

# Frontend
cd SWP391/Frontend
npm run dev
```

### 2. Test Facebook Login

1. Truy cập `http://localhost:5173/login`
2. Nhấn "Đăng nhập với Facebook"
3. Đăng nhập Facebook và cấp quyền
4. Kiểm tra redirect về frontend và đăng nhập thành công

## Troubleshooting

### 1. Lỗi "Invalid redirect URI"

- Kiểm tra Facebook App settings
- Đảm bảo redirect URI khớp với cấu hình

### 2. Lỗi "Email null"

- Tài khoản Facebook dùng số điện thoại
- Cần xử lý case này trong backend hoặc yêu cầu user nhập email

### 3. Lỗi CORS

- Kiểm tra cấu hình CORS trong backend
- Đảm bảo frontend URL được whitelist

## Mở rộng

### Thêm scope khác

```properties
# Trong application.properties
spring.security.oauth2.client.registration.facebook.scope=public_profile,email,user_birthday,user_gender
```

### Lấy thêm thông tin

```properties
# Cập nhật user-info-uri
spring.security.oauth2.client.provider.facebook.user-info-uri=https://graph.facebook.com/me?fields=id,name,email,picture,birthday,gender
```

## Security Notes

1. **Client Secret**: Không bao giờ expose trong frontend
2. **Token**: Lưu an toàn trong localStorage
3. **HTTPS**: Sử dụng HTTPS trong production
4. **Validation**: Validate tất cả data từ OAuth provider

