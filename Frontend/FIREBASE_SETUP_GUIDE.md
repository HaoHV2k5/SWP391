# Hướng dẫn cấu hình Firebase Authentication

## Tổng quan

Dự án đã được chuyển đổi từ OAuth2 sang Firebase Authentication cho Google và Facebook login.

## Các bước cấu hình

### 1. Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Đặt tên project và chọn region (nên chọn asia-southeast1 cho Việt Nam)

### 2. Bật Authentication

1. Trong Firebase Console, chọn **Authentication** từ menu bên trái
2. Chọn tab **Sign-in method**
3. Bật **Google** provider:
   - Click vào Google
   - Bật **Enable**
   - Chọn **Project support email**
   - Lưu lại
4. Bật **Facebook** provider:
   - Click vào Facebook
   - Bật **Enable**
   - Nhập **App ID** và **App Secret** từ Facebook Developer Console
   - Lưu lại

### 3. Lấy Firebase Config

1. Trong Firebase Console, chọn **Project Settings** (biểu tượng bánh răng)
2. Scroll xuống phần **Your apps**
3. Click **Add app** và chọn **Web** (biểu tượng `</>`)
4. Đặt tên app (ví dụ: "SWP Frontend")
5. Copy config object:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};
```

### 4. Cấu hình Environment Variables

1. Copy file `firebase-config-example.env` thành `.env`
2. Thay thế các giá trị trong `.env`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

### 5. Cấu hình Facebook App (nếu chưa có)

1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Tạo app mới hoặc chọn app hiện có
3. Thêm **Facebook Login** product
4. Cấu hình **Valid OAuth Redirect URIs**:
   - `https://your-project.firebaseapp.com/__/auth/handler`
   - `http://localhost:5173` (cho development)
5. Lấy **App ID** và **App Secret**
6. Cập nhật trong Firebase Console

### 6. Cấu hình Domain cho Production

1. Trong Firebase Console > Authentication > Settings
2. Thêm domain của bạn vào **Authorized domains**:
   - `yourdomain.com`
   - `www.yourdomain.com`

## Cấu trúc code mới

### Files đã tạo/cập nhật:

- `src/firebase/config.js` - Cấu hình Firebase
- `src/services/firebaseAuthService.js` - Service xử lý Firebase Auth
- `src/pages/LoginPage.jsx` - Cập nhật để sử dụng Firebase
- `src/App.jsx` - Cập nhật auth state listener
- `src/main.jsx` - Loại bỏ GoogleOAuthProvider

### Files đã xóa:

- `src/pages/FacebookCallbackPage.jsx` - Không cần thiết với Firebase
- `FACEBOOK_LOGIN_GUIDE.md` - Hướng dẫn cũ

## Luồng hoạt động mới

### 1. User nhấn "Đăng nhập với Google/Facebook"

```javascript
// LoginPage.jsx
const handleGoogleLogin = async () => {
  const result = await firebaseAuthService.signInWithGoogle();
  if (result.success) {
    onLogin(result.data);
  }
};
```

### 2. Firebase xử lý authentication

- Firebase hiển thị popup đăng nhập
- User đăng nhập với Google/Facebook
- Firebase trả về user object và token

### 3. App cập nhật state

```javascript
// App.jsx
useEffect(() => {
  const unsubscribe = firebaseAuthService.onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      // User đã đăng nhập
      setUser(createUserData(firebaseUser));
    } else {
      // User đã đăng xuất
      setUser(null);
    }
  });
}, []);
```

## Lợi ích của Firebase Auth

1. **Đơn giản hóa**: Không cần xử lý OAuth2 flow phức tạp
2. **Bảo mật**: Firebase xử lý tất cả security concerns
3. **Tự động refresh token**: Firebase tự động refresh token
4. **Cross-platform**: Có thể sử dụng cho mobile app sau này
5. **Real-time**: Auth state được sync real-time

## Troubleshooting

### Lỗi thường gặp:

1. **"Firebase: Error (auth/popup-closed-by-user)"**

   - User đóng popup đăng nhập
   - Xử lý bình thường, không cần action

2. **"Firebase: Error (auth/popup-blocked)"**

   - Popup bị chặn bởi browser
   - Hướng dẫn user cho phép popup

3. **"Firebase: Error (auth/account-exists-with-different-credential)"**
   - Email đã được đăng ký với provider khác
   - Hướng dẫn user đăng nhập với provider đã đăng ký

### Debug:

1. Mở Developer Tools > Console
2. Kiểm tra Firebase config có đúng không
3. Kiểm tra network requests
4. Kiểm tra Firebase Console > Authentication > Users

## Migration từ OAuth2

### Những gì đã thay đổi:

1. **Backend**: Không cần xử lý OAuth2 callbacks
2. **Frontend**: Sử dụng Firebase SDK thay vì redirect flow
3. **Token**: Sử dụng Firebase ID token thay vì JWT từ backend
4. **State management**: Firebase Auth state listener thay vì localStorage

### Những gì giữ nguyên:

1. **User data structure**: Vẫn giữ format user object cũ
2. **Role management**: Vẫn sử dụng role system hiện tại
3. **API calls**: Vẫn sử dụng token để gọi API backend
4. **UI/UX**: Giao diện đăng nhập không thay đổi
