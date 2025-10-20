import React from 'react'
import { useParams } from 'react-router-dom'
import { Col, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import BaseFilterBar from '../../BaseFilterBar';
import { useFilter } from '../../../hooks/useFilter';
import ProductCard from '../home/ProductCard';
import useProducts from '../../../hooks/useProducts';

const CategoryPage = () => {
  const { type } = useParams(); // Lấy category type từ URL

  // Lấy sản phẩm từ BE và áp dụng filter
  const { products, loading, error } = useProducts();
  const { filteredProducts, handleFiltersChange } = useFilter(products, ['priceRange', 'brand', 'year']);

  // Mapping URL param với ProductType từ Backend
  const getProductTypeFromUrl = (urlType) => {
    const mapping = {
      "electric-scooter": "VEHICLE",
      "battery": "BATTERY"
    };
    return mapping[urlType];
  };

  // Lọc sản phẩm theo category
  const categoryProducts = filteredProducts.filter(p => {
    const expectedProductType = getProductTypeFromUrl(type);
    return p.productType === expectedProductType;
  });

  // Format tên hiển thị cho category
  const formatType = (str) => {
    const mapping = {
      "electric-scooter": "Xe máy điện",
      "battery": "Pin"
    }
    return mapping[str] || str;
  }

  return (
    <div className="container py-4">
      {/* Filter bar cho price, brand, year */}
      <BaseFilterBar 
        onFilterChange={handleFiltersChange}
        filterTypes={['priceRange', 'brand', 'year']}
        showVehicleType={false}
      />

      {/* Tiêu đề category */}
      <h2>Danh mục: {formatType(type)}</h2>

      {/* Hiển thị sản phẩm hoặc loading/error */}
      {loading ? (
        <p>Đang tải dữ liệu…</p>
      ) : error ? (
        <p style={{ color: '#e74c3c' }}>{error}</p>
      ) : (
        <Row className='g-4'>
          {categoryProducts.map((product) => (
            <Col key={product.id} xs={12} md={6} lg={4}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}

export default CategoryPage