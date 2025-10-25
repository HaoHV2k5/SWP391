// Utility functions cho filter
import filterService from '../services/home/filterService';

// Hàm lọc sản phẩm theo các filter
export const filterProducts = (products, filters) => {
  return products.filter(product => {
    // Bộ lọc phạm vi giá (phù hợp với xe điện và pin)
    if (filters.priceRange) {
      // Lấy giá gốc từ product, không phải giá đã format
      const price = parseFloat(product.price?.replace(/[^\d]/g, '') || '0');
      switch (filters.priceRange) {
        case 'under2m':
          if (price >= 2000000) return false;
          break;
        case '2m-5m':
          if (price < 2000000 || price >= 5000000) return false;
          break;
        case '5m-10m':
          if (price < 5000000 || price >= 10000000) return false;
          break;
        case '10m-20m':
          if (price < 10000000 || price >= 20000000) return false;
          break;
        case '20m-30m':
          if (price < 20000000 || price >= 30000000) return false;
          break;
        case '30m-40m':
          if (price < 30000000 || price >= 40000000) return false;
          break;
        case '40m-50m':
          if (price < 40000000 || price >= 50000000) return false;
          break;
        default:
          break;
      }
    }

    // Brand filter
    if (filters.brand) {
      const productBrand = product.brand || product.vehicle?.brand || product.battery?.brand;
      if (!productBrand || productBrand.trim().toLowerCase() !== filters.brand.trim().toLowerCase()) {
        return false;
      }
    }

    // Vehicle type filter (chỉ dùng cho FilterBar thông thường)
    if (filters.vehicleType) {
      switch (filters.vehicleType) {
        case 'electric_scooter':
          if (product.productType !== "VEHICLE") return false;
          break;
        case 'battery':
          if (product.productType !== "BATTERY") return false;
          break;
        default:
          break;
      }
    }

    // Year filter
    if (filters.year) {
      const productYear = product.year || product.vehicle?.yearManufactured || product.battery?.yearManufactured;
      if (!productYear || productYear.toString() !== filters.year) {
        return false;
      }
    }

    return true;
  });
};

// Hàm lấy danh sách brands duy nhất
export const getUniqueBrands = (products) => {
  const brands = products.map(product => {
    const brand = product.vehicle?.brand || product.battery?.brand;
    return brand ? brand.trim().toLowerCase() : null;
  }).filter(brand => brand);
  
  return [...new Set(brands)].sort();
};

// Hàm lấy danh sách years duy nhất (chỉ từ 2020 trở lên)
export const getUniqueYears = (products) => {
  const years = products.map(product => 
    product.vehicle?.yearManufactured || product.battery?.yearManufactured
  ).filter(year => year && year >= 2020); // Chỉ lấy năm từ 2020 trở lên
  
  return [...new Set(years)].sort((a, b) => b - a);
};

// Hàm tạo brand options từ danh sách brands
export const getBrandOptions = (brands = []) => {
  return brands.map(brand => ({
    label: brand.charAt(0).toUpperCase() + brand.slice(1), // Capitalize first letter
    value: brand // Value vẫn là chữ thường để so sánh nhất quán
  }));
};

// Hàm tạo year options từ danh sách years (chỉ từ 2020 trở lên)
export const getYearOptions = (years = []) => {
  return years.map(year => ({
    label: year.toString(),
    value: year.toString()
  }));
};

// Hàm load filter options từ Backend
export const loadFilterOptions = async () => {
  try {
    console.log('filterUtils - Calling filterService.getFilterOptions()');
    const result = await filterService.getFilterOptions();
    console.log('filterUtils - Result from filterService:', result);
    
    if (result.success) {
      console.log('filterUtils - Raw years from backend:', result.data.years);
      
      const brands = getBrandOptions(result.data.brands);
      const years = getYearOptions(result.data.years);
      
      console.log('filterUtils - Processed brands:', brands);
      console.log('filterUtils - Processed years:', years);
      
      return {
        brands,
        years
      };
    } else {
      console.log('filterUtils - ProductService returned error:', result.message);
      return {
        brands: [],
        years: []
      };
    }
  } catch (error) {
    console.error('filterUtils - Error loading filter options:', error);
    return {
      brands: [],
      years: []
    };
  }
};

// Price options phù hợp với xe điện và pin (dưới 2 triệu - 50 triệu)
export const priceOptions = [
    { label: 'Dưới 2 triệu', value: 'under2m' },
    { label: '2-5 triệu', value: '2m-5m' },
    { label: '5-10 triệu', value: '5m-10m' },
    { label: '10-20 triệu', value: '10m-20m' },
    { label: '20-30 triệu', value: '20m-30m' },
    { label: '30-40 triệu', value: '30m-40m' },
    { label: '40-50 triệu', value: '40m-50m' }
];