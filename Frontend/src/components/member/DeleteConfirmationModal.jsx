import { Modal, Button, Alert, Spinner } from "react-bootstrap";

const DeleteConfirmationModal = ({
  show,
  onHide,
  loading,
  selectedPost,
  onConfirm,
  formatCurrency,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Xác nhận xóa tin đăng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Bạn có chắc chắn muốn xóa tin đăng này không?</p>
        {selectedPost && (
          <div className="bg-light p-3 rounded">
            <strong>
              {selectedPost.title ||
                selectedPost.productName ||
                "Không có tiêu đề"}
            </strong>
            <br />
            <span className="text-success">
              {formatCurrency(
                selectedPost.price ||
                  selectedPost.vehicle?.price ||
                  selectedPost.battery?.price ||
                  0
              )}
            </span>
          </div>
        )}
        <Alert variant="warning" className="mt-3 mb-0">
          <small>Hành động này không thể hoàn tác!</small>
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="light"
          onClick={onHide}
          style={{
            backgroundColor: "white",
            border: "1px solid black",
            color: "black",
          }}
        >
          Hủy
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Đang xóa...
            </>
          ) : (
            "Xóa tin đăng"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationModal;

