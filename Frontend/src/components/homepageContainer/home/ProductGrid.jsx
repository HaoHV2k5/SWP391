import React from 'react';
import { Row, Col } from 'react-bootstrap';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, filteredProducts = [], hasActiveFilters = false }) => {
  // Logic display products: hiển thị sản phẩm đã lọc khi có filter, ngược lại hiển thị tất cả
  const displayProducts = hasActiveFilters ? filteredProducts : products;
  const showEmptyState = hasActiveFilters && filteredProducts.length === 0;

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
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;