import apiClient from "../apiClient";
import displayService from "./displayService";

// ==================== CONSTANTS - GIỐNG BE ====================
const REMOVE_WORDS = new Set(["mua", "bán", "cũ", "mới"]);
const KNOWN_BRANDS = new Set(["vinfast", "osakar", "yadea", "pega", "dibao"]);

// ==================== UTILITY FUNCTIONS ====================
const extractWords = (request) => {
  return request.toLowerCase()
    .split(/\s+/)
    .filter(word => !REMOVE_WORDS.has(word));
};

const isBrand = (brand) => KNOWN_BRANDS.has(brand.toLowerCase());

const fetchAllProducts = async () => {
  const result = await displayService.getPublicList();
  return result.success ? result.data : [];
};

const extractApiData = (response) => {
  return response?.data?.data ?? response?.data?.content ?? response?.data;
};

const searchService = {
  // ==================== PRODUCT SEARCH - CALL BE API ====================
  
  /**
   * Search sản phẩm - GỌI THẲNG BE API
   * BE có logic: extractWords → searchBattery/Vehicle → fulltext → fallback
   * Endpoint: GET /tag/product/search?request={keyword}
   */
  async searchProducts(keyword) {
    try {
      console.log("Calling backend search API:", keyword);
      const response = await apiClient.get(`/tag/product/search?request=${encodeURIComponent(keyword)}`);
      const data = extractApiData(response);
      
      if (Array.isArray(data)) {
        console.log("Backend search found:", data.length, "products");
        return { success: true, data: data };
      }
      
      return { success: true, data: [] };
      
    } catch (error) {
      console.error("Backend search API failed:", error.message);
      return this.handleError("searchProducts", error, keyword);
    }
  },

  // ==================== TAG SEARCH - CALL BE API ====================
  
  /**
   * Search theo tag slug - GỌI THẲNG BE API
   * BE logic: findBySlugs() → query products theo Tag.brand/model/type
   * Endpoint: GET /tag/{slugs}
   */
  async getProductsByTag(tagSlug) {
    try {
      console.log("Calling backend tag API:", tagSlug);
      const response = await apiClient.get(`/tag/${encodeURIComponent(tagSlug)}`);
      const data = extractApiData(response);
      
      if (Array.isArray(data)) {
        console.log("Backend tag API found:", data.length, "products");
        return { success: true, data: data };
      }
      
      return { success: true, data: [] };
      
    } catch (error) {
      console.error("Backend tag API failed:", error.message);
      return this.handleError("getProductsByTag", error, tagSlug);
    }
  },

  // ==================== AUTOCOMPLETE - CALL BE API ====================
  
  /**
   * Autocomplete suggestions - GỌI BE API + bổ sung từ products
   * BE logic: findTop10ByDisplayNameContainingIgnoreCase()
   * Endpoint: GET /tag/autocomplete?displayName={keyword}
   */
  async getAutocompleteSuggestions(keyword) {
    if (!keyword.trim()) return { success: true, data: [] };

    try {
      const keywordLower = keyword.toLowerCase();
      
      // 1. Lấy tag suggestions từ BE (ưu tiên)
      const tagSuggestions = await this.getTagSuggestions(keyword);
      
      // 2. Bổ sung suggestions từ products (brand, model, title)
      const allProducts = await fetchAllProducts();
      const productSuggestions = Array.isArray(allProducts) 
        ? this.findSuggestionsFromProducts(allProducts, keywordLower)
        : [];

      // 3. Kết hợp và loại bỏ trùng
      const allSuggestions = [...tagSuggestions, ...productSuggestions];
      const uniqueSuggestions = this.removeDuplicateSuggestions(allSuggestions).slice(0, 10);

      return { success: true, data: uniqueSuggestions };
    } catch (error) {
      console.error("Autocomplete error:", error);
      return { success: true, data: [] };
    }
  },

  /**
   * Lấy tag suggestions từ BE
   * Endpoint: GET /tag/autocomplete?displayName={keyword}
   */
  async getTagSuggestions(keyword) {
    try {
      console.log("Calling tag autocomplete API:", keyword);
      const response = await apiClient.get(`/tag/autocomplete?displayName=${encodeURIComponent(keyword)}`);
      const data = extractApiData(response);
      
      if (Array.isArray(data) && data.length > 0) {
        const tagSuggestions = data.slice(0, 5).map(tag => ({
          id: tag.id,
          displayName: tag.displayName,
          type: 'tag',
          slug: tag.slugs
        }));
        console.log("Tag autocomplete found:", tagSuggestions.length, "tags");
        return tagSuggestions;
      }
      return [];
    } catch (error) {
      console.log("Tag autocomplete API error:", error.message);
      return [];
    }
  },

  /**
   * Tìm suggestions từ products (local fallback)
   */
  findSuggestionsFromProducts(allProducts, keywordLower) {
    const suggestions = [];
    const added = { brands: new Set(), models: new Set(), products: new Set() };
    
    allProducts.forEach(product => {
      const title = product.title || '';
      const brand = product.vehicle?.brand || product.battery?.brand || '';
      const model = product.vehicle?.model || product.battery?.model || '';
      
      // Product suggestions
      if (title.toLowerCase().includes(keywordLower) && !added.products.has(title.toLowerCase())) {
        suggestions.push({ id: product.id, displayName: title, type: 'product' });
        added.products.add(title.toLowerCase());
      }
      
      // Brand suggestions
      if (brand && brand.toLowerCase().includes(keywordLower) && !added.brands.has(brand.toLowerCase())) {
        suggestions.push({
          id: `brand-${brand}`,
          displayName: brand,
          type: 'brand',
          isKnownBrand: isBrand(brand)
        });
        added.brands.add(brand.toLowerCase());
      }
      
      // Model suggestions
      if (model && model.toLowerCase().includes(keywordLower) && !added.models.has(model.toLowerCase())) {
        suggestions.push({ id: `model-${model}`, displayName: model, type: 'model' });
        added.models.add(model.toLowerCase());
      }
    });

    return suggestions;
  },

  removeDuplicateSuggestions(suggestions) {
    return suggestions.filter((item, index, self) => 
      index === self.findIndex(t => t.displayName.toLowerCase() === item.displayName.toLowerCase())
    );
  },

  // ==================== MAIN HANDLERS ====================
  
  /**
   * Handler chính cho search bar
   */
  async handleSearch(searchTerm) {
    if (!searchTerm.trim()) {
      return { success: false, message: 'Vui lòng nhập từ khóa tìm kiếm' };
    }

    // Navigate đến trang search với query param
    return {
      success: true,
      redirect: `/search?q=${encodeURIComponent(searchTerm)}`,
      searchTerm: searchTerm
    };
  },

  /**
   * Fetch suggestions cho search bar
   */
  async fetchSuggestions(keyword) {
    if (!keyword.trim()) return { success: true, data: [] };

    try {
      const autocompleteResult = await this.getAutocompleteSuggestions(keyword);
      
      if (autocompleteResult.success && autocompleteResult.data.length > 0) {
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

  // ==================== ERROR HANDLING ====================
  
  handleError(functionName, error, context) {
    const status = error?.response?.status;
    const backendMessage = error?.response?.data?.message || error?.message;
    console.error(`${functionName} failed:`, { context, status, backendMessage });
    return { 
      success: false, 
      message: `Lỗi ${functionName} (${status || "network"}): ${backendMessage || "Không rõ"}` 
    };
  }
};

export default searchService;
