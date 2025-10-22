import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Col, Row, Badge, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import BaseFilterBar from '../../components/homepageContainer/filters/BaseFilterBar';
import { useFilter } from '../../hooks/useFilter';
import ProductCard from '../../components/homepageContainer/home/ProductCard';
import useProducts from '../../hooks/useProducts';
import searchService from '../../services/searchService';

const TagPage = () => {
  const { slug } = useParams();
  const [tagProducts, setTagProducts] = useState([]);
  const [tagInfo, setTagInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy sản phẩm từ BE và áp dụng filter
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { filteredProducts, handleFiltersChange } = useFilter(products, ['priceRange', 'year']);

  useEffect(() => {
    const fetchProductsByTag = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await searchService.getProductsByTag(slug);
        
        if (result.success) {
          setTagProducts(result.data);
          // Lấy thông tin tag từ sản phẩm đầu tiên (nếu có)
          if (result.data.length > 0) {
            const firstProduct = result.data[0];
            setTagInfo({
              brand: firstProduct.vehicle?.brand || firstProduct.battery?.brand || 'Unknown',
              model: firstProduct.vehicle?.model || firstProduct.battery?.model || 'Unknown',
              type: firstProduct.productType === 'VEHICLE' ? 'Xe máy điện' : 'Pin/Ắc quy'
            });
          }
        } else {
          setError(result.message || 'Không thể tải sản phẩm theo tag');
        }
      } catch (err) {
        console.error('Error fetching products by tag:', err);
        setError('Có lỗi xảy ra khi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByTag();
  }, [slug]);

  // Lọc sản phẩm theo tag và áp dụng filters
  let finalProducts = [];
  
  if (tagProducts.length > 0) {
    // Lấy IDs của sản phẩm từ tag
    const tagProductIds = new Set(tagProducts.map(p => p.id));
    
    // Lọc từ filteredProducts (đã có priceRange, year filters)
    finalProducts = filteredProducts.filter(p => tagProductIds.has(p.id));
  }

  // Format tên hiển thị cho tag với dấu tiếng Việt
  const formatTagName = (tagSlug) => {
    // Mapping từ slug không dấu sang có dấu
    const vietnameseMap = {
      'xe': 'xe',
      'dien': 'điện',
    };

    return tagSlug.split('-').map(word => {
      const lowerWord = word.toLowerCase();
      const mappedWord = vietnameseMap[lowerWord] || word;
      return mappedWord.charAt(0).toUpperCase() + mappedWord.slice(1);
    }).join(' ');
  };

  return (
    <div className="container py-4">
      {/* Filter bar cho price, year */}
      <BaseFilterBar 
        onFilterChange={handleFiltersChange}
        filterTypes={['priceRange', 'year']}
        showVehicleType={false}
      />

      {/* Tiêu đề tag */}
      <div className="mb-4">
        <h2>Tag: {formatTagName(slug)}</h2>
      </div>

      {/* Hiển thị sản phẩm hoặc loading/error */}
      {loading || productsLoading ? (
        <p>Đang tải dữ liệu…</p>
      ) : error || productsError ? (
        <p style={{ color: '#e74c3c' }}>{error || productsError}</p>
      ) : finalProducts.length === 0 ? (
        <Alert variant="info">
          <Alert.Heading>Không có sản phẩm</Alert.Heading>
          <p>Không tìm thấy sản phẩm nào cho tag "{formatTagName(slug)}".</p>
        </Alert>
      ) : (
        <Row className='g-4'>
          {finalProducts.map((product) => (
            <Col key={product.id} xs={12} md={6} lg={4}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default TagPage;
