import { Modal, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const RequireApprovalPackageModal = ({ show, onHide }) => {
  const navigate = useNavigate();

  const handleGoToPackages = () => {
    onHide();
    navigate("/payment");
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Cần gói đăng tin cần duyệt</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="warning" className="mb-3">
          <strong>Lưu ý:</strong>
          <p className="mb-0 mt-2">
            Để chỉnh sửa tin đăng, bạn cần sử dụng gói đăng tin có tính năng
            duyệt bài. Gói hiện tại của bạn không hỗ trợ tính năng này.
          </p>
        </Alert>
        <p>
          Vui lòng mua gói đăng tin cần duyệt để có thể chỉnh sửa thông tin tin
          đăng của bạn.
        </p>
        <div className="bg-light p-3 rounded">
          <strong>Lợi ích của gói cần duyệt:</strong>
          <ul className="mb-0 mt-2">
            <li>Được phép chỉnh sửa tin đăng</li>
            <li>Tin đăng được kiểm duyệt để đảm bảo chất lượng</li>
            <li>Được hỗ trợ từ Staff và Admin</li>
          </ul>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onHide}>
          Đóng
        </Button>
        <Button variant="success" onClick={handleGoToPackages}>
          Đi đến trang mua gói
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RequireApprovalPackageModal;

