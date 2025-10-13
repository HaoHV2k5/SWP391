import { useEffect, useMemo, useState } from 'react';
import productService from '../services/productService';

// Hook tập trung để lấy danh sách sản phẩm từ backend và chuẩn hóa cấu trúc dữ liệu
export default function useProducts() {
  // State lưu dữ liệu thô từ API
  const [rawProducts, setRawProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Xác định user hiện tại để phân biệt quyền admin/seller
  // Đọc từ localStorage để tránh gọi API /auth/me (BE không có endpoint này)
  const userDataRaw = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
  let isAdmin = false;
  try {
    if (userDataRaw) {
      const userData = JSON.parse(userDataRaw);
      const rolesRaw = userData?.roles || userData?.user?.roles || [];
      // Xử lý roles có thể là array string hoặc array object
      const roles = Array.isArray(rolesRaw)
        ? rolesRaw.map(r => (typeof r === 'string' ? r : r?.name)).filter(Boolean)
        : [];
      // Kiểm tra quyền admin từ roles hoặc role field
      isAdmin = roles.includes('ROLE_ADMIN') || userData?.user?.role === 'ROLE_ADMIN';
    }
  } catch {}

  // Effect gọi API lấy danh sách sản phẩm khi component mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      // Gọi service để lấy danh sách (service sẽ tự xác định endpoint theo quyền)
      const result = await productService.getPublicList();
      if (!mounted) return; // Tránh setState khi component đã unmount
      if (result.success) {
        setRawProducts(Array.isArray(result.data) ? result.data : []);
      } else {
        setError(result.message || 'Không thể tải dữ liệu');
      }
      setLoading(false);
    })();
    return () => {
      mounted = false; // Cleanup để tránh memory leak
    };
  }, []);

  // Memoized function để chuẩn hóa và lọc dữ liệu sản phẩm
  const products = useMemo(() => {
    return rawProducts
      .map((p) => {
        // Chuẩn hóa các trường dữ liệu với fallback values
        const id = p.id || p.productId || p._id;
        const brand = p.vehicle?.brand || p.battery?.brand || p.brand || p.vehicleBrand || p.manufacturer || '';
        const year = String(p.vehicle?.yearManufactured || p.battery?.yearManufactured || p.year || p.modelYear || p.vehicleInfo?.year || '');
        // Chuẩn hóa loại sản phẩm để khớp các trang danh mục
        let type = p.type || p.category || p.vehicleType || '';
        const productTypeUpper = (p.productType || '').toString().toUpperCase();
        if (!type && productTypeUpper) {
          // Map từ enum BE sang route FE
          // VEHICLE => electric-scooter (hiển thị chung cho phương tiện)
          // BATTERY => battery-charger
          if (productTypeUpper === 'VEHICLE') type = 'electric-scooter';
          if (productTypeUpper === 'BATTERY') type = 'battery-charger';
        }
        
        // Nếu Backend trả về VEHICLE, cần xác định là ELECTRIC_SCOOTER hay ELECTRIC_BIKE
        // Dựa vào vehicle.brand hoặc logic khác
        let finalProductType = productTypeUpper;
        if (productTypeUpper === 'VEHICLE') {
          // Tạm thời map VEHICLE thành ELECTRIC_SCOOTER
          // Có thể cần logic phức tạp hơn để phân biệt xe máy và xe đạp
          finalProductType = 'ELECTRIC_SCOOTER';
        }
        const mileage = String(p.mileage || p.kilometers || '');
        const priceNumber = p.price || p.listPrice || p.amount || 0;
        // Format giá tiền theo định dạng Việt Nam
        const price = typeof priceNumber === 'number'
          ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceNumber)
          : String(priceNumber);
        const image = p.imageUrl || p.image || p.thumbnailUrl || '';
        const sellerAddress = p.location || p.address || p.SellerInfo?.sellerAddress || '';
        
        // Logic xử lý trạng thái hiển thị:
        // - Admin xem danh sách đã duyệt -> chỉ hiển thị ACTIVE theo dữ liệu thực tế
        // - Seller/member xem bài của chính mình -> hiển thị cả khi chưa ACTIVE
        const isActiveComputed = p.isActive || (p.status === 'ACTIVE');
        const isActive = isAdmin ? (isActiveComputed || true) : true;
        
        const title = p.title || p.vehicleInfo?.title || p.name || '';
        const description = p.description || p.vehicleInfo?.description || title;
        
        return {
          id,
          title,
          description,
          brand,
          year,
          price,
          image,
          productType: finalProductType, // Sử dụng finalProductType đã map
          SellerInfo: { sellerAddress },
          isActive,
        };
      })
      .filter((item) => item.isActive); // Lọc chỉ hiển thị sản phẩm active
  }, [rawProducts]);

  return { products, loading, error };
}