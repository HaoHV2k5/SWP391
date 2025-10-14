import { apiClient, authService } from "./authService";

// Dịch vụ sản phẩm: gom tất cả các lời gọi API liên quan đến sản phẩm
const productService = {
  // Lấy danh sách sản phẩm hiển thị trên trang chủ
  // Lưu ý: Hiện tại BE chưa có endpoint công khai cho khách (guest).
  // Logic dưới đây tự xác định endpoint theo quyền người dùng:
  // - ADMIN: gọi /products/seller/staff_approved/admin
  // - SELLER/MEMBER: gọi /products/seller?username=<username>
  // - GUEST: thử gọi sẵn /api/v1/products/active (để sau BE mở là dùng ngay)
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
        } catch {}
      }

      // Chưa đăng nhập hoặc không xác định được endpoint phù hợp thì
      // thử gọi endpoint công khai (để sau BE mở là dùng được ngay)
      if (!endpoint) {
        endpoint = "/api/v1/products/active"; // BE có thể mở trong tương lai
      }

      const response = await apiClient.get(endpoint);
      // BE thường bọc dữ liệu trong ApiResponse { data, message }
      const data =
        response?.data?.data ?? response?.data?.content ?? response?.data;
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      console.error("getPublicList thất bại", {
        endpoint,
        status,
        backendMessage,
      });
      // Nếu BE chưa mở endpoint công khai, trả danh sách rỗng để không vỡ UI
      if (
        !localStorage.getItem("token") &&
        (status === 404 || status === 401)
      ) {
        return { success: true, data: [] };
      }
      return {
        success: false,
        message: `Lỗi tải sản phẩm (${status || "network"}): ${
          backendMessage || "Không rõ"
        }`,
      };
    }
  },
};

export default productService;
