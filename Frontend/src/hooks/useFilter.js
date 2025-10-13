import { useState, useMemo } from 'react';
import { filterProducts, getUniqueBrands } from '../utils/filterUtils';

// Hook chung cho filter, có thể tùy chỉnh các filter types
export const useFilter = (initialProducts = [], filterTypes = ['priceRange', 'brand', 'vehicleType', 'year']) => {
  // Tạo initial state dựa trên filterTypes
  const initialFilters = filterTypes.reduce((acc, type) => {
    acc[type] = '';
    return acc;
  }, {});

  const [filters, setFilters] = useState(initialFilters);

  // Lọc sản phẩm dựa trên bộ lọc hiện tại
  const filteredProducts = useMemo(() => {
    try {
      console.log('useFilter - Filtering with filters:', filters);
      const result = filterProducts(initialProducts, filters);
      console.log('useFilter - Kết quả lọc:', result.length, 'sản phẩm');
      return result;
    } catch (error) {
      console.error('useFilter - Error filtering products:', error);
      return initialProducts;
    }
  }, [initialProducts, filters]);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Xử lý nhiều thay đổi bộ lọc cùng lúc
  const handleFiltersChange = (newFilters) => {
    console.log('useFilter - Nhận bộ lọc mới:', newFilters);

    // Reset tất cả filters về empty trước
    const resetFilters = { ...initialFilters };

    // Set filters mới từ newFilters (chỉ những filter có giá trị khác null)
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] !== null) {
        resetFilters[key] = newFilters[key];
      }
    });

    console.log('useFilter - Bộ lọc cuối cùng:', resetFilters);
    setFilters(resetFilters);
  };

  // Đặt lại tất cả bộ lọc
  const resetFilters = () => {
    setFilters(initialFilters);
  };

  // Lấy danh sách thương hiệu duy nhất từ sản phẩm
  const getUniqueBrandsFromProducts = () => {
    return getUniqueBrands(initialProducts);
  };

  return {
    filters,
    filteredProducts,
    displayProducts: filteredProducts,
    handleFilterChange,
    handleFiltersChange,
    resetFilters,
    getUniqueBrands: getUniqueBrandsFromProducts
  };
};
