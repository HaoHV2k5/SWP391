import React from 'react';
import { Alert, Button } from 'react-bootstrap';

const OrderErrorAlert = ({ show, onClose, errorType }) => {
  if (!show) return null;

  const getErrorMessage = () => {
    switch (errorType) {
      case '403':
        return {
          title: "Không có quyền mua hàng",
          message: "Tài khoản của bạn không có quyền mua sản phẩm này. Chỉ có member/user mới có thể mua hàng. Vui lòng liên hệ admin để được hỗ trợ.",
          variant: "warning"
        };
      case '401':
        return {
          title: "Chưa đăng nhập",
          message: "Bạn cần đăng nhập để mua sản phẩm. Vui lòng đăng nhập và thử lại.",
          variant: "info"
        };
      case '400':
        return {
          title: "Thông tin không hợp lệ",
          message: "Thông tin sản phẩm hoặc người dùng không hợp lệ. Vui lòng thử lại.",
          variant: "danger"
        };
      default:
        return {
          title: "Lỗi hệ thống",
          message: "Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.",
          variant: "danger"
        };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <Alert variant={errorInfo.variant} className="mt-3">
      <Alert.Heading>
        <i className="bi bi-exclamation-triangle me-2"></i>
        {errorInfo.title}
      </Alert.Heading>
      <p>{errorInfo.message}</p>
      <hr />
      <div className="d-flex justify-content-end">
        <Button variant="outline-secondary" size="sm" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </Alert>
  );
};

export default OrderErrorAlert;
