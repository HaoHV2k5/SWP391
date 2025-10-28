import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import MemberHeader from '../../components/member/MemberHeader';
import ProductWithOrders from '../../components/order/ProductWithOrders';
import productService from '../../services/productService';
import '../../styles/member/index.css';

const MyOrders = ({ user }) => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setIsCheckingAuth(true);
      const timer = setTimeout(() => {
        if (!user) {
          navigate("/login");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    setIsCheckingAuth(false);

    // Kiểm tra role
    let userRole = null;
    if (user.user && user.user.role) {
      userRole = user.user.role;
    } else if (user.role) {
      userRole = user.role;
    }

    if (userRole !== "member") {
      navigate("/");
      return;
    }

    // Load sản phẩm của user
    loadMyProducts();
  }, [user, navigate]);

  const loadMyProducts = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError('');

    try {
      const result = await productService.getMyProducts(user.id);
      
      if (result.success) {
        setMyProducts(result.data || []);
      } else {
        setError(result.message || 'Không thể tải danh sách sản phẩm');
      }
    } catch (error) {
      setError('Lỗi khi tải danh sách sản phẩm');
      console.error('Load my products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderUpdate = () => {
    // Reload danh sách sản phẩm khi có cập nhật order
    loadMyProducts();
  };

  if (isCheckingAuth) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <Spinner animation="border" variant="success" className="mb-3" />
          <p className="text-muted">Đang kiểm tra quyền truy cập...</p>
        </div>
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Container fluid className="p-0 bg-light" style={{ minHeight: "100vh" }}>
      <div className="p-4">
        <MemberHeader activeTab="my-orders" />
        
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-success text-white">
            <h4 className="mb-0">
              <i className="bi bi-cart-check me-2"></i>
              Quản lý đơn hàng
            </h4>
          </Card.Header>
          <Card.Body className="p-4">
            {loading && (
              <div className="text-center p-4">
                <Spinner animation="border" variant="primary" />
                <div className="mt-2">Đang tải dữ liệu...</div>
              </div>
            )}

            {error && (
              <Alert variant="danger">
                <Alert.Heading>Lỗi</Alert.Heading>
                {error}
                <button 
                  className="btn btn-outline-danger btn-sm mt-2" 
                  onClick={loadMyProducts}
                >
                  Thử lại
                </button>
              </Alert>
            )}

            {!loading && !error && (
              <Tabs defaultActiveKey="orders" className="mb-3">
                <Tab eventKey="orders" title="Yêu cầu mua hàng">
                  {myProducts.length === 0 ? (
                    <div className="text-center p-4">
                      <i className="bi bi-cart-x display-4 text-muted mb-3"></i>
                      <h5 className="text-muted">Chưa có yêu cầu mua hàng nào</h5>
                      <p className="text-muted">Khi có người mua gửi yêu cầu cho sản phẩm của bạn, chúng sẽ hiển thị ở đây.</p>
                      <button 
                        className="btn btn-success"
                        onClick={() => navigate('/post-ad')}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Đăng bán sản phẩm
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h5 className="mb-3">Sản phẩm có yêu cầu mua hàng</h5>
                      <Row>
                        {myProducts.map((product) => (
                          <Col key={product.id} md={12} className="mb-4">
                            <ProductWithOrders 
                              product={product}
                              onOrderUpdate={handleOrderUpdate}
                            />
                          </Col>
                        ))}
                      </Row>
                      
                      {myProducts.length > 0 && (
                        <div className="text-center mt-4">
                          <p className="text-muted">
                            <i className="bi bi-info-circle me-2"></i>
                            Chỉ hiển thị sản phẩm có yêu cầu mua hàng
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Tab>
                
                <Tab eventKey="info" title="Thông tin">
                  <div className="p-4">
                    <h5>Thông tin về hệ thống đơn hàng</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <Card className="mb-3">
                          <Card.Body>
                            <h6 className="text-success">
                              <i className="bi bi-check-circle me-2"></i>
                              Quy trình mua hàng
                            </h6>
                            <ol className="mb-0">
                              <li>Người mua gửi yêu cầu mua hàng</li>
                              <li>Bạn xem xét và phản hồi</li>
                              <li>Chấp nhận: Chuyển sang bước thanh toán</li>
                              <li>Từ chối: Đơn hàng bị hủy</li>
                            </ol>
                          </Card.Body>
                        </Card>
                      </div>
                      <div className="col-md-6">
                        <Card className="mb-3">
                          <Card.Body>
                            <h6 className="text-info">
                              <i className="bi bi-info-circle me-2"></i>
                              Lưu ý quan trọng
                            </h6>
                            <ul className="mb-0">
                              <li>Sản phẩm sẽ ẩn khi có yêu cầu mua</li>
                              <li>Chỉ có thể có 1 đơn hàng active</li>
                              <li>Bạn có quyền từ chối bất kỳ yêu cầu nào</li>
                              <li>Khi chấp nhận sẽ chuyển sang hợp đồng</li>
                            </ul>
                          </Card.Body>
                        </Card>
                      </div>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            )}
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default MyOrders;
