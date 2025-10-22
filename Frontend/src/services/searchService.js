import { apiClient } from "./authService";
import displayService from "./displayService";

// ==================== UTILITY FUNCTIONS ====================
// Logic extract words giống BE - loại bỏ từ không cần thiết
const REMOVE_WORDS = new Set(["mua", "bán", "cũ", "mới"]);

const extractWords = (request) => {
  return request.toLowerCase()
    .split(/\s+/)
    .filter(word => !REMOVE_WORDS.has(word));
};

// Logic brand detection giống BE - kiểm tra brand đã biết
const isBrand = (request) => {
  const brands = new Set(["vinfast", "osakar", "yadea", "pega", "dibao"]);
  return brands.has(request.toLowerCase());
};

// Helper function để lấy dữ liệu products từ displayService
const fetchAllProducts = async () => {
  const result = await displayService.getPublicList();
  return result.success ? result.data : [];
};

const searchService = {
  // ==================== AUTOCOMPLETE SUGGESTIONS ====================
  // Tạo danh sách gợi ý cho search bar (tags + products + brands + models)
  async getAutocompleteSuggestions(keyword) {
    if (!keyword.trim()) {
      return { success: true, data: [] };
    }

    try {
      const keywordLower = keyword.toLowerCase();
      const allProducts = await fetchAllProducts();
      
      if (!Array.isArray(allProducts)) {
        return { success: true, data: [] };
      }

      // Tìm kiếm suggestions từ products
      const suggestions = this.findSuggestionsFromProducts(allProducts, keywordLower);
      
      // Lấy tag suggestions từ API (nếu đã đăng nhập)
      const tagSuggestions = await this.getTagSuggestions(keyword);

      // Kết hợp và loại bỏ trùng lặp
      const allSuggestions = [...tagSuggestions, ...suggestions];
      const uniqueSuggestions = this.removeDuplicateSuggestions(allSuggestions).slice(0, 10);

      return { success: true, data: uniqueSuggestions };

    } catch (error) {
      return this.handleError("getAutocompleteSuggestions", error, keyword);
    }
  },

  // Helper: Tìm suggestions từ products (products, brands, models)
  findSuggestionsFromProducts(allProducts, keywordLower) {
    const suggestions = [];
    const addedBrands = new Set();
    const addedModels = new Set();
    const addedProducts = new Set();
    
    allProducts.forEach(product => {
      const title = product.title || '';
      const brand = product.vehicle?.brand || product.battery?.brand || '';
      const model = product.vehicle?.model || product.battery?.model || '';
      
      // Tìm kiếm trong title (sản phẩm)
      if (title.toLowerCase().includes(keywordLower) && !addedProducts.has(title.toLowerCase())) {
        suggestions.push({
          id: product.id,
          displayName: title,
          type: 'product'
        });
        addedProducts.add(title.toLowerCase());
      }
      
      // Tìm kiếm trong brand (chỉ thêm 1 lần cho mỗi brand)
      if (brand && brand.toLowerCase().includes(keywordLower) && !addedBrands.has(brand.toLowerCase())) {
        suggestions.push({
          id: `brand-${brand}`,
          displayName: brand,
          type: 'brand',
          isKnownBrand: isBrand(brand)
        });
        addedBrands.add(brand.toLowerCase());
      }
      
      // Tìm kiếm trong model (chỉ thêm 1 lần cho mỗi model)
      if (model && model.toLowerCase().includes(keywordLower) && !addedModels.has(model.toLowerCase())) {
        suggestions.push({
          id: `model-${model}`,
          displayName: model,
          type: 'model'
        });
        addedModels.add(model.toLowerCase());
      }
    });

    return suggestions;
  },

  // Helper: Lấy tag suggestions từ API (chỉ khi đã đăng nhập)
  async getTagSuggestions(keyword) {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, skipping tag autocomplete API");
      return [];
    }

    try {
      console.log("Calling tag autocomplete API with keyword:", keyword);
      const autocompleteResult = await apiClient.get(`/tag/autocomplete?displayName=${encodeURIComponent(keyword)}`);
      const data = autocompleteResult?.data?.data ?? autocompleteResult?.data?.content ?? autocompleteResult?.data;
      
      if (Array.isArray(data) && data.length > 0) {
        const tagSuggestions = data.slice(0, 5).map(tag => ({
          id: tag.id,
          displayName: tag.displayName,
          type: 'tag',
          slug: tag.slugs
        }));
        console.log("Tag suggestions created from API:", tagSuggestions);
        return tagSuggestions;
      } else {
        console.log("No tags found in database for keyword:", keyword);
        return [];
      }
    } catch (authError) {
      console.log("Tag autocomplete API error:", authError);
      return [];
    }
  },

  // Helper: Loại bỏ suggestions trùng lặp
  removeDuplicateSuggestions(suggestions) {
    return suggestions.filter((item, index, self) => 
      index === self.findIndex(t => t.displayName.toLowerCase() === item.displayName.toLowerCase())
    );
  },

  // ==================== PRODUCT SEARCH ====================
  // Tìm kiếm sản phẩm với logic giống BE (Battery -> Vehicle -> General)
  async searchProducts(keyword) {
    try {
      // Thử dùng API search của BE trước (có thể cần auth)
      const backendResult = await this.tryBackendSearch(keyword);
      if (backendResult) return backendResult;

      // Fallback: Tìm kiếm ở FE với logic BE
      return await this.frontendSearch(keyword);

    } catch (error) {
      return this.handleError("searchProducts", error, keyword);
    }
  },

  // Helper: Thử dùng API search của BE
  async tryBackendSearch(keyword) {
    try {
      const response = await apiClient.get(`/tag/vehicle/search?request=${encodeURIComponent(keyword)}`);
      const data = response?.data?.data ?? response?.data?.content ?? response?.data;
      
      if (Array.isArray(data)) {
        return { success: true, data: data };
      }
    } catch (authError) {
      console.log("Backend search API requires auth, falling back to frontend filter");
    }
    return null;
  },

  // Helper: Tìm kiếm ở FE với logic BE
  async frontendSearch(keyword) {
    const allProducts = await fetchAllProducts();
    if (!Array.isArray(allProducts)) {
      return { success: false, message: 'Dữ liệu sản phẩm không hợp lệ' };
    }

    const keywords = extractWords(keyword);
    const fullTextKeyword = keywords.join(' ');
    
    // Phân loại tự động giống BE
    const searchBattery = keywords.some(k => k === 'pin' || k === 'battery' || k === 'sạc');
    const searchVehicle = keywords.some(k => k === 'xe' || k === 'vehicle' || k === 'scooter');

    const resultMap = new Map();

    // Tìm kiếm Battery products (ưu tiên cao nhất)
    if (searchBattery) {
      const batteryProducts = this.searchBatteryProducts(allProducts, fullTextKeyword);
      batteryProducts.forEach(product => resultMap.set(product.id, product));
    }

    // Tìm kiếm Vehicle products (ưu tiên thứ hai)
    if (searchVehicle) {
      const vehicleProducts = this.searchVehicleProducts(allProducts, fullTextKeyword);
      vehicleProducts.forEach(product => resultMap.set(product.id, product));
    }

    // Fallback: Tìm kiếm general products
    if (resultMap.size === 0) {
      const fallbackProducts = this.searchGeneralProducts(allProducts, fullTextKeyword);
      fallbackProducts.forEach(product => resultMap.set(product.id, product));
    }

    // Tính score và sắp xếp
    const scoredProducts = this.calculateProductScores(Array.from(resultMap.values()), fullTextKeyword);
    scoredProducts.sort((a, b) => b.score - a.score);

    return { success: true, data: scoredProducts };
  },

  // Helper: Tìm kiếm Battery products
  searchBatteryProducts(allProducts, fullTextKeyword) {
    let products = allProducts.filter(product => {
      if (product.productType !== 'BATTERY') return false;
      const brand = (product.battery?.brand || '').toLowerCase();
      const model = (product.battery?.model || '').toLowerCase();
      return brand.includes(fullTextKeyword) || model.includes(fullTextKeyword);
    });

    // Fallback nếu không có kết quả
    if (products.length === 0) {
      products = allProducts.filter(product => {
        if (product.productType !== 'BATTERY') return false;
        const brand = (product.battery?.brand || '').toLowerCase();
        const model = (product.battery?.model || '').toLowerCase();
        return model.includes(fullTextKeyword) || brand.includes(fullTextKeyword);
      });
    }

    return products;
  },

  // Helper: Tìm kiếm Vehicle products
  searchVehicleProducts(allProducts, fullTextKeyword) {
    let products = allProducts.filter(product => {
      if (product.productType !== 'VEHICLE') return false;
      const brand = (product.vehicle?.brand || '').toLowerCase();
      const model = (product.vehicle?.model || '').toLowerCase();
      return brand.includes(fullTextKeyword) || model.includes(fullTextKeyword);
    });

    // Fallback nếu không có kết quả
    if (products.length === 0) {
      products = allProducts.filter(product => {
        if (product.productType !== 'VEHICLE') return false;
        const brand = (product.vehicle?.brand || '').toLowerCase();
        const model = (product.vehicle?.model || '').toLowerCase();
        return model.includes(fullTextKeyword) || brand.includes(fullTextKeyword);
      });
    }

    return products;
  },

  // Helper: Tìm kiếm General products
  searchGeneralProducts(allProducts, fullTextKeyword) {
    let products = allProducts.filter(product => {
      const title = (product.title || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      return title.includes(fullTextKeyword) || description.includes(fullTextKeyword);
    });

    // Fallback nếu không có kết quả
    if (products.length === 0) {
      products = allProducts.filter(product => {
        const title = (product.title || '').toLowerCase();
        const description = (product.description || '').toLowerCase();
        return title.includes(fullTextKeyword) || description.includes(fullTextKeyword);
      });
    }

    return products;
  },

  // Helper: Tính score cho products (giống BE scoring system)
  calculateProductScores(products, fullTextKeyword) {
    return products.map(product => {
      let score = 0;
      const title = (product.title || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      const brand = (product.vehicle?.brand || product.battery?.brand || '').toLowerCase();
      const model = (product.vehicle?.model || product.battery?.model || '').toLowerCase();
      
      // Tính score dựa trên độ khớp
      if (title.includes(fullTextKeyword)) score += 10;
      if (description.includes(fullTextKeyword)) score += 8;
      if (brand.includes(fullTextKeyword)) score += 6;
      if (model.includes(fullTextKeyword)) score += 4;
      
      // Bonus cho exact match
      if (title === fullTextKeyword) score += 20;
      if (brand === fullTextKeyword) score += 15;
      if (model === fullTextKeyword) score += 10;
      
      return { ...product, score };
    });
  },

  // ==================== MAIN SEARCH HANDLERS ====================
  // Xử lý tìm kiếm tổng hợp - Entry point cho search
  async handleSearch(searchTerm) {
    if (!searchTerm.trim()) {
      return { success: false, message: 'Vui lòng nhập từ khóa tìm kiếm' };
    }

    const result = await this.searchProducts(searchTerm);
    
    if (result.success && result.data.length > 0) {
      return {
        success: true,
        redirect: `/?search=${encodeURIComponent(searchTerm)}`,
        data: result.data
      };
    } else {
      return {
        success: false,
        message: `Không tìm thấy sản phẩm nào cho "${searchTerm}". Hãy thử từ khóa khác!`
      };
    }
  },

  // Lấy suggestions cho search bar - Format cho SearchBar component
  async fetchSuggestions(keyword) {
    if (!keyword.trim()) {
      return { success: true, data: [] };
    }

    try {
      const autocompleteResult = await this.getAutocompleteSuggestions(keyword);
      
      if (autocompleteResult.success && autocompleteResult.data.length > 0) {
        // Chuyển đổi format cho SearchBar
        const suggestionItems = autocompleteResult.data.map(item => ({
          id: item.id,
          title: item.displayName,
          type: item.type,
          slug: item.slug,
          isKnownBrand: item.isKnownBrand
        }));
        
        return { success: true, data: suggestionItems };
      }

      return { success: true, data: [] };
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return { success: true, data: [] };
    }
  },

  // ==================== TAG SEARCH ====================
  // Lấy sản phẩm theo tag slug - Dùng cho TagPage
  async getProductsByTag(tagSlug) {
    try {
      // Thử dùng API tag của BE trước
      const backendResult = await this.tryTagAPI(tagSlug);
      if (backendResult) return backendResult;

      // Fallback: Tìm kiếm theo tag slug trong products
      return await this.searchByTagSlug(tagSlug);

    } catch (error) {
      return this.handleError("getProductsByTag", error, tagSlug);
    }
  },

  // Helper: Thử dùng API tag của BE
  async tryTagAPI(tagSlug) {
    try {
      const response = await apiClient.get(`/tag/${encodeURIComponent(tagSlug)}`);
      const data = response?.data?.data ?? response?.data?.content ?? response?.data;
      
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (authError) {
      console.log("Tag API requires auth, falling back to product search");
    }
    return null;
  },

  // Helper: Tìm kiếm theo tag slug trong products
  async searchByTagSlug(tagSlug) {
    const allProducts = await fetchAllProducts();
    if (!Array.isArray(allProducts)) {
      return { success: false, message: 'Dữ liệu sản phẩm không hợp lệ' };
    }

    const tagKeywords = tagSlug.toLowerCase().split('-').filter(keyword => keyword.length > 0);
    console.log("Tag slug:", tagSlug, "Keywords:", tagKeywords);

    const filteredProducts = allProducts.filter(product => {
      const title = (product.title || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      const brand = (product.vehicle?.brand || product.battery?.brand || '').toLowerCase();
      const model = (product.vehicle?.model || product.battery?.model || '').toLowerCase();
      
      // Tìm kiếm với tag slug đầy đủ trước
      if (title.includes(tagSlug.toLowerCase()) || 
          description.includes(tagSlug.toLowerCase()) ||
          brand.includes(tagSlug.toLowerCase()) ||
          model.includes(tagSlug.toLowerCase())) {
        return true;
      }
      
      // Tìm kiếm với từng từ khóa riêng lẻ
      return tagKeywords.some(keyword => 
        title.includes(keyword) ||
        description.includes(keyword) ||
        brand.includes(keyword) ||
        model.includes(keyword)
      );
    });

    console.log("Found products for tag:", filteredProducts.length);
    return { success: true, data: filteredProducts };
  },

  // ==================== ERROR HANDLING ====================
  // Helper: Xử lý lỗi chung
  handleError(functionName, error, context) {
    const status = error?.response?.status;
    const backendMessage = error?.response?.data?.message || error?.message;
    console.error(`${functionName} thất bại`, { context, status, backendMessage });
    return { 
      success: false, 
      message: `Lỗi ${functionName} (${status || "network"}): ${backendMessage || "Không rõ"}` 
    };
  }
};

export default searchService;