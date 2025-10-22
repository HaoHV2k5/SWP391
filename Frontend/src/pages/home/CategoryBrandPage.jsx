import React, { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { Col, Row, Badge, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import BaseFilterBar from '../../components/homepageContainer/filters/BaseFilterBar';
import { useFilter } from '../../hooks/useFilter';
import ProductCard from '../../components/homepageContainer/home/ProductCard';
import useProducts from '../../hooks/useProducts';

const CategoryBrandPage = () => {
  const { type } = useParams(); // Lấy category type từ URL
  const location = useLocation();
  const [urlFilters, setUrlFilters] = useState({});

  // Lấy sản phẩm từ BE và áp dụng filter
  const { products, loading, error } = useProducts();
  const { filteredProducts, handleFiltersChange } = useFilter(products, ['priceRange', 'year']);

  // Xử lý URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const brand = urlParams.get('brand');
    const model = urlParams.get('model');
    
    if (brand || model) {
      setUrlFilters({ brand: brand || '', model: model || '' });
    } else {
      setUrlFilters({});
    }
  }, [location.search]);

  // Mapping URL param với ProductType từ Backend
  const getProductTypeFromUrl = (urlType) => {
    const mapping = {
      "electric-scooter": "VEHICLE",
      "battery": "BATTERY"
    };
    return mapping[urlType];
  };

  // Lọc sản phẩm theo category và URL filters
  let categoryProducts;
  
  if (urlFilters.brand || urlFilters.model) {
    // Nếu có URL filters, áp dụng filter từ filteredProducts (đã có priceRange, year)
    categoryProducts = filteredProducts.filter(p => {
      // Nếu có URL brand filter, hiển thị cả VEHICLE và BATTERY
      if (urlFilters.brand) {
        const brand = p.vehicle?.brand || p.battery?.brand || '';
        const title = p.title || '';
        // Lọc theo brand field hoặc title nếu brand field rỗng
        const brandMatch = brand.toLowerCase() === urlFilters.brand.toLowerCase();
        const titleMatch = title.toLowerCase().includes(urlFilters.brand.toLowerCase());
        if (!brandMatch && !titleMatch) return false;
        return true; // Bỏ qua filter productType khi có brand filter
      }
      
      // Nếu có URL model filter, hiển thị cả VEHICLE và BATTERY
      if (urlFilters.model) {
        const model = p.vehicle?.model || p.battery?.model || '';
        const title = p.title || '';
        // Lọc theo model field hoặc title nếu model field rỗng
        const modelMatch = model.toLowerCase() === urlFilters.model.toLowerCase();
        const titleMatch = title.toLowerCase().includes(urlFilters.model.toLowerCase());
        if (!modelMatch && !titleMatch) return false;
        return true; // Bỏ qua filter productType khi có model filter
      }
      
      return true;
    });
  } else {
    // Nếu không có URL filters, lọc theo category như bình thường
    categoryProducts = filteredProducts.filter(p => {
      const expectedProductType = getProductTypeFromUrl(type);
      return p.productType === expectedProductType;
    });
  }


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
      {/* Filter bar cho price, year (bỏ brand khi đang hiển thị brand) */}
      <BaseFilterBar 
        onFilterChange={handleFiltersChange}
        filterTypes={['priceRange', 'year']}
        showVehicleType={false}
      />

      {/* Tiêu đề category với thông tin brand/model nếu có */}
      <div className="mb-4">
        {urlFilters.brand ? (
          <h2>Thương hiệu: {urlFilters.brand.charAt(0).toUpperCase() + urlFilters.brand.slice(1)}</h2>
        ) : urlFilters.model ? (
          <h2>Mẫu: {urlFilters.model.charAt(0).toUpperCase() + urlFilters.model.slice(1)}</h2>
        ) : (
          <h2>Danh mục: {formatType(type)}</h2>
        )}
        
      </div>

      {/* Hiển thị sản phẩm hoặc loading/error */}
      {loading ? (
        <p>Đang tải dữ liệu…</p>
      ) : error ? (
        <p style={{ color: '#e74c3c' }}>{error}</p>
      ) : categoryProducts.length === 0 ? (
        <Alert variant="info">
          <Alert.Heading>Không có sản phẩm</Alert.Heading>
          <p>
            {urlFilters.brand 
              ? `Không tìm thấy sản phẩm nào cho thương hiệu "${urlFilters.brand}".`
              : urlFilters.model
              ? `Không tìm thấy sản phẩm nào cho mẫu "${urlFilters.model}".`
              : `Không có sản phẩm nào trong danh mục ${formatType(type)}.`
            }
          </p>
        </Alert>
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

export default CategoryBrandPage;
