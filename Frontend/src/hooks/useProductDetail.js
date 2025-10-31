import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import productService from "../services/productService";

// Custom hook để xử lý logic của ProductDetail
export const useProductDetailLogic = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      const res = await productService.getProductById(id);
      if (!mounted) return;
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || "Không thể tải chi tiết sản phẩm");
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [id]);

  // Lấy danh sách hình ảnh
  const images = Array.isArray(data?.imageUrls) && data.imageUrls.length > 0 
    ? data.imageUrls 
    : ["data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPi"];

  const mainImage = images[currentImageIndex];

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(Number(price || 0));
  };

  // Format ngày tháng - Hiển thị ngày giờ thực tế từ database
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      // Format theo định dạng Việt Nam: DD/MM/YYYY HH:mm
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Lấy thông tin chi tiết theo loại sản phẩm
  const getProductDetails = () => {
    if (!data) return { type: '', brand: '', model: '', year: '', details: [] };
    
    if (data.productType === 'VEHICLE' && data.vehicle) {
      // Helper function để format giá trị
      const formatValue = (value, isNumber = false, suffix = '') => {
        if (value === null || value === undefined || value === '') {
          return null; // Trả về null thay vì 'Chưa cập nhật'
        }
        if (isNumber) {
          // Với số, kể cả 0 cũng là giá trị hợp lệ
          return `${value}${suffix}`;
        }
        return value;
      };
      
      const details = [
        { label: 'Hãng xe', value: formatValue(data.vehicle.brand) },
        { label: 'Model', value: formatValue(data.vehicle.model) },
        { label: 'Năm sản xuất', value: formatValue(data.vehicle.yearManufactured, true) },
        // Số km đã đi
        { 
          label: 'Số km đã đi (km)', 
          value: data.vehicle.odometer !== null && data.vehicle.odometer !== undefined && data.vehicle.odometer !== '' 
            ? `${parseInt(data.vehicle.odometer).toLocaleString('vi-VN')} km` 
            : null 
        },
        // Loại pin
        { 
          label: 'Loại pin', 
          value: formatValue(data.vehicle.batteryType) 
        },
        // Dung lượng pin
        { 
          label: 'Dung lượng pin (kWh)', 
          value: data.vehicle.batteryCapacityKWh !== null && data.vehicle.batteryCapacityKWh !== undefined && data.vehicle.batteryCapacityKWh !== '' 
            ? `${data.vehicle.batteryCapacityKWh} kWh` 
            : null 
        },
        // Quãng đường 1 lần sạc
        { 
          label: 'Quãng đường 1 lần sạc (km)', 
          value: data.vehicle.rangePerChargeKm !== null && data.vehicle.rangePerChargeKm !== undefined && data.vehicle.rangePerChargeKm !== '' 
            ? `${data.vehicle.rangePerChargeKm} km` 
            : null 
        }
      ].filter(detail => detail.value !== null); // Lọc bỏ các field không có dữ liệu
      
      return {
        type: 'Xe điện',
        brand: data.vehicle.brand,
        model: data.vehicle.model,
        year: data.vehicle.yearManufactured,
        details
      };
    } else if (data.productType === 'BATTERY' && data.battery) {
      // Helper function để format giá trị
      const formatValue = (value, isNumber = false) => {
        if (value === null || value === undefined || value === '') {
          return null; // Trả về null thay vì 'Chưa cập nhật'
        }
        if (isNumber) {
          // Với số, kể cả 0 cũng là giá trị hợp lệ
          return value;
        }
        return value;
      };
      
      const details = [
        { label: 'Hãng pin', value: formatValue(data.battery.brand) },
        { label: 'Model', value: formatValue(data.battery.model) },
        { label: 'Năm sản xuất', value: formatValue(data.battery.yearManufactured, true) },
        // Mức pin
        { 
          label: 'Mức pin (%)', 
          value: data.battery.batteryLevel !== null && data.battery.batteryLevel !== undefined && data.battery.batteryLevel !== ''
            ? `${data.battery.batteryLevel}%` 
            : null 
        },
        // Độ bền pin - SoH
        { 
          label: 'Độ bền pin - SoH (%)', 
          value: data.battery.sohPercent !== null && data.battery.sohPercent !== undefined && data.battery.sohPercent !== ''
            ? `${data.battery.sohPercent}%` 
            : null 
        },
        // Loại pin
        { 
          label: 'Loại pin', 
          value: formatValue(data.battery.batteryType) 
        },
        // Điện áp
        { 
          label: 'Điện áp (V)', 
          value: data.battery.voltage !== null && data.battery.voltage !== undefined && data.battery.voltage !== ''
            ? `${data.battery.voltage} V` 
            : null 
        },
        // Dung lượng
        { 
          label: 'Dung lượng (Ah)', 
          value: data.battery.capacityAh !== null && data.battery.capacityAh !== undefined && data.battery.capacityAh !== ''
            ? `${data.battery.capacityAh} Ah` 
            : null 
        }
      ].filter(detail => detail.value !== null); // Lọc bỏ các field không có dữ liệu
      
      return {
        type: 'Pin/Bộ sạc',
        brand: data.battery.brand,
        model: data.battery.model,
        year: data.battery.yearManufactured,
        details
      };
    }
    return {
      type: data.productType || 'Sản phẩm',
      brand: '',
      model: '',
      year: '',
      details: []
    };
  };

  const productInfo = getProductDetails();

  // Navigation functions
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Seller info from backend data only
  const sellerInfo = {
    name: data?.sellerName || "Người bán"
  };

  return {
    // Data
    data,
    loading,
    error,
    images,
    mainImage,
    currentImageIndex,
    productInfo,
    sellerInfo,
    
    // Functions
    formatPrice,
    formatDate,
    nextImage,
    prevImage,
    setCurrentImageIndex
  };
};
