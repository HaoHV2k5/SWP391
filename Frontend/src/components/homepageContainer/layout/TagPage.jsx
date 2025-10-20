import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import ProductGrid from '../home/ProductGrid';
import searchService from '../../../services/searchService';

const TagPage = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [tagInfo, setTagInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
          <p className="mt-2">Đang tải sản phẩm theo tag...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Lỗi tải sản phẩm</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <div className="mb-4">
            <h2 className="mb-2">Sản phẩm theo tag: {slug}</h2>
            {tagInfo && (
              <div className="d-flex gap-2 align-items-center">
                <Badge bg="primary">{tagInfo.type}</Badge>
                <Badge bg="secondary">{tagInfo.brand.charAt(0).toUpperCase() + tagInfo.brand.slice(1)}</Badge>
                <Badge bg="info">{tagInfo.model.charAt(0).toUpperCase() + tagInfo.model.slice(1)}</Badge>
              </div>
            )}
          </div>
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <Alert variant="info">
              <Alert.Heading>Không có sản phẩm</Alert.Heading>
              <p>Không tìm thấy sản phẩm nào cho tag "{slug}".</p>
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default TagPage;
