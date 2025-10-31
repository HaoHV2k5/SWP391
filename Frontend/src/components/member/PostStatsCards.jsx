import { Row, Col, Card } from "react-bootstrap";

const PostStatsCards = ({ posts }) => {
  return (
    <Row className="g-4 mb-4">
      <Col lg={3} md={6}>
        <Card
          className="text-dark h-100"
          style={{
            backgroundColor: "white",
            border: "2px solid #28a745",
          }}
        >
          <Card.Body className="text-center p-3">
            <h4 className="fw-bold mb-1 text-dark">
              {posts.filter((p) => (p.status || "").toUpperCase() === "PENDING").length}
            </h4>
            <small className="text-dark">Tin chờ duyệt</small>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6}>
        <Card
          className="text-dark h-100"
          style={{
            backgroundColor: "white",
            border: "2px solid #28a745",
          }}
        >
          <Card.Body className="text-center p-3">
            <h4 className="fw-bold mb-1 text-dark">
              {posts.filter((p) => (p.status || "").toUpperCase() === "STAFF_APPROVED").length}
            </h4>
            <small className="text-dark">Đã duyệt Staff</small>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6}>
        <Card
          className="text-dark h-100"
          style={{
            backgroundColor: "white",
            border: "2px solid #28a745",
          }}
        >
          <Card.Body className="text-center p-3">
            <h4 className="fw-bold mb-1 text-dark">
              {posts.filter(
                (p) =>
                  (p.status || "").toUpperCase() === "ADMIN_APPROVED" ||
                  (p.status || "").toUpperCase() === "ACTIVE"
              ).length}
            </h4>
            <small className="text-dark">Đã duyệt/Hiển thị</small>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6}>
        <Card
          className="text-dark h-100"
          style={{
            backgroundColor: "white",
            border: "2px solid #28a745",
          }}
        >
          <Card.Body className="text-center p-3">
            <h4 className="fw-bold mb-1 text-dark">
              {posts.filter((p) => (p.status || "").toUpperCase() === "REJECTED").length}
            </h4>
            <small className="text-dark">Bị từ chối</small>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default PostStatsCards;

