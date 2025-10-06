import { useState, useMemo } from 'react';

const useProductFilter = (initialProducts = []) => {
  const [filters, setFilters] = useState({
    priceRange: '',
    brand: '',
    vehicleType: '',
    year: '' // Thêm bộ lọc năm sản xuất
  });

  // Lọc sản phẩm dựa trên bộ lọc hiện tại
  const filteredProducts = useMemo(() => {
    try {
      console.log('useProductFilter - Filtering with filters:', filters);
      const result = initialProducts.filter(product => {
        // Bộ lọc phạm vi giá
        if (filters.priceRange) {
          const price = parseInt(product.price.replace(/[^\d]/g, ''));
          console.log(`Product: ${product.name}, Price: ${price}, Filter: ${filters.priceRange}`);

          switch (filters.priceRange) {
            case 'under10m':
              if (price >= 10000000) return false;
              break;
            case '10m-20m':
              if (price < 10000000 || price >= 20000000) return false;
              break;
            case '20m-30m':
              if (price < 20000000 || price >= 30000000) return false;
              break;
            case '30m-50m':
              if (price < 30000000 || price >= 50000000) return false;
              break;
            case '50m-100m':
              if (price < 50000000 || price >= 100000000) return false;
              break;
            case '100m-500m':
              if (price < 100000000 || price >= 500000000) return false;
              break;
            case '500m-1b':
              if (price < 500000000 || price >= 1000000000) return false;
              break;
            case 'over1b':
              if (price < 1000000000) return false;
              break;
            default:
              break;
          }
        }

        // Brand filter (tìm kiếm theo thương hiệu)
        if (filters.brand) {
          if (product.brand.toLowerCase() !== filters.brand.toLowerCase()) {
            return false;
          }
        }


        // Vehicle type filter
        if (filters.vehicleType) {
          switch (filters.vehicleType) {
            case 'xe-dien':
              if (product.type !== "electric-scooter") return false;
              break;
            case 'xe-hoi-dien':
              if (product.type !== "electric-car") return false;
              break;
            case 'pin':
              if (product.type !== "battery-charger") return false;
              break;
            default:
              break;
          }
        }

        // Bộ lọc năm sản xuất
        if (filters.year) {
          if (product.vehicleInfo?.year !== filters.year) {
            return false;
          }
        }

        return true;
      });

      console.log('useProductFilter - Kết quả lọc:', result.length, 'sản phẩm');
      return result;
    } catch (error) {
      console.error('useProductFilter - Error filtering products:', error);
      return initialProducts; // Trả về tất cả sản phẩm trên lỗi
    }
  }, [initialProducts, filters]);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Xử lý nhiều thay đổi bộ lọc cùng lúc (tương thích với FilterBar)
  const handleFiltersChange = (newFilters) => {
    console.log('useProductFilter - Nhận bộ lọc mới:', newFilters);

    // Reset tất cả filters về empty trước
    const resetFilters = {
      priceRange: '',
      brand: '',
      vehicleType: '',
      year: ''
    };

    // Set filters mới từ newFilters (chỉ những filter có giá trị khác null)
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] !== null) {
        resetFilters[key] = newFilters[key];
      }
    });

    console.log('useProductFilter - Bộ lọc cuối cùng:', resetFilters);
    setFilters(resetFilters);
  };

  // Đặt lại tất cả bộ lọc
  const resetFilters = () => {
    setFilters({
      priceRange: '',
      brand: '',
      vehicleType: '',
      year: ''
    });
  };

  // Lấy danh sách thương hiệu duy nhất từ sản phẩm
  const getUniqueBrands = () => {
    return [...new Set(initialProducts.map(product => product.brand))];
  };


  return {
    filters,
    filteredProducts,
    displayProducts: filteredProducts,
    handleFilterChange,
    handleFiltersChange,
    resetFilters,
    getUniqueBrands
  };
};

export default useProductFilter;