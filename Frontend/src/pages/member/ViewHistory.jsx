import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import MemberHeader from "../../components/member/MemberHeader";
import "../../styles/member/index.css";

const ViewHistory = ({ user }) => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);

  // Mock data for view history
  const [viewHistory, setViewHistory] = useState([
    {
      id: 1,
      title: "VinFast Klara S 2023 - Xe máy điện cao cấp",
      price: 18500000,
      category: "Xe máy điện",
      seller: "Nguyễn Văn A",
      location: "Quận 1, TP.HCM",
      viewDate: "2024-01-25 15:30",
      image: "/logo.jpg",
      isAvailable: true,
      viewCount: 3 // Số lần xem tin này
    },
    {
      id: 2,
      title: "Pin Lithium-ion 48V 20Ah chính hãng",
      price: 3200000,
      category: "Pin & Sạc",
      seller: "Trần Thị B",
      location: "Quận 7, TP.HCM",
      viewDate: "2024-01-24 14:15",
      image: "https://bizweb.dktcdn.net/thumb/grande/100/433/676/products/pin-xe-may-dien-3-fe7c9482-c1df-4f57-8ac2-e0f227fca542.jpg",
      isAvailable: true,
      viewCount: 1
    },
    {
      id: 3,
      title: "Yamaha E01 2023 - Xe máy điện cao cấp",
      price: 35000000,
      category: "Xe máy điện",
      seller: "Lê Văn C",
      location: "Quận 3, TP.HCM",
      viewDate: "2024-01-23 16:45",
      image: "https://vn.e-scooter.co/i/ya/ma/yamaha-e01/full/yamaha-e01-front-left-angle-view.webp",
      isAvailable: false, // Tin đã bán hoặc hết hạn
      viewCount: 2
    },
    {
      id: 4,
      title: "Tesla Model 3 2022 - Xe điện sang trọng",
      price: 980000000,
      category: "Ô tô điện",
      seller: "Phạm Thị D",
      location: "Quận 2, TP.HCM",
      viewDate: "2024-01-22 11:20",
      image: "https://mkt-vehicleimages-prd.autotradercdn.ca/photos/chrome/Expanded/White/2022TSC030022/2022TSC03002201.jpg",
      isAvailable: true,
      viewCount: 1
    },
    {
      id: 5,
      title: "Sạc nhanh 60V 5A cho xe điện",
      price: 850000,
      category: "Pin & Sạc",
      seller: "Hoàng Văn E",
      location: "Quận 10, TP.HCM",
      viewDate: "2024-01-21 09:30",
      image: "https://bizweb.dktcdn.net/thumb/grande/100/433/676/products/sac-nhanh-xe-may-dien.jpg",
      isAvailable: true,
      viewCount: 1
    },
    {
      id: 6,
      title: "BMW i3 2023 - Xe điện Đức",
      price: 1200000000,
      category: "Ô tô điện",
      seller: "Nguyễn Thị F",
      location: "Quận 1, TP.HCM",
      viewDate: "2024-01-20 18:45",
      image: "https://www.bmw.com/content/dam/bmw/common/all-models/i-series/i3/2022/highlights/bmw-i3-highlights-01.jpg",
      isAvailable: false,
      viewCount: 4
    }
  ]);

  useEffect(() => {
    console.log("=== ViewHistory useEffect ===");
    
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

    console.log("✅ View history access granted");
  }, [user, navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString("vi-VN");
  };

  const handleViewAgain = (post) => {
    if (!post.isAvailable) {
      toast.warning("Tin đăng này không còn khả dụng!");
      return;
    }
    toast.info(`Xem lại tin: ${post.title}`);
  };

  const handleContactSeller = (post) => {
    if (!post.isAvailable) {
      toast.warning("Tin đăng này không còn khả dụng!");
      return;
    }
    toast.info(`Liên hệ với ${post.seller} về tin: ${post.title}`);
  };

  const handleSavePost = async (post) => {
    if (!post.isAvailable) {
      toast.warning("Không thể lưu tin đăng không còn khả dụng!");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Đã lưu tin đăng vào danh sách yêu thích!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu tin đăng!");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromHistory = async (postId) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setViewHistory(viewHistory.filter(item => item.id !== postId));
      toast.success("Đã xóa khỏi lịch sử xem!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa lịch sử!");
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllHistory = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem tin?")) {
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setViewHistory([]);
      toast.success("Đã xóa toàn bộ lịch sử xem tin!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa lịch sử!");
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
            <MemberHeader activeTab="view-history" />

            {/* Stats Cards */}
            <Row className="g-4 mb-4">
              <Col lg={3} md={6}>
                <Card className="text-white border-0 h-100" style={{ background: "linear-gradient(135deg, #673ab7 0%, #512da8 100%)" }}>
                  <Card.Body className="text-center p-3">
                    <h4 className="fw-bold mb-1">{viewHistory.length}</h4>
                    <small className="opacity-75">Tin đã xem</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6}>
                <Card className="text-white border-0 h-100" style={{ background: "linear-gradient(135deg, #00A86B 0%, #2BB673 100%)" }}>
                  <Card.Body className="text-center p-3">
                    <h4 className="fw-bold mb-1">{viewHistory.filter(v => v.isAvailable).length}</h4>
                    <small className="opacity-75">Tin còn khả dụng</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6}>
                <Card className="text-white border-0 h-100" style={{ background: "linear-gradient(135deg, #ff5722 0%, #d84315 100%)" }}>
                  <Card.Body className="text-center p-3">
                    <h4 className="fw-bold mb-1">{viewHistory.reduce((sum, v) => sum + v.viewCount, 0)}</h4>
                    <small className="opacity-75">Tổng lượt xem</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6}>
                <Card className="text-white border-0 h-100" style={{ background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)" }}>
                  <Card.Body className="text-center p-3">
                    <h4 className="fw-bold mb-1">{new Set(viewHistory.map(v => v.category)).size}</h4>
                    <small className="opacity-75">Danh mục</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Action Bar */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="h5 mb-0 text-dark">Lịch sử xem tin ({viewHistory.length})</h3>
              <div className="d-flex gap-2">
              <Button 
                variant="outline-success" 
                onClick={() => navigate("/")}
                className="px-4"
              >
                Khám phá tin mới
              </Button>
                {viewHistory.length > 0 && (
                  <Button 
                    variant="outline-danger" 
                    onClick={handleClearAllHistory}
                    disabled={loading}
                    className="px-4"
                  >
                    Xóa tất cả
                  </Button>
                )}
              </div>
            </div>

            {/* View History List */}
            {viewHistory.length === 0 ? (
              <Alert variant="info" className="text-center py-5">
                <h5>Bạn chưa xem tin đăng nào</h5>
                <p className="mb-3">Hãy khám phá các tin đăng thú vị!</p>
                <Button variant="success" onClick={() => navigate("/")}>
                  Khám phá ngay
                </Button>
              </Alert>
            ) : (
              <Row className="g-4">
                {viewHistory.map((post) => (
                  <Col lg={6} key={post.id}>
                    <Card className={`h-100 shadow-sm border-0 ${!post.isAvailable ? 'opacity-75' : ''}`}>
                      <Row className="g-0 h-100">
                        <Col md={4}>
                          <div 
                            className="h-100 bg-light d-flex align-items-center justify-content-center position-relative"
                            style={{ 
                              backgroundImage: `url(${post.image})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              minHeight: "200px"
                            }}
                          >
                            {!post.image && <span className="text-muted">📷</span>}
                            {!post.isAvailable && (
                              <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center">
                                <Badge bg="secondary" className="px-3 py-2">
                                  Không khả dụng
                                </Badge>
                              </div>
                            )}
                            {post.viewCount > 1 && (
                              <Badge 
                                bg="primary" 
                                className="position-absolute top-0 start-0 m-2"
                              >
                                Xem {post.viewCount} lần
                              </Badge>
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
                                  className="text-muted p-0 border-0"
                                  onClick={() => handleRemoveFromHistory(post.id)}
                                  disabled={loading}
                                  title="Xóa khỏi lịch sử"
                                >
                                  ✕
                                </Button>
                              </div>
                              
                              <h6 className="card-title text-truncate mb-2">{post.title}</h6>
                              <p className="text-success fw-bold mb-2">{formatCurrency(post.price)}</p>
                              <p className="text-muted small mb-2">
                                {post.seller}
                              </p>
                              <p className="text-muted small mb-2">
                                {post.location} • {post.category}
                              </p>
                              <p className="text-muted small">
                                Xem lần cuối: {formatDateTime(post.viewDate)}
                              </p>
                            </div>
                            
                            <div className="mt-3 pt-2 border-top">
                              <div className="d-flex gap-2 mb-2">
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  className="flex-fill"
                                  onClick={() => handleViewAgain(post)}
                                  disabled={!post.isAvailable}
                                >
                                  Xem lại
                                </Button>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleSavePost(post)}
                                  disabled={!post.isAvailable || loading}
                                  title="Lưu tin"
                                >
                                  Lưu
                                </Button>
                              </div>
                              <Button
                                variant="success"
                                size="sm"
                                className="w-100"
                                onClick={() => handleContactSeller(post)}
                                disabled={!post.isAvailable}
                              >
                                Liên hệ người bán
                              </Button>
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
              <h6 className="text-success mb-2">Mẹo sử dụng lịch sử xem tin:</h6>
              <ul className="mb-0 small">
                <li>Theo dõi những tin đăng đã xem để so sánh giá và chất lượng</li>
                <li>Lưu những tin đăng thú vị để xem lại sau</li>
                <li>Liên hệ nhanh với người bán khi quyết định mua</li>
                <li>Xóa lịch sử cũ để giữ danh sách gọn gàng</li>
              </ul>
            </Alert>
          </div>
    </Container>
  );
};

export default ViewHistory;
