import { Card } from "react-bootstrap";

const MemberHeader = ({ activeTab }) => {
  const getTabTitle = (tab) => {
    switch (tab) {
      case "post-ad":
        return "Đăng tin bán hàng";
      case "my-posts":
        return "Tin đăng của tôi";
      case "saved-posts":
        return "Tin đã lưu";
      case "orders":
        return "Đơn hàng của tôi";
      case "my-orders":
        return "Yêu cầu mua hàng";
      case "ai-tools":
        return "AI Trợ Lý Thông Minh";
      default:
        return "Trang chủ";
    }
  };

  return (
    <Card className="mb-4 border-0 shadow-sm">
      <Card.Body className="d-flex justify-content-between align-items-center py-3">
        <h1 className="h3 mb-0 fw-bold text-dark">
          {getTabTitle(activeTab)}
        </h1>

      </Card.Body>
    </Card>
  );
};

export default MemberHeader;
