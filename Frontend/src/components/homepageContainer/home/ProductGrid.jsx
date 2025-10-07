import React, { useState } from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, filteredProducts = [], hasActiveFilters = false }) => {

  const displayProducts = hasActiveFilters ? filteredProducts : products;
  const showEmptyState = hasActiveFilters && filteredProducts.length === 0;

  const limit = 6; // số lượng sản phẩm hiển thị mỗi lần
  const [visibleCount, setVisibleCount] = useState(limit);

  // Lấy danh sách sản phẩm sẽ render (giới hạn theo visibleCount)
  const visibleProducts = displayProducts.slice(0, visibleCount);
  const hasMore = visibleCount < displayProducts.length;

  // Hàm xử lý khi bấm nút “Xem thêm”
  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + limit, displayProducts.length));
  };

  return (
    <section style={{ padding: "30px 0", background: "#fff" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <h2 style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "20px",
          color: "#333"
        }}>
          {showEmptyState ? "Không tìm thấy tin đăng" : "Tin đăng xe điện"}
          <span style={{
            fontSize: "16px",
            fontWeight: "normal",
            color: "#666",
            marginLeft: "10px"
          }}>
            ({displayProducts.length} tin đăng)
          </span>
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "25px",
          padding: "20px 0"
        }}>
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {!showEmptyState && hasMore && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={handleLoadMore} ư
              style={{
                cursor: "pointer",
              }}
            >
              Xem thêm
            </button>
          </div>
        )}

        {!showEmptyState && !hasMore && (
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            Đã hiển thị tất cả sản phẩm.
          </p>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
