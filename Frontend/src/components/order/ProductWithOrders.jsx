import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import orderService from '../../services/orderService';

const ProductWithOrders = ({ product, onOrderUpdate }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
                          onClick={() => {
                            // TODO: Implement accept order logic
                            toast.info("Chức năng chấp nhận đơn hàng sẽ được phát triển trong phần Contract");
                          }}
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
    </Card>
  );
};

export default ProductWithOrders;
