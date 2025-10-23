// Giải pháp đơn giản: Firebase Authentication hoạt động độc lập
// Firebase users sẽ có thể sử dụng app mà không cần backend sync

import firebaseAuthService from "./firebaseAuthService";
import apiClient from "./apiClient";

class UserSyncService {
  // Firebase user authentication - không cần sync với backend
  async syncFirebaseUserWithBackend(firebaseUser) {
    try {
      console.log("🔄 Firebase user authenticated successfully!");

      // Lấy Firebase token
      const firebaseToken = await firebaseUser.getIdToken();

      // Tạo user data với Firebase token
      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        fullName: firebaseUser.displayName,
        avatar: firebaseUser.photoURL,
        role: "member",
        provider: firebaseUser.providerData[0]?.providerId || "firebase",
        firebaseUid: firebaseUser.uid,
        username: firebaseUser.email,
        verified: true,
        locked: false,
      };

      console.log("✅ Firebase user ready:", userData);

      return {
        success: true,
        backendToken: firebaseToken, // Sử dụng Firebase token
        userData: userData,
        message: "Firebase Authentication hoạt động độc lập",
      };
    } catch (error) {
      console.error("❌ Error getting Firebase token:", error);
      return {
        success: false,
        message: "Lỗi lấy Firebase token",
      };
    }
  }

  // Fallback khi có lỗi
  async createFirebaseUserFallback(firebaseUser) {
    try {
      console.log("🔄 Creating Firebase user fallback...");

      const firebaseToken = await firebaseUser.getIdToken();

      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        fullName: firebaseUser.displayName,
        avatar: firebaseUser.photoURL,
        role: "member",
        provider: firebaseUser.providerData[0]?.providerId || "firebase",
        firebaseUid: firebaseUser.uid,
        username: firebaseUser.email,
        verified: true,
        locked: false,
      };

      console.log("✅ Firebase fallback user created:", userData);

      return {
        success: true,
        backendToken: firebaseToken,
        userData: userData,
        warning: "Sử dụng Firebase token - Backend chưa có sẵn",
      };
    } catch (error) {
      console.error("❌ Error creating Firebase fallback:", error);

      return {
        success: false,
        message: "Lỗi tạo Firebase fallback user",
      };
    }
  }
}

export default new UserSyncService();
