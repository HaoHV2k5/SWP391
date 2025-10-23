import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Col, Row } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import BaseFilterBar from "../../components/homepageContainer/filters/BaseFilterBar";
import { useFilter } from "../../hooks/useFilter";
import ProductCard from "../../components/homepageContainer/home/ProductCard";
import LoadMoreButton from "../../components/homepageContainer/home/LoadMoreButton";
import useProducts from "../../hooks/useProducts";
import usePagination from "../../hooks/usePagination";
import searchService from "../../services/searchService";

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sử dụng pagination hook
  const { visibleCount, handleLoadMore, resetPagination } = usePagination(6);

  // Lấy sản phẩm từ BE và áp dụng filter
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { filteredProducts, handleFiltersChange } = useFilter(products, ['priceRange', 'year']);

  // Reset pagination khi search keyword thay đổi hoặc khi products thay đổi
  useEffect(() => {
    resetPagination();
  }, [searchKeyword, products.length]);

  // Reset pagination khi filter thay đổi
  const handleFilterChange = (filters) => {
    handleFiltersChange(filters);
    resetPagination();
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('q') || searchParams.get('search');
    
    if (!searchQuery || !searchQuery.trim()) {
      // Không có keyword → về trang chủ
      navigate('/');
      return;
    }

    setSearchKeyword(searchQuery);
    performSearch(searchQuery);
  }, [location.search, navigate]);

  const performSearch = async (keyword) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("🔍 Searching for:", keyword);
      const result = await searchService.searchProducts(keyword);
      
      if (result.success) {
        setSearchResults(result.data || []);
        console.log("✅ Search results:", result.data?.length || 0, "products");
      } else {
        setError(result.message || "Không tìm thấy sản phẩm");
        setSearchResults([]);
      }
    } catch (err) {
      console.error("❌ Search error:", err);
      setError("Có lỗi xảy ra khi tìm kiếm");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Lọc search results với filters (price, year)
  let finalProducts = [];
  
  if (searchResults.length > 0) {
    const searchResultIds = new Set(searchResults.map(p => p.id));
    finalProducts = filteredProducts.filter(p => searchResultIds.has(p.id));
  }

  // Sản phẩm hiển thị (với pagination)
  const displayedProducts = finalProducts.slice(0, visibleCount);
  const hasMore = visibleCount < finalProducts.length;

  return (
    <div className="container py-4">
      {/* Filter bar cho price, year */}
      <div className="mb-4">
        <BaseFilterBar 
          onFilterChange={handleFilterChange}
          filterTypes={['priceRange', 'year']}
          showVehicleType={false}
        />
      </div>

      {/* Hiển thị sản phẩm hoặc loading/error */}
      {loading || productsLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
          <p>Đang tìm kiếm...</p>
        </div>
      ) : error || productsError ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#e74c3c' }}>
          <p>{error || productsError}</p>
        </div>
      ) : finalProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
          <h3>Không tìm thấy sản phẩm</h3>
          <p>
            Không có kết quả nào cho từ khóa "{searchKeyword}".
            <br />
            Hãy thử lại với từ khóa khác!
          </p>
        </div>
      ) : (
        <>
          <Row className="g-4">
            {displayedProducts.map((product) => (
              <Col key={product.id} xs={12} md={6} lg={4}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>

          {/* Nút "Xem thêm" */}
                 {hasMore && (
                   <LoadMoreButton onClick={() => handleLoadMore(finalProducts.length)} />
                 )}
        </>
      )}
    </div>
  );
};

export default SearchResultsPage;
