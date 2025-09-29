import { Row, Col, Card, Button, Badge } from "react-bootstrap";
// Icons removed - no longer using lucide-react icons

const DashboardTab = ({ orders, wishlist, formatCurrency, setActiveTab }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#28a745";
      case "shipping":
        return "#ffc107";
      case "pending":
        return "#17a2b8";
      case "cancelled":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "shipping":
        return "Đang giao";
      case "pending":
        return "Chờ xử lý";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // getStatusIcon function removed - no longer using icons

  return (
    <div>
      {/* Quick Stats */}
      <Row className="g-4 mb-4">
        <Col lg={4} md={6}>
          <Card className="text-white border-0 h-100" style={{ background: "linear-gradient(135deg, #00A86B 0%, #2BB673 100%)" }}>
            <Card.Body className="text-center p-4">
              <h3 className="display-4 fw-bold mb-2">{orders.length}</h3>
              <p className="mb-0 opacity-75">Tổng đơn hàng</p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={6}>
          <Card className="text-white border-0 h-100" style={{ background: "linear-gradient(135deg, #2BB673 0%, #66D9A8 100%)" }}>
            <Card.Body className="text-center p-4">
              <h3 className="display-4 fw-bold mb-2">{wishlist.length}</h3>
              <p className="mb-0 opacity-75">Yêu thích</p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={6}>
          <Card className="text-white border-0 h-100" style={{ background: "linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)" }}>
            <Card.Body className="text-center p-4">
              <h3 className="display-4 fw-bold mb-2">{orders.filter(o => o.status === "completed").length}</h3>
              <p className="mb-0 opacity-75">Hoàn thành</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="h5 mb-0 text-dark">Đơn hàng gần đây</h3>
            <Button 
              variant="success" 
              size="sm"
              onClick={() => setActiveTab("orders")}
            >
              Xem tất cả
            </Button>
          </div>

          <div className="d-flex flex-column gap-3">
            {orders.slice(0, 3).map((order) => (
              <Card key={order.id} className="border-0 bg-light">
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={order.image}
                      alt={order.product}
                      className="rounded-2"
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                      }}
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-1 text-dark">{order.product}</h6>
                      <p className="mb-0 text-muted small">
                        {formatCurrency(order.price)} • {order.date}
                      </p>
                    </div>
                    <Badge 
                      bg={order.status === "completed" ? "success" : order.status === "shipping" ? "warning" : "info"}
                    >
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DashboardTab;
