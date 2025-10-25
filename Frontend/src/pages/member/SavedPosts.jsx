import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import MemberHeader from "../../components/member/MemberHeader";
import wishlistService from "../../services/wishlistService";
import "../../styles/member/index.css";

const SavedPosts = ({ user }) => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState({
    savedProducts: [],
    loading: false,
    initialized: false
  });

  // Subscribe to wishlistService state changes
  useEffect(() => {
    const initialState = wishlistService.getCurrentState();
    setState(initialState);

    const unsubscribe = wishlistService.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);
  
  // Normalize wishlist data
  const normalizedProducts = state.savedProducts.map(product => {
    const id = product.id || product.productId || product._id;
    const title = product.title || product.name || "";
    const price = product.price || "Liên hệ";
    const image = product.imageUrls?.[0] || product.image || "";
    const seller = product.seller?.username || product.seller?.fullName || product.sellerName || "Không rõ người bán";
    const savedDate = product.savedDate || product.savedAt || new Date().toISOString();
    const sellerAddress = product.location || product.address || product.SellerInfo?.sellerAddress || "";
    const brand = product.brand || "";
    const productType = product.productType || "";
    
    return {
      id,
      title,
      price,
      image,
      seller,
      savedDate,
      SellerInfo: { sellerAddress },
      brand,
      productType,
      ...product
    };
  });

  // Filter available products
  const availableProducts = normalizedProducts.filter(product => {
    return product.id && product.title && product.title.trim() !== "";
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    setIsCheckingAuth(false);
    const userRole = user.user?.role || user.role;
    if (userRole && userRole !== "member") {
      navigate("/");
      return;
    }
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

  const handleRemoveFromSaved = async (postId, e) => {
    e.stopPropagation(); // Prevent card click
    setLoading(true);
    try {
      await wishlistService.remove(postId);
      toast.success("Đã bỏ lưu tin đăng!");
    } catch (error) {
      console.error("Error removing from saved:", error);
      toast.error("Có lỗi xảy ra khi bỏ lưu tin đăng!");
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

  // Xử lý click vào sản phẩm để chuyển đến trang chi tiết
  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
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
              <Col lg={4} md={4}>
                <Card className="h-100" style={{ 
                  border: "2px solid #28a745", 
                  backgroundColor: "white",
                  color: "black"
                }}>
                  <Card.Body className="text-center p-3">
                    <h4 className="fw-bold mb-1" style={{ color: "black" }}>{state.savedProducts.length}</h4>
                    <small style={{ color: "black" }}>Tổng tin đã lưu</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4} md={4}>
                <Card className="h-100" style={{ 
                  border: "2px solid #28a745", 
                  backgroundColor: "white",
                  color: "black"
                }}>
                  <Card.Body className="text-center p-3">
                    <h4 className="fw-bold mb-1" style={{ color: "black" }}>{availableProducts.length}</h4>
                    <small style={{ color: "black" }}>Tin còn khả dụng</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4} md={4}>
                <Card className="h-100" style={{ 
                  border: "2px solid #28a745", 
                  backgroundColor: "white",
                  color: "black"
                }}>
                  <Card.Body className="text-center p-3">
                    <h4 className="fw-bold mb-1" style={{ color: "black" }}>{state.savedProducts.length - availableProducts.length}</h4>
                    <small style={{ color: "black" }}>Tin hết hạn</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Page Title */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="h5 mb-0 text-dark">Tin đã lưu ({availableProducts.length} tin khả dụng)</h3>
              <Button 
                variant="outline-success" 
                onClick={() => navigate("/")}
                className="px-4"
              >
                Tìm tin mới
              </Button>
            </div>

            {/* Saved Posts List */}
            <div>
              
              {availableProducts.length === 0 ? (
                <Alert variant="info" className="text-center py-5">
                  <h5>Bạn chưa lưu tin đăng nào</h5>
                  <p className="mb-3">Hãy lưu những tin đăng yêu thích để xem lại sau!</p>
                  <Button variant="success" onClick={() => navigate("/")}>
                    Khám phá tin đăng
                  </Button>
                </Alert>
              ) : (
                <Row className="g-4">
                  {availableProducts.map((post) => (
                    <Col lg={6} key={post.id}>
                    <Card 
                      className="h-100 shadow-sm border-0" 
                      style={{ cursor: "pointer" }}
                      onClick={() => handleProductClick(post)}
                    >
                      <Row className="g-0 h-100">
                        <Col md={4}>
                          <div 
                            className="h-100 bg-light d-flex align-items-center justify-content-center position-relative"
                            style={{ 
                              backgroundImage: `url(${post.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=="})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              minHeight: "200px"
                            }}
                          >
                            {!post.image && <span className="text-muted">📷</span>}
                          </div>
                        </Col>
                        <Col md={8}>
                          <Card.Body className="p-3 d-flex flex-column h-100">
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <Badge bg="success" className="mb-2">
                                  Còn hàng
                                </Badge>
                                <Button
                                  variant="link"
                                  className="text-danger p-0 border-0"
                                  onClick={(e) => handleRemoveFromSaved(post.id, e)}
                                  disabled={loading}
                                  title="Bỏ lưu"
                                >
                                  ×
                                </Button>
                              </div>
                              
                              <h6 className="card-title text-truncate mb-2">{post.title || "Không có tiêu đề"}</h6>
                              <p className="text-success fw-bold mb-2">{post.price || "Liên hệ"}</p>
                              <p className="text-muted small mb-2">
                                {post.seller || "Không rõ người bán"}
                              </p>
                              <p className="text-muted small mb-2">
                                {post.SellerInfo?.sellerAddress || post.brand || "Không có địa chỉ"} • {post.productType || post.brand || "Không phân loại"}
                              </p>
                              <p className="text-muted small">
                                Lưu ngày: {formatDate(post.savedDate)}
                              </p>
                            </div>
                            
                          </Card.Body>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                  ))}
                </Row>
              )}
            </div>

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
