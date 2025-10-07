import React from 'react'
import { useParams } from 'react-router-dom'
import { vehicleListings } from '../../../data/productsData';
import { Col, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import FilterBar from '../../FilterBar';
import useProductFilter from '../../../hooks/useProductFilter';
import ProductCard from '../home/ProductCard';

const CategoryPage = () => {
  const { type } = useParams();

  // Lấy tất cả tin đăng xe điện đang hoạt động
  const activeListings = vehicleListings.filter(listing => listing.isActive);

  const {
    filteredProducts,
    handleFiltersChange,
  } = useProductFilter(activeListings);

  // Lấy sản phẩm theo category
  const categoryProducts = filteredProducts.filter(p => p.type === type);

  const formatType = (str) => {
    const mapping = {
      "electric-scooter": "Xe máy điện",
      "electric-car": "Xe hơi điện",
      "electric-bicycle": "Xe đạp điện",
      "battery-charger": "Ắc quy",
      "accessories": "Phụ kiện",
      "service": "Dịch vụ",
    }
    return mapping[str] || str;
  }

  return (
    <div className="container py-4">

      <FilterBar onFilterChange={handleFiltersChange} />

      <h2>Danh mục: {formatType(type)}</h2>

      <p>Tìm thấy {categoryProducts.length} sản phẩm</p>

      {/* Danh sách sản phẩm */}
      <Row className='g-4'>
        {categoryProducts.map((product) => (
          <Col key={product.id} xs={12} md={6} lg={4}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default CategoryPage