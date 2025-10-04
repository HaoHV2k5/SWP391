import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import MemberHeader from "../../components/member/MemberHeader";
import "../../styles/member/index.css";

const PostAd = ({ user }) => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    condition: "",
    description: "",
    location: "",
    phone: "",
    images: []
  });

  const categories = [
    { value: "xe-may-dien", label: "Xe máy điện" },
    { value: "xe-dap-dien", label: "Xe đạp điện" },
    { value: "phu-kien", label: "Phụ kiện xe điện" },
    { value: "pin-sac", label: "Pin & Sạc" },
    { value: "khac", label: "Khác" }
  ];

  const conditions = [
    { value: "new", label: "Mới 100%" },
    { value: "like-new", label: "Như mới" },
    { value: "good", label: "Tốt" },
    { value: "fair", label: "Khá" },
    { value: "poor", label: "Cần sửa chữa" }
  ];

  useEffect(() => {
    console.log("=== PostAd useEffect ===");
    
    if (!user) {
      console.log("⏳ No user yet, waiting...");
      setIsCheckingAuth(true);
      const timer = setTimeout(() => {
        if (!user) {
          console.log("❌ Still no user after timeout, redirecting to login");
          navigate("/login");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    setIsCheckingAuth(false);

    // Kiểm tra role
    let userRole = null;
    if (user.user && user.user.role) {
      userRole = user.user.role;
    } else if (user.role) {
      userRole = user.role;
    }

    if (userRole !== "member" && userRole !== "admin") {
      console.log("❌ User role is not member or admin:", userRole);
      navigate("/");
      return;
    }

    console.log("✅ Post ad access granted");
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error("Chỉ được tải lên tối đa 5 ảnh!");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      images: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.price || !formData.description) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Đăng tin thành công! Tin của bạn đang chờ duyệt.");
      navigate("/member/my-posts");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đăng tin. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    switch (tabId) {
      case "dashboard":
        navigate("/account");
        break;
      case "my-posts":
        navigate("/member/my-posts");
        break;
      case "saved-posts":
        navigate("/member/saved-posts");
        break;
      case "search-history":
        navigate("/member/search-history");
        break;
      case "view-history":
        navigate("/member/view-history");
        break;
      case "orders":
        navigate("/member/orders");
        break;
      case "profile":
        navigate("/member/profile");
        break;
      default:
        navigate("/account");
    }
  };

  if (isCheckingAuth) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <Spinner animation="border" variant="success" className="mb-3" />
          <p className="text-muted">Đang kiểm tra quyền truy cập...</p>
        </div>
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Container fluid className="p-0 bg-light" style={{ minHeight: "100vh" }}>
      <div className="p-4">
            {/* Header */}
            <MemberHeader activeTab="post-ad" />

            {/* Post Ad Form */}
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-success text-white">
                <h4 className="mb-0">Đăng tin bán hàng</h4>
              </Card.Header>
              <Card.Body className="p-4">
                <Alert variant="info" className="mb-4">
                  <strong>Lưu ý:</strong> Vui lòng điền đầy đủ thông tin để tin đăng của bạn được duyệt nhanh chóng.
                </Alert>

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={8}>
                      {/* Title */}
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Tiêu đề tin đăng <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="VD: Xe máy điện VinFast Klara S 2023 mới 99%"
                          maxLength={100}
                          required
                        />
                        <Form.Text className="text-muted">
                          {formData.title.length}/100 ký tự
                        </Form.Text>
                      </Form.Group>

                      {/* Category & Price */}
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Danh mục <span className="text-danger">*</span></Form.Label>
                            <Form.Select
                              name="category"
                              value={formData.category}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Chọn danh mục</option>
                              {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Giá bán <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="number"
                              name="price"
                              value={formData.price}
                              onChange={handleInputChange}
                              placeholder="VD: 15000000"
                              min="0"
                              required
                            />
                            <Form.Text className="text-muted">
                              Đơn vị: VNĐ
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>

                      {/* Condition & Location */}
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Tình trạng</Form.Label>
                            <Form.Select
                              name="condition"
                              value={formData.condition}
                              onChange={handleInputChange}
                            >
                              <option value="">Chọn tình trạng</option>
                              {conditions.map(cond => (
                                <option key={cond.value} value={cond.value}>{cond.label}</option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Địa điểm</Form.Label>
                            <Form.Control
                              type="text"
                              name="location"
                              value={formData.location}
                              onChange={handleInputChange}
                              placeholder="VD: Quận 1, TP.HCM"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      {/* Description */}
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Mô tả chi tiết <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Mô tả chi tiết về sản phẩm: tình trạng, lý do bán, thông số kỹ thuật..."
                          maxLength={2000}
                          required
                        />
                        <Form.Text className="text-muted">
                          {formData.description.length}/2000 ký tự
                        </Form.Text>
                      </Form.Group>

                      {/* Phone */}
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Số điện thoại liên hệ</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="VD: 0901234567"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      {/* Images */}
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Hình ảnh sản phẩm</Form.Label>
                        <Form.Control
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        <Form.Text className="text-muted">
                          Tối đa 5 ảnh, mỗi ảnh không quá 5MB
                        </Form.Text>
                      </Form.Group>

                      {formData.images.length > 0 && (
                        <div className="mb-3">
                          <small className="text-muted">Đã chọn {formData.images.length} ảnh</small>
                          <div className="mt-2">
                            {Array.from(formData.images).map((file, index) => (
                              <div key={index} className="small text-truncate">
                                📷 {file.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Preview Card */}
                      <Card className="border-success">
                        <Card.Header className="bg-light">
                          <small className="text-muted">Xem trước tin đăng</small>
                        </Card.Header>
                        <Card.Body className="p-3">
                          <h6 className="text-truncate">{formData.title || "Tiêu đề tin đăng"}</h6>
                          <p className="text-success fw-bold mb-1">
                            {formData.price ? `${parseInt(formData.price).toLocaleString('vi-VN')} ₫` : "0 ₫"}
                          </p>
                          <small className="text-muted">
                            📍 {formData.location || "Chưa có địa điểm"}
                          </small>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* Submit Buttons */}
                  <div className="d-flex gap-3 mt-4">
                    <Button
                      type="submit"
                      variant="success"
                      size="lg"
                      disabled={loading}
                      className="px-4"
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Đang đăng tin...
                        </>
                      ) : (
                        "Đăng tin ngay"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      size="lg"
                      onClick={() => navigate("/account")}
                      className="px-4"
                    >
                      Hủy
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>
    </Container>
  );
};

export default PostAd;
