import React, { useState } from 'react';
import { Button, Modal, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import orderService from '../../services/orderService';

const BuyButton = ({ product, user, onOrderSuccess }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmBuy, setConfirmBuy] = useState(false);

  // Kiểm tra xem user có phải là seller của sản phẩm không
  const isOwnProduct = user?.id && product?.sellerId && user.id === product.sellerId;

  // Kiểm tra xem user có đăng nhập không
  const isLoggedIn = user && user.id;

  // Kiểm tra xem user có role phù hợp để mua hàng không
  const canBuy = isLoggedIn && !isOwnProduct;

  const handleBuyClick = () => {
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để mua sản phẩm");
      return;
    }

    if (isOwnProduct) {
      toast.error("Bạn không thể mua sản phẩm của chính mình");
      return;
    }

    // Kiểm tra role của user
    const userRole = user?.role || user?.user?.role;
    if (userRole && userRole !== 'member' && userRole !== 'user') {
      toast.error("Tài khoản của bạn không có quyền mua hàng. Vui lòng liên hệ admin để được hỗ trợ.");
      return;
    }

    setShowModal(true);
  };

  const handleConfirmBuy = async () => {
    if (!confirmBuy) {
      toast.error("Vui lòng xác nhận bạn đã đọc và hiểu thông tin");
      return;
    }

    setLoading(true);
    
    try {
      const result = await orderService.createOrder(product.id, user.id);
      
      if (!result.success) {
        throw new Error(result.message || 'Tạo đơn hàng thất bại');
      }

      toast.success("Đã gửi yêu cầu mua sản phẩm thành công! Người bán sẽ xem xét và phản hồi.");
      setShowModal(false);
      setConfirmBuy(false);
      
      // Gọi callback nếu có
      if (onOrderSuccess) {
        onOrderSuccess(result.data);
      }
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message;
      
      if (status === 401) {
        toast.error("Bạn cần đăng nhập để mua sản phẩm");
      } else if (status === 403) {
        toast.error("Bạn không có quyền mua sản phẩm. Chỉ có member/user mới có thể mua hàng. Vui lòng liên hệ admin để được hỗ trợ.");
      } else if (status === 400) {
        if (backendMessage?.includes('sản phẩm') || backendMessage?.includes('product')) {
          toast.error("Sản phẩm không tồn tại hoặc đã được bán");
        } else {
          toast.error(backendMessage || "Không thể tạo đơn hàng");
        }
      } else {
        toast.error(backendMessage || "Tạo đơn hàng thất bại. Vui lòng thử lại");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setConfirmBuy(false);
  };

  // Không hiển thị nút nếu user chưa đăng nhập, là chủ sản phẩm, hoặc không có quyền mua hàng
  if (!canBuy) {
    return null;
  }

  // Kiểm tra role và ẩn nút nếu không phù hợp
  const userRole = user?.role || user?.user?.role;
  if (userRole && userRole !== 'member' && userRole !== 'user') {
    return null;
  }

  return (
    <>
      <Button 
        size="lg" 
        className="w-100 mb-3"
        onClick={handleBuyClick}
        disabled={loading}
        style={{ 
          backgroundColor: '#00A86B', 
          borderColor: '#00A86B',
          color: 'white',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = '#009057';
            e.target.style.borderColor = '#009057';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = '#00A86B';
            e.target.style.borderColor = '#00A86B';
          }
        }}
      >
        <i className="bi bi-cart-plus me-2"></i>
        Mua ngay
      </Button>

      {/* Modal xác nhận mua hàng */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-cart-plus text-success me-2"></i>
            Xác nhận mua hàng
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <h5 className="text-success">{product?.title}</h5>
            <p className="text-muted mb-2">
              <strong>Giá:</strong> {new Intl.NumberFormat('vi-VN', { 
                style: 'currency', 
                currency: 'VND' 
              }).format(Number(product?.price || 0))}
            </p>
          </div>

          <Alert variant="info" className="mb-3">
            <h6 className="alert-heading">
              <i className="bi bi-info-circle me-2"></i>
              Thông tin quan trọng
            </h6>
            <ul className="mb-0">
              <li>Bạn đang gửi <strong>yêu cầu mua hàng</strong> cho người bán</li>
              <li>Người bán sẽ <strong>xem xét và phản hồi</strong> yêu cầu của bạn</li>
              <li>Sản phẩm sẽ <strong>tạm thời ẩn</strong> khỏi danh sách sau khi gửi yêu cầu</li>
              <li>Người bán có thể <strong>chấp nhận hoặc từ chối</strong> yêu cầu của bạn</li>
              <li>Nếu được chấp nhận, bạn sẽ được hướng dẫn các bước tiếp theo</li>
              <li><strong>Lưu ý:</strong> Seller cũng có thể mua hàng của seller khác</li>
            </ul>
          </Alert>

          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="confirmBuy"
              checked={confirmBuy}
              onChange={(e) => setConfirmBuy(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="confirmBuy">
              Tôi đã đọc và hiểu thông tin trên, đồng ý gửi yêu cầu mua hàng
            </label>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button 
            onClick={handleCloseModal}
            style={{
              backgroundColor: 'white',
              border: '1px solid #212529',
              color: '#212529',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '400',
              lineHeight: '1.5',
              transition: 'all 0.3s ease',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.borderColor = '#495057';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#212529';
            }}
          >
            Hủy
          </button>
          <Button 
            onClick={handleConfirmBuy}
            disabled={!confirmBuy || loading}
            style={{ 
              backgroundColor: '#00A86B', 
              borderColor: '#00A86B',
              color: 'white',
              height: '38px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading && confirmBuy) {
                e.target.style.backgroundColor = '#009057';
                e.target.style.borderColor = '#009057';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#00A86B';
                e.target.style.borderColor = '#00A86B';
              }
            }}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Xác nhận mua
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default BuyButton;
