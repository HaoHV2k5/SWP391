import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import MemberHeader from "../../components/member/MemberHeader";
import productService from "../../services/productService";
import "../../styles/member/index.css";

const SavedPosts = ({ user }) => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);

  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const loadSavedPosts = async () => {
    setLoadingPosts(true);
    try {
      const result = await productService.getPublicList();
      if (result.success) {
        setSavedPosts(result.data);
      } else {
        toast.error(result.message);
        setSavedPosts([]);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải danh sách tin đã lưu");
      setSavedPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setIsCheckingAuth(true);
      const timer = setTimeout(() => {
        if (!user) navigate("/login");
      }, 1000);
      return () => clearTimeout(timer);
    }
    setIsCheckingAuth(false);
    const userRole = user.user?.role || user.role;
    if (userRole !== "member") {
      navigate("/");
      return;
    }
    loadSavedPosts();
  }, [user, navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const handleRemoveFromSaved = async (postId) => {
    setLoading(true);
    try {
      // Gọi API bỏ lưu post (cần implement endpoint này trong backend)
      // const result = await productService.toggleSavePost(postId);
      // if (result.success) {
        setSavedPosts(savedPosts.filter(post => post.id !== postId));
        toast.success("Đã bỏ lưu tin đăng!");
      // } else {
      //   toast.error(result.message);
      // }
    } catch (error) {
      console.error("Error removing from saved:", error);
      toast.error("Có lỗi xảy ra khi bỏ lưu tin đăng!");
    } finally {
      setLoading(false);
    }
  };

  const handleContactSeller = (post) => {
    if (!post.isAvailable) {
      toast.warning("Tin đăng này không còn khả dụng!");
      return;
    }
    toast.info(`Liên hệ với ${post.seller} về tin: ${post.title}`);
  };

  const handleViewPost = (post) => {
    if (!post.isAvailable) {
      toast.warning("Tin đăng này không còn khả dụng!");
      return;
    }
    toast.info("Chuyển đến trang chi tiết tin đăng...");
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
            <MemberHeader activeTab="saved-posts" />

            {/* Stats Card */}
            <Row className="g-4 mb-4">
              <Col lg={3} md={6}>
                <Card className="text-white border-0 h-100" style={{ background: "linear-gradient(135deg, #e91e63 0%, #c2185b 100%)" }}>
                  <Card.Body className="text-center p-3">
                    <h4 className="fw-bold mb-1">{savedPosts.length}</h4>
                    <small className="opacity-75">Tin đã lưu</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6}>
                <Card className="text-white border-0 h-100" style={{ background: "linear-gradient(135deg, #00A86B 0%, #2BB673 100%)" }}>
                  <Card.Body className="text-center p-3">
                    <h4 className="fw-bold mb-1">{savedPosts.filter(p => p.isAvailable).length}</h4>
                    <small className="opacity-75">Tin còn khả dụng</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6}>
                <Card className="text-white border-0 h-100" style={{ background: "linear-gradient(135deg, #6c757d 0%, #5a6268 100%)" }}>
                  <Card.Body className="text-center p-3">
                    <h4 className="fw-bold mb-1">{savedPosts.filter(p => !p.isAvailable).length}</h4>
                    <small className="opacity-75">Tin hết hạn</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6}>
                <Card className="text-white border-0 h-100" style={{ background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)" }}>
                  <Card.Body className="text-center p-3">
                    <h4 className="fw-bold mb-1">{new Set(savedPosts.map(p => p.category)).size}</h4>
                    <small className="opacity-75">Danh mục</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Page Title */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="h5 mb-0 text-dark">Tin đã lưu ({savedPosts.length})</h3>
              <Button 
                variant="outline-success" 
                onClick={() => navigate("/")}
                className="px-4"
              >
                Tìm tin mới
              </Button>
            </div>

            {/* Saved Posts List */}
            {loadingPosts ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="success" className="mb-3" />
                <p className="text-muted">Đang tải danh sách tin đã lưu...</p>
              </div>
            ) : savedPosts.length === 0 ? (
              <Alert variant="info" className="text-center py-5">
                <h5>Bạn chưa lưu tin đăng nào</h5>
                <p className="mb-3">Hãy lưu những tin đăng yêu thích để xem lại sau!</p>
                <Button variant="success" onClick={() => navigate("/")}>
                  Khám phá tin đăng
                </Button>
              </Alert>
            ) : (
              <Row className="g-4">
                {savedPosts.map((post) => (
                  <Col lg={6} key={post.id}>
                    <Card className={`h-100 shadow-sm border-0 ${!post.isAvailable ? 'opacity-75' : ''}`}>
                      <Row className="g-0 h-100">
                        <Col md={4}>
                          <div 
                            className="h-100 bg-light d-flex align-items-center justify-content-center position-relative"
                            style={{ 
                              backgroundImage: `url(${post.image || post.vehicle?.image || post.battery?.image || post.images?.[0]})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              minHeight: "200px"
                            }}
                          >
                            {!(post.image || post.vehicle?.image || post.battery?.image || post.images?.[0]) && <span className="text-muted">📷</span>}
                            {!post.isAvailable && (
                              <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center">
                                <Badge bg="secondary" className="px-3 py-2">
                                  Không khả dụng
                                </Badge>
                              </div>
                            )}
                          </div>
                        </Col>
                        <Col md={8}>
                          <Card.Body className="p-3 d-flex flex-column h-100">
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                {post.isAvailable ? (
                                  <Badge bg="success" className="mb-2">
                                    Còn hàng
                                  </Badge>
                                ) : (
                                  <Badge bg="secondary" className="mb-2">
                                    Hết hạn
                                  </Badge>
                                )}
                                <Button
                                  variant="link"
                                  className="text-danger p-0 border-0"
                                  onClick={() => handleRemoveFromSaved(post.id)}
                                  disabled={loading}
                                  title="Bỏ lưu"
                                >
                                  ×
                                </Button>
                              </div>
                              
                              <h6 className="card-title text-truncate mb-2">{post.title || post.productName || "Không có tiêu đề"}</h6>
                              <p className="text-success fw-bold mb-2">{formatCurrency(post.price || post.vehicle?.price || post.battery?.price || 0)}</p>
                              <p className="text-muted small mb-2">
                                {post.seller || post.sellerName || post.user?.fullName || "Không rõ người bán"}
                              </p>
                              <p className="text-muted small mb-2">
                                {post.location || post.address || "Không có địa chỉ"} • {post.category || post.productType || "Không phân loại"}
                              </p>
                              <p className="text-muted small">
                                Lưu ngày: {formatDate(post.savedDate || post.savedAt || post.dateSaved)}
                              </p>
                            </div>
                            
                            <div className="mt-3 pt-2 border-top">
                              <div className="d-flex gap-2">
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  className="flex-fill"
                                  onClick={() => handleViewPost(post)}
                                  disabled={!post.isAvailable}
                                >
                                  Xem tin
                                </Button>
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="flex-fill"
                                  onClick={() => handleContactSeller(post)}
                                  disabled={!post.isAvailable}
                                >
                                  Liên hệ
                                </Button>
                              </div>
                            </div>
                          </Card.Body>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            {/* Tips */}
            <Alert variant="light" className="mt-4 border-success">
              <h6 className="text-success mb-2">Mẹo sử dụng:</h6>
              <ul className="mb-0 small">
                <li>Lưu những tin đăng yêu thích để theo dõi thường xuyên</li>
                <li>Kiểm tra tình trạng tin đăng định kỳ để không bỏ lỡ cơ hội</li>
                <li>Liên hệ người bán sớm để có cơ hội mua được sản phẩm tốt</li>
                <li>So sánh giá giữa các tin đăng tương tự trước khi quyết định</li>
              </ul>
            </Alert>
          </div>
    </Container>
  );
};

export default SavedPosts;
