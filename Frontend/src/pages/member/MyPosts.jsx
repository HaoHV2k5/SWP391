import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, Dropdown, Modal, Spinner, Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import MemberHeader from "../../components/member/MemberHeader";
import productService from "../../services/productService";
import "../../styles/member/index.css";

const MyPosts = ({ user }) => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // State for user's posts
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Function to load posts from productService
  const loadPosts = async () => {
    setLoadingPosts(true);
    try {
      const result = await productService.getPublicList();
      if (result.success) {
        setPosts(result.data);
      } else {
        toast.error(result.message);
        setPosts([]);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Có lỗi xảy ra khi tải danh sách tin đăng");
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

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
    
    // Load posts when user is authenticated
    loadPosts();
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
      // Gọi API xóa post (cần implement endpoint này trong backend)
      // const result = await productService.deletePost(selectedPost.id);
      // if (result.success) {
        setPosts(posts.filter(post => post.id !== selectedPost.id));
        toast.success("Xóa tin đăng thành công!");
        setShowDeleteModal(false);
        setSelectedPost(null);
      // } else {
      //   toast.error(result.message);
      // }
    } catch (error) {
      console.error("Error deleting post:", error);
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
      // Gọi API repost (cần implement endpoint này trong backend)
      // const result = await productService.repostPost(postId);
      // if (result.success) {
        // Reload posts to get updated data
        await loadPosts();
        toast.success("Đăng lại tin thành công! Tin đăng đang chờ duyệt.");
      // } else {
      //   toast.error(result.message);
      // }
    } catch (error) {
      console.error("Error reposting:", error);
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
            {loadingPosts ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="success" className="mb-3" />
                <p className="text-muted">Đang tải danh sách tin đăng...</p>
              </div>
            ) : posts.length === 0 ? (
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
                              backgroundImage: `url(${post.image || post.vehicle?.image || post.battery?.image || post.images?.[0]})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              minHeight: "200px"
                            }}
                          >
                            {!(post.image || post.vehicle?.image || post.battery?.image || post.images?.[0]) && <span className="text-muted">📷</span>}
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
                              
                              <h6 className="card-title text-truncate mb-2">{post.title || post.productName || "Không có tiêu đề"}</h6>
                              <p className="text-success fw-bold mb-2">{formatCurrency(post.price || post.vehicle?.price || post.battery?.price || 0)}</p>
                              <p className="text-muted small mb-2">
                                {post.location || post.address || "Không có địa chỉ"} • {post.category || post.productType || "Không phân loại"}
                              </p>
                              
                              <div className="d-flex justify-content-between text-muted small">
                                <span>{post.views || 0} lượt xem</span>
                                <span>{post.likes || 0} lượt thích</span>
                              </div>
                            </div>
                            
                            <div className="mt-3 pt-2 border-top">
                              <div className="d-flex justify-content-between text-muted small">
                                <span>Đăng: {formatDate(post.createdDate || post.createdAt || post.dateCreated)}</span>
                                <span>Hết hạn: {formatDate(post.expiryDate || post.expiredAt || post.dateExpired)}</span>
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
              <strong>{selectedPost.title || selectedPost.productName || "Không có tiêu đề"}</strong>
              <br />
              <span className="text-success">{formatCurrency(selectedPost.price || selectedPost.vehicle?.price || selectedPost.battery?.price || 0)}</span>
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
