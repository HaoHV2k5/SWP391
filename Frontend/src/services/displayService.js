import { apiClient } from "./authService";

// ==================== DISPLAY SERVICE ====================
// Dịch vụ hiển thị sản phẩm: chuyên xử lý việc lấy và hiển thị danh sách sản phẩm

const displayService = {
  // ==================== DISPLAY PRODUCTS API ====================
  // 🏠 CHÍNH: Lấy danh sách sản phẩm hiển thị trên trang chủ/HomePage
  // 📍 Endpoints: /products, /products/seller?username=xxx, /products/seller/staff_approved/admin
  // 👥 Users: Guest, Member, Admin (tự động detect quyền)
  async getPublicList() {
    let endpoint = "";
    try {
      // Không gọi /auth/me (BE không có). Đọc từ localStorage để xác định quyền/username
      const userDataRaw = localStorage.getItem("userData");

      if (userDataRaw) {
        try {
          const userData = JSON.parse(userDataRaw);
          const rolesRaw = userData?.roles || userData?.user?.roles || [];
          const roles = Array.isArray(rolesRaw)
            ? rolesRaw
                .map((r) => (typeof r === "string" ? r : r?.name))
                .filter(Boolean)
            : [];
          const isAdmin =
            roles.includes("ROLE_ADMIN") ||
            userData?.user?.role === "ROLE_ADMIN";
          const username =
            userData?.username ||
            userData?.user?.username ||
            userData?.email ||
            userData?.user?.email;

          if (isAdmin) {
            endpoint = "/products/seller/staff_approved/admin";
          } else if (username) {
            endpoint = `/products/seller?username=${encodeURIComponent(
              username
            )}`;
          }
        } catch (e) {
          console.error("❌ getPublicList: Error parsing userData:", e);
        }
      }

      // Chưa đăng nhập hoặc không xác định được endpoint phù hợp thì
      // gọi endpoint công khai đang có trong BE
      if (!endpoint) {
        endpoint = "/products"; // BE hiện có GET /products trả danh sách đã post
      }

      const response = await apiClient.get(endpoint);
      // BE thường bọc dữ liệu trong ApiResponse { data, message }
      const data =
        response?.data?.data ?? response?.data?.content ?? response?.data;
      
      console.log("📦 getPublicList: Loaded", Array.isArray(data) ? data.length : 0, "products from", endpoint);
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      
      // Nếu không có token và bị chặn/không tìm thấy, trả rỗng để không vỡ UI
      if (
        !localStorage.getItem("token") &&
        (status === 404 || status === 401)
      ) {
        return { success: true, data: [] };
      }
      
      // Nếu lỗi 500 (Internal Server Error), trả về dữ liệu rỗng để không vỡ UI
      if (status === 500) {
        return { success: true, data: [] };
      }
      
      console.error("❌ getPublicList failed:", endpoint, status, backendMessage);
      return { success: false, message: `Lỗi tải sản phẩm (${status || "network"}): ${backendMessage || "Không rõ"}` };
    }
  }
};

export default displayService;
