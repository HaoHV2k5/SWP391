import displayService from "./displayService";

// ==================== FILTER SERVICE ====================
// Dịch vụ filter: chuyên xử lý việc lấy và xử lý dữ liệu filter

const filterService = {
  // 🔧 PHỤ: Lấy danh sách filter options từ dữ liệu sản phẩm (brands, years, types)
  // 📍 Logic: Gọi getPublicList() rồi xử lý dữ liệu
  // 👥 Users: Guest, Member (không cần auth)
  async getFilterOptions() {
    try {
      const result = await displayService.getPublicList();
      if (!result.success) {
        return { success: false, message: result.message };
      }

      const products = result.data;

      // Lấy danh sách brands duy nhất - chuẩn hóa và loại bỏ trùng lặp
      const brands = [
        ...new Set(
          products
            .map((product) => {
              const brand = product.vehicle?.brand || product.battery?.brand;
              return brand ? brand.trim().toLowerCase() : null;
            })
            .filter((brand) => brand)
        ),
      ].sort();

      // Lấy danh sách years duy nhất
      const years = [
        ...new Set(
          products
            .map(
              (product) =>
                product.vehicle?.yearManufactured ||
                product.battery?.yearManufactured
            )
            .filter((year) => year)
        ),
      ].sort((a, b) => b - a); // Sắp xếp giảm dần

      // Lấy product types
      const productTypes = [
        ...new Set(products.map((product) => product.productType)),
      ];

      return {
        success: true,
        data: {
          brands,
          years,
          productTypes,
        },
      };
    } catch (error) {
      console.error("getFilterOptions thất bại", error);
      return { success: false, message: "Lỗi lấy filter options" };
    }
  }
};

export default filterService;
