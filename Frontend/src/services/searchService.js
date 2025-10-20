import { apiClient } from "./authService";

// Logic extract words giống BE
const REMOVE_WORDS = new Set(["mua", "bán", "cũ", "mới"]);

const extractWords = (request) => {
  return request.toLowerCase()
    .split(/\s+/)
    .filter(word => !REMOVE_WORDS.has(word));
};

// Logic brand detection giống BE
const isBrand = (request) => {
  const brands = new Set(["vinfast", "osakar", "yadea", "pega", "dibao"]);
  return brands.has(request.toLowerCase());
};

const searchService = {
  // Tìm kiếm autocomplete suggestions - Xử lý cả guest và member
  async getAutocompleteSuggestions(keyword) {
    if (!keyword.trim()) {
      return { success: true, data: [] };
    }

    try {
      // Thử sử dụng API autocomplete của backend (có thể yêu cầu authentication)
      try {
        const autocompleteResult = await apiClient.get(`/tag/autocomplete?displayName=${encodeURIComponent(keyword)}`);
        const data = autocompleteResult?.data?.data ?? autocompleteResult?.data?.content ?? autocompleteResult?.data;
        
        if (Array.isArray(data) && data.length > 0) {
          // Chuyển đổi tags thành suggestions theo format BE
          const suggestionItems = data.slice(0, 10).map(tag => ({
            id: tag.id,
            displayName: tag.displayName,
            type: 'tag',
            slug: tag.slugs // Thêm slug để có thể navigate
          }));
          
          return { success: true, data: suggestionItems };
        }
      } catch (authError) {
        // Nếu API tags yêu cầu authentication và user chưa login, fallback về products
        console.log("Autocomplete API requires auth, falling back to product search");
      }

      // Fallback: Tìm kiếm trong tất cả sản phẩm (luôn hoạt động cho guest và member)
      const response = await apiClient.get('/products');
      const allProducts = response?.data?.data ?? response?.data?.content ?? response?.data;
      
      if (!Array.isArray(allProducts)) {
        return { success: true, data: [] };
      }

      // Tạo suggestions từ tên sản phẩm và brand (logic thông minh)
      const suggestions = [];
      const keywordLower = keyword.toLowerCase();
      const keywords = extractWords(keyword);
      
      // Set để track các brand và model đã thêm
      const addedBrands = new Set();
      const addedModels = new Set();
      
      allProducts.forEach(product => {
        const title = product.title || '';
        const brand = product.vehicle?.brand || product.battery?.brand || '';
        const model = product.vehicle?.model || product.battery?.model || '';
        
        // Tìm kiếm trong title
        if (title.toLowerCase().includes(keywordLower)) {
          suggestions.push({
            id: product.id,
            displayName: title,
            type: 'product'
          });
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

      // Loại bỏ trùng lặp dựa trên displayName (case insensitive)
      const uniqueSuggestions = suggestions.filter((item, index, self) => 
        index === self.findIndex(t => t.displayName.toLowerCase() === item.displayName.toLowerCase())
      ).slice(0, 8);

      return { success: true, data: uniqueSuggestions };

    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      console.error("getAutocompleteSuggestions thất bại", { keyword, status, backendMessage });
      return { 
        success: false, 
        message: `Lỗi autocomplete (${status || "network"}): ${backendMessage || "Không rõ"}` 
      };
    }
  },

  // Tìm kiếm sản phẩm - Xử lý cả guest và member
  async searchProducts(keyword) {
    try {
      // Thử sử dụng API tìm kiếm thông minh của backend (có thể yêu cầu authentication)
      try {
        const response = await apiClient.get(`/tag/vehicle/search?request=${encodeURIComponent(keyword)}`);
        const data = response?.data?.data ?? response?.data?.content ?? response?.data;
        
        if (Array.isArray(data)) {
          return { success: true, data: data };
        }
      } catch (authError) {
        // Nếu API search yêu cầu authentication và user chưa login, fallback về products
        console.log("Backend search API requires auth, falling back to frontend filter");
      }

      // Fallback: Tìm kiếm thông minh ở FE sử dụng logic BE (luôn hoạt động cho guest và member)
      const response = await apiClient.get('/products');
      const allProducts = response?.data?.data ?? response?.data?.content ?? response?.data;
      
      if (!Array.isArray(allProducts)) {
        return { success: false, message: 'Dữ liệu sản phẩm không hợp lệ' };
      }

      // Sử dụng logic extract words giống hệt BE
      const keywords = extractWords(keyword);
      const fullTextKeyword = keywords.join(' ');
      
      // Phân loại tự động giống hệt BE
      const searchBattery = keywords.some(k => 
        k === 'pin' || k === 'battery' || k === 'sạc'
      );
      const searchVehicle = keywords.some(k => 
        k === 'xe' || k === 'vehicle' || k === 'scooter'
      );

      // Sử dụng Set để loại bỏ trùng lặp giống BE
      const resultSet = new Set();

      // Tìm kiếm theo Battery nếu có từ khóa liên quan (giống hệt BE)
      if (searchBattery) {
        // Mô phỏng full-text search trên Battery table (giống BE)
        let batteryProducts = allProducts.filter(product => {
          if (product.productType !== 'BATTERY') return false;
          
          const brand = (product.battery?.brand || '').toLowerCase();
          const model = (product.battery?.model || '').toLowerCase();
          
          // Full-text search: tìm trong brand và model (giống BE)
          return brand.includes(fullTextKeyword) || model.includes(fullTextKeyword);
        });

        // Fallback: Model search + Brand search (giống BE)
        if (batteryProducts.length === 0) {
          batteryProducts = allProducts.filter(product => {
            if (product.productType !== 'BATTERY') return false;
            
            const brand = (product.battery?.brand || '').toLowerCase();
            const model = (product.battery?.model || '').toLowerCase();
            
            // Tìm kiếm riêng biệt model và brand (giống BE)
            return model.includes(fullTextKeyword) || brand.includes(fullTextKeyword);
          });
        }

        // Thêm vào resultSet (giống BE)
        batteryProducts.forEach(product => resultSet.add(product));
      }

      // Tìm kiếm theo Vehicle nếu có từ khóa liên quan (giống hệt BE)
      if (searchVehicle) {
        // Mô phỏng full-text search trên Vehicle table (giống BE)
        let vehicleProducts = allProducts.filter(product => {
          if (product.productType !== 'VEHICLE') return false;
          
          const brand = (product.vehicle?.brand || '').toLowerCase();
          const model = (product.vehicle?.model || '').toLowerCase();
          
          // Full-text search: tìm trong brand và model (giống BE)
          return brand.includes(fullTextKeyword) || model.includes(fullTextKeyword);
        });

        // Fallback: Model search + Brand search (giống BE)
        if (vehicleProducts.length === 0) {
          vehicleProducts = allProducts.filter(product => {
            if (product.productType !== 'VEHICLE') return false;
            
            const brand = (product.vehicle?.brand || '').toLowerCase();
            const model = (product.vehicle?.model || '').toLowerCase();
            
            // Tìm kiếm riêng biệt model và brand (giống BE)
            return model.includes(fullTextKeyword) || brand.includes(fullTextKeyword);
          });
        }

        // Thêm vào resultSet (giống BE)
        vehicleProducts.forEach(product => resultSet.add(product));
      }

      // Fallback cuối cùng nếu không có kết quả (giống hệt BE)
      if (resultSet.size === 0) {
        // Mô phỏng full-text search trên Product table (giống BE)
        let fallbackProducts = allProducts.filter(product => {
          const title = (product.title || '').toLowerCase();
          const description = (product.description || '').toLowerCase();
          
          // Full-text search: tìm trong title và description (giống BE)
          return title.includes(fullTextKeyword) || description.includes(fullTextKeyword);
        });

        // Nếu vẫn không có, tìm kiếm riêng biệt title và description (giống BE)
        if (fallbackProducts.length === 0) {
          fallbackProducts = allProducts.filter(product => {
            const title = (product.title || '').toLowerCase();
            const description = (product.description || '').toLowerCase();
            
            // Tìm kiếm riêng biệt title và description (giống BE)
            return title.includes(fullTextKeyword) || description.includes(fullTextKeyword);
          });
        }

        // Thêm vào resultSet
        fallbackProducts.forEach(product => resultSet.add(product));
      }

      // Convert Set to Array và sắp xếp theo score (giống BE)
      const uniqueProducts = Array.from(resultSet);
      
      // Mô phỏng scoring system của BE
      const scoredProducts = uniqueProducts.map(product => {
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
      
      // Sắp xếp theo score giảm dần (giống BE)
      scoredProducts.sort((a, b) => b.score - a.score);

      return { success: true, data: scoredProducts };

    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      console.error("searchProducts thất bại", { keyword, status, backendMessage });
      return { 
        success: false, 
        message: `Lỗi tìm kiếm (${status || "network"}): ${backendMessage || "Không rõ"}` 
      };
    }
  },

  // Xử lý tìm kiếm tổng hợp - Sử dụng triệt để logic BE
  async handleSearch(searchTerm) {
    if (!searchTerm.trim()) {
      return { success: false, message: 'Vui lòng nhập từ khóa tìm kiếm' };
    }

    // Sử dụng logic tìm kiếm thông minh của BE cho TẤT CẢ từ khóa
    // BE sẽ tự động phân loại "pin", "xe", "vehicle", "scooter"
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

  // Lấy suggestions cho search bar - Tối ưu hóa
  async fetchSuggestions(keyword) {
    if (!keyword.trim()) {
      return { success: true, data: [] };
    }

    try {
      // Sử dụng API autocomplete của BE trước
      const autocompleteResult = await this.getAutocompleteSuggestions(keyword);
      
      if (autocompleteResult.success && autocompleteResult.data.length > 0) {
        // Chuyển đổi format cho SearchBar
        const suggestionItems = autocompleteResult.data.map(item => ({
          id: item.id,
          title: item.displayName,
          type: item.type,
          slug: item.slug // Thêm slug nếu có
        }));
        
        return { success: true, data: suggestionItems };
      }

      return { success: true, data: [] };
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return { success: true, data: [] };
    }
  },

  // Lấy sản phẩm theo tag slug - Xử lý cả guest và member
  async getProductsByTag(tagSlug) {
    try {
      // Thử sử dụng API tag của backend (có thể yêu cầu authentication)
      try {
        const response = await apiClient.get(`/tag/${encodeURIComponent(tagSlug)}`);
        const data = response?.data?.data ?? response?.data?.content ?? response?.data;
        
        return { success: true, data: Array.isArray(data) ? data : [] };
      } catch (authError) {
        // Nếu API tag yêu cầu authentication và user chưa login, fallback về products
        console.log("Tag API requires auth, falling back to product search");
      }

      // Fallback: Tìm kiếm sản phẩm theo tag slug trong tất cả sản phẩm
      const response = await apiClient.get('/products');
      const allProducts = response?.data?.data ?? response?.data?.content ?? response?.data;
      
      if (!Array.isArray(allProducts)) {
        return { success: false, message: 'Dữ liệu sản phẩm không hợp lệ' };
      }

      // Tìm kiếm sản phẩm có chứa tag slug trong title, description, brand, model
      const filteredProducts = allProducts.filter(product => {
        const title = (product.title || '').toLowerCase();
        const description = (product.description || '').toLowerCase();
        const brand = (product.vehicle?.brand || product.battery?.brand || '').toLowerCase();
        const model = (product.vehicle?.model || product.battery?.model || '').toLowerCase();
        const tagSlugLower = tagSlug.toLowerCase();
        
        return title.includes(tagSlugLower) ||
               description.includes(tagSlugLower) ||
               brand.includes(tagSlugLower) ||
               model.includes(tagSlugLower);
      });

      return { success: true, data: filteredProducts };

    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      console.error("getProductsByTag thất bại", { tagSlug, status, backendMessage });
      return { 
        success: false, 
        message: `Lỗi tải sản phẩm theo tag (${status || "network"}): ${backendMessage || "Không rõ"}` 
      };
    }
  }
};

export default searchService;