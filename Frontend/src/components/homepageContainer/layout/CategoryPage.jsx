import React from 'react'
import { useParams } from 'react-router-dom'
import { Col, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import BaseFilterBar from '../../BaseFilterBar';
import { useFilter } from '../../../hooks/useFilter';
import ProductCard from '../home/ProductCard';
import useProducts from '../../../hooks/useProducts';

const CategoryPage = () => {
  const { type } = useParams();

  // Lấy sản phẩm từ BE qua hook dùng chung
  const { products, loading, error } = useProducts();
  const { filteredProducts, handleFiltersChange } = useFilter(products, ['priceRange', 'brand', 'year']);

  // Lấy sản phẩm theo category - map URL param với ProductType từ Backend
  const getProductTypeFromUrl = (urlType) => {
    const mapping = {
      "electric-scooter": "ELECTRIC_SCOOTER",
      "electric-bicycle": "ELECTRIC_BIKE", 
      "battery-charger": "BATTERY"
    };
    return mapping[urlType];
  };

  const categoryProducts = filteredProducts.filter(p => {
    const expectedProductType = getProductTypeFromUrl(type);
    return p.productType === expectedProductType;
  });

  const formatType = (str) => {
    const mapping = {
      "electric-scooter": "Xe máy điện",
      "electric-bicycle": "Xe đạp điện",
      "battery-charger": "Pin/Ắc quy",
    }
    return mapping[str] || str;
  }

  return (
    <div className="container py-4">

      <BaseFilterBar 
        onFilterChange={handleFiltersChange}
        filterTypes={['priceRange', 'brand', 'year']}
        showVehicleType={false}
      />

      <h2>Danh mục: {formatType(type)}</h2>

      {loading ? (
        <p>Đang tải dữ liệu…</p>
      ) : error ? (
        <p style={{ color: '#e74c3c' }}>{error}</p>
      ) : (
        <>
          <p>Tìm thấy {categoryProducts.length} tin đăng</p>
          <Row className='g-4'>
            {categoryProducts.map((product) => (
              <Col key={product.id} xs={12} md={6} lg={4}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  )
}

export default CategoryPage