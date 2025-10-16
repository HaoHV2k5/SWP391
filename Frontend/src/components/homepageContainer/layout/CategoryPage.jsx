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
      "electric-scooter": "ELECTRIC_SCOOTER",  // Map với productType thực tế từ backend
      "electric-bicycle": "ELECTRIC_BICYCLE",  // Map với productType thực tế từ backend
      "battery": "BATTERY",
      "vehicle": "VEHICLE"  // "vehicle" sẽ hiển thị tất cả xe điện
    };
    return mapping[urlType];
  };

  // Hàm phân loại xe dựa trên title/description
  const getVehicleSubType = (product) => {
    // Kiểm tra tất cả các loại xe điện
    if (product.productType !== 'VEHICLE' && 
        product.productType !== 'ELECTRIC_SCOOTER' && 
        product.productType !== 'ELECTRIC_BICYCLE') return null;
    
    const title = (product.title || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    const text = `${title} ${description}`;
    
    // Từ khóa xe đạp điện
    const bicycleKeywords = ['xe đạp điện', 'xe đạp', 'bicycle', 'e-bike', 'ebike'];
    // Từ khóa xe máy điện  
    const scooterKeywords = ['xe máy điện', 'xe tay ga', 'scooter', 'xe máy', 'xe ga'];
    
    const hasBicycleKeyword = bicycleKeywords.some(keyword => text.includes(keyword));
    const hasScooterKeyword = scooterKeywords.some(keyword => text.includes(keyword));
    
    if (hasBicycleKeyword && !hasScooterKeyword) return 'electric-bicycle';
    if (hasScooterKeyword && !hasBicycleKeyword) return 'electric-scooter';
    
    // Mặc định là xe máy điện nếu không phân biệt được
    return 'electric-scooter';
  };

  const categoryProducts = filteredProducts.filter(p => {
    const expectedProductType = getProductTypeFromUrl(type);
    
    // Nếu URL là "vehicle", hiển thị tất cả xe điện (bao gồm ELECTRIC_SCOOTER, ELECTRIC_BICYCLE, VEHICLE)
    if (type === 'vehicle') {
      return p.productType === 'VEHICLE' || 
             p.productType === 'ELECTRIC_SCOOTER' || 
             p.productType === 'ELECTRIC_BICYCLE';
    }
    
    // Nếu là VEHICLE khác, cần phân loại chi tiết
    if (expectedProductType === 'VEHICLE') {
      const vehicleSubType = getVehicleSubType(p);
      return vehicleSubType === type;
    }
    
    return p.productType === expectedProductType;
  });

  const formatType = (str) => {
    const mapping = {
      "electric-scooter": "Xe máy điện",
      "electric-bicycle": "Xe đạp điện",
      "battery": "Pin",
      "vehicle": "Xe điện",  // Thêm mapping cho "vehicle"
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