import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, Dropdown, Modal, Spinner, Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import MemberHeader from "../../components/member/MemberHeader";
import "../../styles/member/index.css";

const MyPosts = ({ user }) => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Mock data for user's posts
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "VinFast Klara S 2023 - Xe máy điện cao cấp",
      price: 18500000,
      category: "Xe máy điện",
      status: "active", // active, pending, expired, sold
      views: 245,
      likes: 12,
      createdDate: "2024-01-20",
      expiryDate: "2024-02-20",
      image: "/logo.jpg",
      location: "Quận 1, TP.HCM"
    },
    {
      id: 2,
      title: "Pin Lithium-ion 48V 20Ah chính hãng",
      price: 3200000,
      category: "Pin & Sạc",
      status: "pending",
      views: 89,
      likes: 5,
      createdDate: "2024-01-22",
      expiryDate: "2024-02-22",
      image: "https://bizweb.dktcdn.net/thumb/grande/100/433/676/products/pin-xe-may-dien-3-fe7c9482-c1df-4f57-8ac2-e0f227fca542.jpg",
      location: "Quận 7, TP.HCM"
    },
    {
      id: 3,
      title: "Xe đạp điện Giant 2022 - Như mới",
      price: 8500000,
      category: "Xe đạp điện",
      status: "sold",
      views: 156,
      likes: 8,
      createdDate: "2024-01-15",
      expiryDate: "2024-02-15",
      image: "https://cdn.shopify.com/s/files/1/0258/8303/7527/products/giant-explore-e-plus-1-pro-gts-electric-bike-2022-metallic-black-EV408748_9000_1_600x600.jpg",
      location: "Quận 3, TP.HCM"
    },
    {
      id: 4,
      title: "Sạc nhanh 60V 5A cho xe điện",
      price: 850000,
      category: "Pin & Sạc",
      status: "expired",
      views: 67,
      likes: 3,
      createdDate: "2024-01-10",
      expiryDate: "2024-02-10",
      image: "https://bizweb.dktcdn.net/thumb/grande/100/433/676/products/sac-nhanh-xe-may-dien.jpg",
      location: "Quận 10, TP.HCM"
    }
  ]);

  useEffect(() => {
    console.log("=== MyPosts useEffect ===");
    
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

    console.log("✅ My posts access granted");
  }, [user, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "sold":
        return "info";
      case "expired":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Đang hiển thị";
      case "pending":
        return "Chờ duyệt";
      case "sold":
        return "Đã bán";
      case "expired":
        return "Hết hạn";
      default:
        return status;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const handleDeletePost = (post) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPosts(posts.filter(post => post.id !== selectedPost.id));
      toast.success("Xóa tin đăng thành công!");
      setShowDeleteModal(false);
      setSelectedPost(null);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa tin đăng!");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = (postId) => {
    toast.info("Chức năng chỉnh sửa tin đăng đang được phát triển!");
  };

  const handleRepost = async (postId) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, status: "pending", createdDate: new Date().toISOString().split('T')[0] }
          : post
      ));
      toast.success("Đăng lại tin thành công! Tin đăng đang chờ duyệt.");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đăng lại tin!");
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
            <MemberHeader activeTab="my-posts" />

            {/* Stats Cards */}
            <Row className="g-4 mb-4">
              <Col lg={3} md={6}>
                <Card className="text-white border-0 h-100" style={{ background: "linear-gradient(135deg, #00A86B 0%, #2BB673 100%)" }}>
                  <Card.Body className="text-center p-3">
                    <h4 className="fw-bold mb-1">{posts.filter(p => p.status === 'active').length}</h4>
                    <small className="opacity-75">Tin đang hiển thị</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6}>
                <Card className="text-white border-0 h-100" style={{ background: "linear-gradient(135deg, #ffc107 0%, #ffb300 100%)" }}>
                  <Card.Body className="text-center p-3">
                    <h4 className="fw-bold mb-1">{posts.filter(p => p.status === 'pending').length}</h4>
                    <small className="opacity-75">Tin chờ duyệt</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6}>
                <Card className="text-white border-0 h-100" style={{ background: "linear-gradient(135deg, #17a2b8 0%, #138496 100%)" }}>
                  <Card.Body className="text-center p-3">
                    <h4 className="fw-bold mb-1">{posts.filter(p => p.status === 'sold').length}</h4>
                    <small className="opacity-75">Tin đã bán</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6}>
                <Card className="text-white border-0 h-100" style={{ background: "linear-gradient(135deg, #6c757d 0%, #5a6268 100%)" }}>
                  <Card.Body className="text-center p-3">
                    <h4 className="fw-bold mb-1">{posts.reduce((sum, p) => sum + p.views, 0)}</h4>
                    <small className="opacity-75">Tổng lượt xem</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Action Bar */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="h5 mb-0 text-dark">Tin đăng của tôi ({posts.length})</h3>
              <Button 
                variant="success" 
                onClick={() => navigate("/member/post-ad")}
                className="px-4"
              >
                Đăng tin mới
              </Button>
            </div>

            {/* Posts List */}
            {posts.length === 0 ? (
              <Alert variant="info" className="text-center py-5">
                <h5>Bạn chưa có tin đăng nào</h5>
                <p className="mb-3">Hãy đăng tin đầu tiên để bắt đầu bán hàng!</p>
                <Button variant="success" onClick={() => navigate("/member/post-ad")}>
                  Đăng tin ngay
                </Button>
              </Alert>
            ) : (
              <Row className="g-4">
                {posts.map((post) => (
                  <Col lg={6} key={post.id}>
                    <Card className="h-100 shadow-sm border-0">
                      <Row className="g-0 h-100">
                        <Col md={4}>
                          <div 
                            className="h-100 bg-light d-flex align-items-center justify-content-center"
                            style={{ 
                              backgroundImage: `url(${post.image})`,
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
                                <Badge bg={getStatusColor(post.status)} className="mb-2">
                                  {getStatusText(post.status)}
                                </Badge>
                                <Dropdown>
                                  <Dropdown.Toggle variant="link" className="text-muted p-0 border-0">
                                    ⋮
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => handleEditPost(post.id)}>
                                      Chỉnh sửa
                                    </Dropdown.Item>
                                    {(post.status === 'expired' || post.status === 'sold') && (
                                      <Dropdown.Item onClick={() => handleRepost(post.id)}>
                                        Đăng lại
                                      </Dropdown.Item>
                                    )}
                                    <Dropdown.Divider />
                                    <Dropdown.Item 
                                      className="text-danger"
                                      onClick={() => handleDeletePost(post)}
                                    >
                                      Xóa tin
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                              </div>
                              
                              <h6 className="card-title text-truncate mb-2">{post.title}</h6>
                              <p className="text-success fw-bold mb-2">{formatCurrency(post.price)}</p>
                              <p className="text-muted small mb-2">
                                {post.location} • {post.category}
                              </p>
                              
                              <div className="d-flex justify-content-between text-muted small">
                                <span>{post.views} lượt xem</span>
                                <span>{post.likes} lượt thích</span>
                              </div>
                            </div>
                            
                            <div className="mt-3 pt-2 border-top">
                              <div className="d-flex justify-content-between text-muted small">
                                <span>Đăng: {formatDate(post.createdDate)}</span>
                                <span>Hết hạn: {formatDate(post.expiryDate)}</span>
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
          </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa tin đăng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa tin đăng này không?</p>
          {selectedPost && (
            <div className="bg-light p-3 rounded">
              <strong>{selectedPost.title}</strong>
              <br />
              <span className="text-success">{formatCurrency(selectedPost.price)}</span>
            </div>
          )}
          <Alert variant="warning" className="mt-3 mb-0">
            <small>Hành động này không thể hoàn tác!</small>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDelete}
            disabled={loading}
          >
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
    </Container>
  );
};

export default MyPosts;
