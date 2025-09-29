import { useState, useMemo } from 'react';

const useProductFilter = (initialProducts = []) => {
  const [filters, setFilters] = useState({
    priceRange: '',
    brand: '',
    condition: '',
    batteryType: '',
    batteryCapacity: '',
    vehicleType: '',
    usage: '',
    specialFeatures: []
  });

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    try {
      console.log('useProductFilter - Filtering with filters:', filters);
      const result = initialProducts.filter(product => {
        // Price range filter
        if (filters.priceRange) {
          const price = parseInt(product.salePrice.replace(/[^\d]/g, ''));
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

        // Brand filter (tìm kiếm theo tên sản phẩm)
        if (filters.brand) {
          if (!product.name.toLowerCase().includes(filters.brand.toLowerCase())) {
            return false;
          }
        }

        // Condition filter
        if (filters.condition) {
          if (filters.condition === 'new' && !product.isNew) return false;
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

        // Battery type filter (tìm kiếm theo tên sản phẩm)
        if (filters.batteryType) {
          if (!product.name.toLowerCase().includes(filters.batteryType.toLowerCase())) {
            return false;
          }
        }

        // Battery capacity filter (tìm kiếm theo tên sản phẩm)
        if (filters.batteryCapacity) {
          if (!product.name.toLowerCase().includes(filters.batteryCapacity.toLowerCase())) {
            return false;
          }
        }

        // Usage filter
        if (filters.usage) {
          // This would need to be implemented based on product data structure
          // For now, we'll skip this filter
        }

        // Special features filter
        if (filters.specialFeatures.length > 0) {
          // This would need to be implemented based on product data structure
          // For now, we'll skip this filter
        }

        return true;
      });

      console.log('useProductFilter - Filtered result:', result.length, 'products');
      return result;
    } catch (error) {
      console.error('useProductFilter - Error filtering products:', error);
      return initialProducts; // Return all products on error
    }
  }, [initialProducts, filters]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Handle multiple filter changes at once (for FilterBar compatibility)
  const handleFiltersChange = (newFilters) => {
    console.log('useProductFilter - Received newFilters:', newFilters);

    // Reset tất cả filters về empty trước
    const resetFilters = {
      priceRange: '',
      brand: '',
      condition: '',
      batteryType: '',
      batteryCapacity: '',
      vehicleType: '',
      usage: '',
      specialFeatures: []
    };

    // Set filters mới từ newFilters (chỉ những filter có giá trị khác null)
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] !== null) {
        resetFilters[key] = newFilters[key];
      }
    });

    console.log('useProductFilter - Final filters:', resetFilters);
    setFilters(resetFilters);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      priceRange: '',
      brand: '',
      condition: '',
      batteryType: '',
      batteryCapacity: '',
      vehicleType: '',
      usage: '',
      specialFeatures: []
    });
  };

  // Get unique brands from products
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