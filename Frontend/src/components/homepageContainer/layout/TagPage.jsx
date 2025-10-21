import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Col, Row, Alert, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import BaseFilterBar from '../../BaseFilterBar';
import { useFilter } from '../../../hooks/useFilter';
import ProductCard from '../home/ProductCard';
import searchService from '../../../services/searchService';

const TagPage = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [tagInfo, setTagInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Áp dụng filter cho sản phẩm tag
  const { filteredProducts, handleFiltersChange } = useFilter(products, ['priceRange', 'year']);

  useEffect(() => {
    const fetchProductsByTag = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await searchService.getProductsByTag(slug);
        
        if (result.success) {
          setProducts(result.data);
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

  // Format tên hiển thị cho tag
  const formatTagName = (tagSlug) => {
    return tagSlug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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
      {loading ? (
        <p>Đang tải dữ liệu…</p>
      ) : error ? (
        <p style={{ color: '#e74c3c' }}>{error}</p>
      ) : filteredProducts.length === 0 ? (
        <Alert variant="info">
          <Alert.Heading>Không có sản phẩm</Alert.Heading>
          <p>Không tìm thấy sản phẩm nào cho tag "{formatTagName(slug)}".</p>
        </Alert>
      ) : (
        <Row className='g-4'>
          {filteredProducts.map((product) => (
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
