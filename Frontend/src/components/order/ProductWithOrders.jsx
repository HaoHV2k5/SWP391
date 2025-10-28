import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import orderService from '../../services/orderService';
import contractService from '../../services/contractService';

const ProductWithOrders = ({ product, onOrderUpdate }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [sellerInfo, setSellerInfo] = useState({
    sellerName: '',
    sellerEmail: '',
    buyerName: '',
    buyerEmail: ''
  });

  useEffect(() => {
    if (product?.id) {
      loadOrders();
    }
  }, [product?.id]);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await orderService.getOrdersByProduct(product.id);
      
      if (result.success) {
        setOrders(result.data || []);
      } else {
        setError(result.message || 'Không thể tải danh sách đơn hàng');
      }
    } catch (error) {
      setError('Lỗi khi tải danh sách đơn hàng');
      console.error('Load orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      const result = await orderService.rejectOrder(orderId);
      
      if (result.success) {
        toast.success("Đã từ chối đơn hàng thành công");
        // Reload danh sách orders
        loadOrders();
        // Gọi callback nếu có
        if (onOrderUpdate) {
          onOrderUpdate();
        }
      } else {
        toast.error(result.message || "Từ chối đơn hàng thất bại");
      }
    } catch (error) {
      toast.error("Từ chối đơn hàng thất bại. Vui lòng thử lại");
      console.error('Reject order error:', error);
    }
  };

  const handleOpenAcceptModal = (order) => {
    setSelectedOrder(order);
    // Lấy thông tin seller từ localStorage
    const userData = localStorage.getItem("userData");
    let sellerName = '';
    let sellerEmail = '';
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        sellerName = user.fullName || user.fullname || user.user?.fullName || '';
        sellerEmail = user.email || user.user?.email || '';
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    // Lấy thông tin buyer từ order
    const buyerName = order.buyerName || '';
    const buyerEmail = order.buyerEmail || '';
    
    setSellerInfo({
      sellerName,
      sellerEmail,
      buyerName,
      buyerEmail
    });
    setShowAcceptModal(true);
  };

  const handleAcceptOrder = async () => {
    if (!selectedOrder) return;
    
    setAccepting(true);
    
    try {
      const request = {
        orderId: selectedOrder.id,
        sellerName: sellerInfo.sellerName,
        sellerEmail: sellerInfo.sellerEmail,
        buyerName: sellerInfo.buyerName,
        buyerEmail: sellerInfo.buyerEmail
      };
      
      const result = await contractService.createContractWithTemplate(request);
      
      if (result.success) {
        toast.success(result.message || "Chấp nhận đơn hàng và tạo hợp đồng thành công! Email đã được gửi cho cả 2 bên để ký.");
        setShowAcceptModal(false);
        setSelectedOrder(null);
        // Reload danh sách
        loadOrders();
        if (onOrderUpdate) {
          onOrderUpdate();
        }
      } else {
        toast.error(result.message || "Chấp nhận đơn hàng thất bại");
      }
    } catch (error) {
      console.error('Accept order error:', error);
      toast.error("Chấp nhận đơn hàng thất bại. Vui lòng thử lại");
    } finally {
      setAccepting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge bg="warning">Chờ phản hồi</Badge>;
      case 'ACCEPTED':
        return <Badge bg="success">Đã chấp nhận</Badge>;
      case 'REJECTED':
        return <Badge bg="danger">Đã từ chối</Badge>;
      case 'CANCELLED':
        return <Badge bg="secondary">Đã hủy</Badge>;
      default:
        return <Badge bg="light" text="dark">{status}</Badge>;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(Number(price || 0));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  // Chỉ hiển thị component nếu có orders
  if (orders.length === 0 && !loading) {
    return null;
  }

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" variant="primary" />
        <div className="mt-2">Đang tải đơn hàng...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Lỗi</Alert.Heading>
        {error}
        <Button variant="outline-danger" size="sm" className="mt-2" onClick={loadOrders}>
          Thử lại
        </Button>
      </Alert>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Header className="bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">{product.title}</h6>
          <span className="badge" style={{ backgroundColor: '#00A86B', color: 'white' }}>
            {formatPrice(product.price)}
          </span>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Yêu cầu mua hàng ({orders.length})</h5>
          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={loadOrders}
            style={{ borderColor: '#00A86B', color: '#00A86B' }}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Làm mới
          </Button>
        </div>
        
        <div className="row">
          {orders.map((order) => (
            <div key={order.id} className="col-12 mb-3">
              <Card>
                <Card.Body>
                  <div className="row">
                    <div className="col-md-8">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0">{order.buyerName}</h6>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      <div className="mb-2">
                        <strong>Giá đề xuất:</strong> {formatPrice(order.offeredPrice)}
                      </div>
                      
                      <div className="mb-2">
                        <strong>Thời gian:</strong> {formatDate(order.createdAt)}
                      </div>
                      
                      {order.message && (
                        <div className="mb-2">
                          <strong>Tin nhắn:</strong> {order.message}
                        </div>
                      )}
                    </div>
                    
                    <div className="col-md-4 text-end">
                      {order.status === 'PENDING' && (
                        <div>
                        <Button 
                          variant="success" 
                          size="sm" 
                          className="me-2"
                          style={{ backgroundColor: '#00A86B', borderColor: '#00A86B' }}
                          onClick={() => handleOpenAcceptModal(order)}
                        >
                          <i className="bi bi-check-circle me-1"></i>
                          Chấp nhận
                        </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => {
                              if (window.confirm('Bạn có chắc chắn muốn từ chối đơn hàng này?')) {
                                handleRejectOrder(order.id);
                              }
                            }}
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            Từ chối
                          </Button>
                        </div>
                      )}
                      
                      {order.status === 'ACCEPTED' && (
                        <Badge 
                          className="fs-6"
                          style={{ backgroundColor: '#00A86B', color: 'white' }}
                        >
                          <i className="bi bi-check-circle me-1"></i>
                          Đã chấp nhận
                        </Badge>
                      )}
                      
                      {order.status === 'REJECTED' && (
                        <Badge bg="danger" className="fs-6">
                          <i className="bi bi-x-circle me-1"></i>
                          Đã từ chối
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      </Card.Body>
      
      {/* Accept Order Modal */}
      <Modal show={showAcceptModal} onHide={() => setShowAcceptModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-check-circle-fill me-2" style={{ color: '#00A86B' }}></i>
            Xác nhận chấp nhận đơn hàng
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="mb-3">
            <Alert.Heading>
              <i className="bi bi-info-circle me-2"></i>
              Thông tin quan trọng
            </Alert.Heading>
            Khi bạn chấp nhận đơn hàng này, hệ thống sẽ:
            <ul className="mb-0 mt-2">
              <li>Tạo hợp đồng với Eversign</li>
              <li>Gửi email cho bạn (seller) để ký trước</li>
              <li>Gửi email cho người mua để ký sau</li>
              <li>Ẩn sản phẩm này khỏi marketplace</li>
              <li>Từ chối tất cả order request khác cho sản phẩm này</li>
            </ul>
          </Alert>
          
          {selectedOrder && (
            <div className="mb-3">
              <h6>Thông tin đơn hàng:</h6>
              <p className="mb-1">
                <strong>Người mua:</strong> {selectedOrder.buyerName}
              </p>
              <p className="mb-1">
                <strong>Email:</strong> {selectedOrder.buyerEmail || 'N/A'}
              </p>
              <p className="mb-1">
                <strong>Giá:</strong> {formatPrice(selectedOrder.offeredPrice)}
              </p>
            </div>
          )}
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Thông tin của bạn (Seller)</strong>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Họ và tên"
                value={sellerInfo.sellerName}
                onChange={(e) => setSellerInfo({...sellerInfo, sellerName: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Control
                type="email"
                placeholder="Email"
                value={sellerInfo.sellerEmail}
                onChange={(e) => setSellerInfo({...sellerInfo, sellerEmail: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Thông tin người mua (Buyer)</strong>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Họ và tên"
                value={sellerInfo.buyerName}
                onChange={(e) => setSellerInfo({...sellerInfo, buyerName: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Control
                type="email"
                placeholder="Email"
                value={sellerInfo.buyerEmail}
                onChange={(e) => setSellerInfo({...sellerInfo, buyerEmail: e.target.value})}
                required
              />
            </Form.Group>
          </Form>
          
          <Alert variant="warning" className="mb-0">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Vui lòng kiểm tra kỹ thông tin trước khi xác nhận. Hợp đồng sẽ được tạo ngay sau khi bạn bấm xác nhận.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowAcceptModal(false)}
            disabled={accepting}
            style={{ backgroundColor: 'white', color: 'black', borderColor: 'black' }}
          >
            Hủy
          </Button>
          <Button 
            variant="success"
            onClick={handleAcceptOrder}
            disabled={accepting || !sellerInfo.sellerName || !sellerInfo.sellerEmail || !sellerInfo.buyerName || !sellerInfo.buyerEmail}
            style={{ backgroundColor: '#00A86B', borderColor: '#00A86B' }}
          >
            {accepting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Xác nhận chấp nhận
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default ProductWithOrders;
