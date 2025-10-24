import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../firebase/config.js";

class FirebaseAuthService {
  constructor() {
    this.auth = auth;
    this.googleProvider = googleProvider;
    this.facebookProvider = facebookProvider;
  }

  // Google Sign In
  async signInWithGoogle() {
    try {
      console.log("🔄 Starting Google login...");
      const result = await signInWithPopup(this.auth, this.googleProvider);
      const user = result.user;

      console.log("✅ Google login successful, using Firebase token...");

      // Sử dụng Firebase token trực tiếp
      const token = await user.getIdToken();
      const userData = {
        id: user.uid,
        email: user.email,
        fullName: user.displayName,
        avatar: user.photoURL,
        role: "member",
        provider: "google",
        token: token,
        firebaseUid: user.uid,
      };

      console.log("✅ Google login successful:", userData);

      return {
        success: true,
        data: userData,
      };
    } catch (error) {
      console.error("Google sign in error:", error);

      // Nếu user đóng popup, không hiển thị lỗi
      if (error.code === "auth/popup-closed-by-user") {
        return {
          success: false,
          cancelled: true,
          message: "Đăng nhập bị hủy",
        };
      }

      return {
        success: false,
        message: this.getErrorMessage(error.code),
      };
    }
  }

  // Facebook Sign In
  async signInWithFacebook() {
    try {
      console.log("🔄 Starting Facebook login...");
      const result = await signInWithPopup(this.auth, this.facebookProvider);
      const user = result.user;

      console.log("✅ Facebook login successful, using Firebase token...");

      // Sử dụng Firebase token trực tiếp
      const token = await user.getIdToken();
      const userData = {
        id: user.uid,
        email: user.email,
        fullName: user.displayName,
        avatar: user.photoURL,
        role: "member",
        provider: "facebook",
        token: token,
        firebaseUid: user.uid,
      };

      console.log("✅ Facebook login successful:", userData);

      return {
        success: true,
        data: userData,
      };
    } catch (error) {
      console.error("Facebook sign in error:", error);

      // Nếu user đóng popup, không hiển thị lỗi
      if (error.code === "auth/popup-closed-by-user") {
        return {
          success: false,
          cancelled: true,
          message: "Đăng nhập bị hủy",
        };
      }

      return {
        success: false,
        message: this.getErrorMessage(error.code),
      };
    }
  }

  // Sign Out
  async signOut() {
    try {
      await signOut(this.auth);
      console.log("✅ Sign out successful");
      return {
        success: true,
        message: "Đăng xuất thành công",
      };
    } catch (error) {
      console.error("Sign out error:", error);
      return {
        success: false,
        message: "Đăng xuất thất bại",
      };
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(this.auth, callback);
  }

  // Get current user
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Get current user token
  async getCurrentUserToken() {
    const user = this.getCurrentUser();
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  // Error message mapping
  getErrorMessage(errorCode) {
    const errorMessages = {
      "auth/popup-closed-by-user": "Đăng nhập bị hủy bởi người dùng",
      "auth/popup-blocked": "Popup bị chặn bởi trình duyệt",
      "auth/cancelled-popup-request": "Yêu cầu đăng nhập bị hủy",
      "auth/account-exists-with-different-credential":
        "Tài khoản đã tồn tại với phương thức đăng nhập khác",
      "auth/email-already-in-use": "Email đã được sử dụng",
      "auth/weak-password": "Mật khẩu quá yếu",
      "auth/invalid-email": "Email không hợp lệ",
      "auth/user-disabled": "Tài khoản bị vô hiệu hóa",
      "auth/user-not-found": "Không tìm thấy tài khoản",
      "auth/wrong-password": "Mật khẩu không đúng",
      "auth/too-many-requests": "Quá nhiều yêu cầu, vui lòng thử lại sau",
      "auth/network-request-failed": "Lỗi kết nối mạng",
      "auth/requires-recent-login":
        "Vui lòng đăng nhập lại để thực hiện hành động này",
    };
    return errorMessages[errorCode] || "Có lỗi xảy ra khi đăng nhập";
  }
}

// Export singleton instance
export default new FirebaseAuthService();
