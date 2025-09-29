import { Card, Button, Badge } from "react-bootstrap";
import { Bell } from "lucide-react";

const MemberHeader = ({ activeTab }) => {
  const getTabTitle = (tab) => {
    switch (tab) {
      case "dashboard":
        return "Tổng quan";
      case "orders":
        return "Đơn hàng của tôi";
      case "wishlist":
        return "Danh sách yêu thích";
      case "profile":
        return "Hồ sơ cá nhân";
      default:
        return "Tổng quan";
    }
  };

  return (
    <Card className="mb-4 border-0 shadow-sm">
      <Card.Body className="d-flex justify-content-between align-items-center py-3">
        <h1 className="h3 mb-0 fw-bold text-dark">
          {getTabTitle(activeTab)}
        </h1>

        <div className="d-flex gap-2 align-items-center">
          <Button variant="outline-success" className="position-relative">
            <Bell size={20} />
            <Badge 
              bg="success" 
              pill 
              className="position-absolute top-0 start-100 translate-middle"
              style={{ fontSize: "0.7rem" }}
            >
              2
            </Badge>
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MemberHeader;
