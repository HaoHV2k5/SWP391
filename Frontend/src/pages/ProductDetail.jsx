import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Card, Spinner, Alert, Badge } from "react-bootstrap";
import productService from "../services/productService";

const ProductDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      const res = await productService.getProductById(id);
      if (!mounted) return;
      if (res.success) setData(res.data);
      else setError(res.message || "Không thể tải chi tiết sản phẩm");
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="success" className="mb-3" />
        <div className="text-muted">Đang tải chi tiết sản phẩm…</div>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || "Không tìm thấy sản phẩm"}</Alert>
      </Container>
    );
  }

  const mainImage = Array.isArray(data.imageUrls) && data.imageUrls.length > 0 ? data.imageUrls[0] : "/logo.jpg";

  return (
    <Container className="py-4">
      <Row className="g-4">
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Img src={mainImage} alt={data.title} style={{ objectFit: "cover", maxHeight: 420 }} />
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h3 className="mb-2">{data.title}</h3>
              <div className="mb-2">
                <Badge bg="success">{data.productType}</Badge>
              </div>
              <div className="text-danger fw-bold mb-3">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(data.price || 0))}
              </div>
              <div className="text-muted mb-3">Người bán: {data.sellerName || "Ẩn danh"}</div>
              <p style={{ whiteSpace: 'pre-wrap' }}>{data.description}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;
