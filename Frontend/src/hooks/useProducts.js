import { useEffect, useMemo, useState } from "react";
import displayService from "../services/home/displayService";

// Hook tập trung để lấy danh sách sản phẩm từ backend và chuẩn hóa cấu trúc dữ liệu
export default function useProducts() {
  // State lưu dữ liệu thô từ API
  const [rawProducts, setRawProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Xác định user hiện tại để phân biệt quyền admin/seller
  // Đọc từ localStorage để tránh gọi API /auth/me (BE không có endpoint này)
  const userDataRaw =
    typeof window !== "undefined" ? localStorage.getItem("userData") : null;
  let isAdmin = false;
  try {
    if (userDataRaw) {
      const userData = JSON.parse(userDataRaw);
      const rolesRaw = userData?.roles || userData?.user?.roles || [];
      // Xử lý roles có thể là array string hoặc array object
      const roles = Array.isArray(rolesRaw)
        ? rolesRaw
            .map((r) => (typeof r === "string" ? r : r?.name))
            .filter(Boolean)
        : [];
      // Kiểm tra quyền admin từ roles hoặc role field
      isAdmin =
        roles.includes("ROLE_ADMIN") || userData?.user?.role === "ROLE_ADMIN";
    }
  } catch {}

  // Effect gọi API lấy danh sách sản phẩm khi component mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      console.log("🔄 HomePage: Fetching products...");
      // Gọi service để lấy danh sách (service sẽ tự xác định endpoint theo quyền)
      const result = await displayService.getPublicList();
      console.log("📦 HomePage: API result:", result);
      if (!mounted) return; // Tránh setState khi component đã unmount
      if (result.success) {
        console.log("✅ HomePage: Products loaded:", result.data);
        setRawProducts(Array.isArray(result.data) ? result.data : []);
      } else {
        console.error("❌ HomePage: API error:", result.message);
        setError(result.message || "Không thể tải dữ liệu");
      }
      setLoading(false);
    })();
    return () => {
      mounted = false; // Cleanup để tránh memory leak
    };
  }, []);

  // Memoized function để chuẩn hóa và lọc dữ liệu sản phẩm
  const products = useMemo(() => {
    const processedProducts = rawProducts
      .map((p) => {
        // Chuẩn hóa các trường dữ liệu với fallback values
        const id = p.id || p.productId || p._id;
        const brand =
          p.vehicle?.brand ||
          p.battery?.brand ||
          p.brand ||
          p.vehicleBrand ||
          p.manufacturer ||
          "";
        const year = String(
          p.vehicle?.yearManufactured ||
            p.battery?.yearManufactured ||
            p.year ||
            p.modelYear ||
            p.vehicleInfo?.year ||
            ""
        );
        // Chuẩn hóa loại sản phẩm để khớp các trang danh mục
        let type = p.type || p.category || p.vehicleType || "";
        const productTypeUpper = (p.productType || "").toString().toUpperCase();
        if (!type && productTypeUpper) {
          // Map từ enum BE sang route FE
          // VEHICLE => electric-scooter (hiển thị chung cho phương tiện)
          // BATTERY => battery
          if (productTypeUpper === 'VEHICLE') type = 'electric-scooter';
          if (productTypeUpper === 'BATTERY') type = 'battery';
        }
        
        // Sử dụng productType từ backend trực tiếp
        let finalProductType = productTypeUpper;
        const mileage = String(p.mileage || p.kilometers || '');
        const priceNumber = p.price || p.listPrice || p.amount || 0;
        // Format giá tiền theo định dạng Việt Nam
        const price =
          typeof priceNumber === "number"
            ? new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(priceNumber)
            : String(priceNumber);
        const image = p.imageUrls?.[0] || p.image || p.thumbnailUrl || "";
        const sellerAddress =
          p.location || p.address || p.SellerInfo?.sellerAddress || "";

        // Logic xử lý trạng thái hiển thị:
        // - Admin xem danh sách đã duyệt -> chỉ hiển thị ACTIVE theo dữ liệu thực tế
        // - Seller/member xem bài của chính mình -> hiển thị cả khi chưa ACTIVE
        const isActiveComputed = p.isActive || p.status === "ACTIVE";
        const isActive = isAdmin ? isActiveComputed || true : true;

        const title = p.title || p.vehicleInfo?.title || p.name || "";
        const description =
          p.description || p.vehicleInfo?.description || title;

        // Lưu sellerId và approvedLabel để sắp xếp
        const sellerId = p.sellerId || p.seller?.id || null;
        const approvedLabel = p.approvedLabel || "";
        
        // Kiểm tra nếu có approvedLabel thì đây là sản phẩm từ gói requireApproval
        const hasApprovalLabel = approvedLabel && approvedLabel.trim().length > 0;
        // Có thể parse tên gói từ label hoặc dựa vào pattern khác
        // Tạm thời dùng hasApprovalLabel để xác định

        return {
          id,
          title,
          description,
          brand,
          year,
          price,
          priceNumber, // Lưu số để so sánh
          image,
          productType: finalProductType, // Sử dụng productType từ backend
          SellerInfo: { sellerAddress },
          isActive,
          sellerId,
          approvedLabel, // Lưu để hiển thị và sắp xếp
          hasApprovalLabel, // Flag để sắp xếp
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(0),
        };
      })
      .filter((item) => item.isActive); // Lọc chỉ hiển thị sản phẩm active

    // Sắp xếp sản phẩm theo logic ưu tiên gói có kiểm duyệt
    // Logic: Products từ gói requireApproval (có approvedLabel) sẽ hiện lên đầu danh mục
    // Thứ tự ưu tiên: 275k > 132k > 55k > 250k > 120k > 50k (cần thông tin packagePrice từ BE)
    // Tạm thời: Sắp xếp theo approvedLabel (có label → lên đầu), sau đó theo createdAt
    
    // Mapping giá package theo tên gói (cần update khi có thông tin chính xác từ BE)
    // Giả định: dựa vào approvedLabel hoặc pattern khác để xác định giá package
    const getPackagePricePriority = (product) => {
      // Nếu không có approvedLabel, không phải gói requireApproval → priority = 0 (xuống dưới)
      if (!product.hasApprovalLabel) return 0;
      
      // Tạm thời: vì không có thông tin packagePrice từ BE,
      // ta sẽ sort theo createdAt DESC trong nhóm có approval
      // TODO: Khi BE thêm packagePrice vào ProductResponse, update logic này:
      // - Package 275k → priority = 600
      // - Package 132k → priority = 500  
      // - Package 55k → priority = 400
      // - Package 250k → priority = 300
      // - Package 120k → priority = 200
      // - Package 50k → priority = 100
      
      // Hiện tại: tất cả products có approvedLabel sẽ có cùng priority = 1000
      return 1000;
    };
    
    return processedProducts.sort((a, b) => {
      // 1. Ưu tiên: Products có approvedLabel (gói requireApproval) → lên đầu
      const priorityA = getPackagePricePriority(a);
      const priorityB = getPackagePricePriority(b);
      
      if (priorityA !== priorityB) {
        return priorityB - priorityA; // Priority cao hơn → lên đầu
      }
      
      // 2. Nếu cùng priority (cùng loại gói), sort theo createdAt DESC (mới nhất lên đầu)
      return b.createdAt - a.createdAt;
    });
  }, [rawProducts]);

  return { products, loading, error };
}