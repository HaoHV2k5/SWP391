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

  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 ngày trước';
    if (diffDays < 30) return `${diffDays} ngày trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
  };

  // Lấy thông tin chi tiết theo loại sản phẩm
  const getProductDetails = () => {
    if (!data) return { type: '', brand: '', model: '', year: '', details: [] };
    
    if (data.productType === 'VEHICLE' && data.vehicle) {
      return {
        type: 'Xe máy điện',
        brand: data.vehicle.brand,
        model: data.vehicle.model,
        year: data.vehicle.yearManufactured,
        details: [
          { label: 'Hãng xe', value: data.vehicle.brand },
          { label: 'Model', value: data.vehicle.model },
          { label: 'Năm sản xuất', value: data.vehicle.yearManufactured }
        ]
      };
    } else if (data.productType === 'BATTERY' && data.battery) {
      return {
        type: 'Pin/Bộ sạc',
        brand: data.battery.brand,
        model: data.battery.model,
        year: data.battery.yearManufactured,
        details: [
          { label: 'Hãng pin', value: data.battery.brand },
          { label: 'Model', value: data.battery.model },
          { label: 'Năm sản xuất', value: data.battery.yearManufactured },
          { label: 'Mức pin', value: data.battery.batteryLevel ? `${data.battery.batteryLevel}%` : 'Không xác định' }
        ]
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
