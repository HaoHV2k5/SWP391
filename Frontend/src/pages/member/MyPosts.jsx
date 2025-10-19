import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Dropdown,
  Modal,
  Spinner,
  Alert,
  Form,
} from "react-bootstrap";
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    price: 0,
    productType: "VEHICLE",
  });

  // State for user's posts
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Function to load posts from productService
  const loadPosts = async () => {
    setLoadingPosts(true);
    try {
      // Xóa localStorage cũ nếu có
      localStorage.removeItem("recentPendingPost");

      // Lấy tin đăng từ backend
      const username =
        user?.username ||
        user?.user?.username ||
        user?.email ||
        user?.user?.email;
      console.log("📡 Loading posts for username:", username);

      const result = await productService.getMyPosts(username);
      console.log("📦 API result:", result);

      if (result.success) {
        const data = result.data || [];
        console.log("✅ Loaded posts from DB:", data.length, "posts");
        setPosts(data);
      } else {
        console.error("❌ Failed to load posts:", result.message);
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

  // Filter posts theo trạng thái
  useEffect(() => {
    let filtered = posts;

    if (filterStatus !== "ALL") {
      filtered = filtered.filter(
        (p) => (p.status || "").toUpperCase() === filterStatus
      );
    }

    setFilteredPosts(filtered);
  }, [posts, filterStatus]);

  useEffect(() => {
    console.log("=== MyPosts useEffect ===");

    // Xóa localStorage mock data ngay khi load trang
    localStorage.removeItem("recentPendingPost");

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

    if (userRole !== "member") {
      console.log("❌ User role is not member:", userRole);
      navigate("/");
      return;
    }

    console.log("✅ My posts access granted");

    // Load posts when user is authenticated
    loadPosts();

    // Tự refresh khi cửa sổ lấy lại focus
    const onFocus = () => loadPosts();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user, navigate]);

  const getStatusColor = (status) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "PENDING":
        return "warning";
      case "STAFF_APPROVED":
        return "info";
      case "ADMIN_APPROVED":
      case "ACTIVE":
        return "success";
      case "REJECTED":
        return "danger";
      case "SOLD":
        return "secondary";
      case "INACTIVE":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "PENDING":
        return "Chờ duyệt";
      case "STAFF_APPROVED":
        return "Đã duyệt Staff";
      case "ADMIN_APPROVED":
        return "Đã duyệt Admin";
      case "ACTIVE":
        return "Đang hiển thị";
      case "REJECTED":
        return "Bị từ chối";
      case "SOLD":
        return "Đã bán";
      case "INACTIVE":
        return "Không hoạt động";
      default:
        return status || "Không rõ";
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
      const result = await productService.deleteProduct(selectedPost.id);
      if (result.success) {
        setPosts(posts.filter((post) => post.id !== selectedPost.id));
        toast.success("Xóa tin đăng thành công!");
        setShowDeleteModal(false);
        setSelectedPost(null);
      } else {
        toast.error(result.message || "Có lỗi xảy ra khi xóa tin đăng!");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Có lỗi xảy ra khi xóa tin đăng!");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setEditFormData({
      title: post.title || post.productName || "",
      description: post.description || "",
      price: post.price || post.vehicle?.price || post.battery?.price || 0,
      productType: post.productType || post.category || "VEHICLE",
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const confirmEdit = async () => {
    setLoading(true);
    try {
      const result = await productService.updateProduct(
        selectedPost.id,
        editFormData
      );
      if (result.success) {
        // Reload posts to get updated data
        await loadPosts();
        toast.success("Cập nhật tin đăng thành công!");
        setShowEditModal(false);
        setSelectedPost(null);
      } else {
        toast.error(result.message || "Có lỗi xảy ra khi cập nhật tin đăng!");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Có lỗi xảy ra khi cập nhật tin đăng!");
    } finally {
      setLoading(false);
    }
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
      <Container
        fluid
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
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
            <Card
              className="text-white border-0 h-100"
              style={{
                background: "linear-gradient(135deg, #ffc107 0%, #ffb300 100%)",
              }}
            >
              <Card.Body className="text-center p-3">
                <h4 className="fw-bold mb-1">
                  {
                    posts.filter(
                      (p) => (p.status || "").toUpperCase() === "PENDING"
                    ).length
                  }
                </h4>
                <small className="opacity-75">Tin chờ duyệt</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card
              className="text-white border-0 h-100"
              style={{
                background: "linear-gradient(135deg, #17a2b8 0%, #138496 100%)",
              }}
            >
              <Card.Body className="text-center p-3">
                <h4 className="fw-bold mb-1">
                  {
                    posts.filter(
                      (p) => (p.status || "").toUpperCase() === "STAFF_APPROVED"
                    ).length
                  }
                </h4>
                <small className="opacity-75">Đã duyệt Staff</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card
              className="text-white border-0 h-100"
              style={{
                background: "linear-gradient(135deg, #00A86B 0%, #2BB673 100%)",
              }}
            >
              <Card.Body className="text-center p-3">
                <h4 className="fw-bold mb-1">
                  {
                    posts.filter(
                      (p) =>
                        (p.status || "").toUpperCase() === "ADMIN_APPROVED" ||
                        (p.status || "").toUpperCase() === "ACTIVE"
                    ).length
                  }
                </h4>
                <small className="opacity-75">Đã duyệt/Hiển thị</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card
              className="text-white border-0 h-100"
              style={{
                background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
              }}
            >
              <Card.Body className="text-center p-3">
                <h4 className="fw-bold mb-1">
                  {
                    posts.filter(
                      (p) => (p.status || "").toUpperCase() === "REJECTED"
                    ).length
                  }
                </h4>
                <small className="opacity-75">Bị từ chối</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Action Bar với Filter */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="h5 mb-0 text-dark">
              Tin đăng của tôi ({filteredPosts.length}/{posts.length})
            </h3>
            <Button
              variant="success"
              onClick={() => navigate("/post-ad")}
              className="px-4"
            >
              Đăng tin mới
            </Button>
          </div>

          {/* Filter theo trạng thái */}
          <div>
            <Form.Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              size="sm"
              style={{ maxWidth: "250px" }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="STAFF_APPROVED">Đã duyệt Staff</option>
              <option value="ACTIVE">Đang hiển thị</option>
              <option value="REJECTED">Bị từ chối</option>
            </Form.Select>
          </div>
        </div>

        {/* Posts List */}
        {loadingPosts ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" className="mb-3" />
            <p className="text-muted">Đang tải danh sách tin đăng...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <Alert variant="info" className="text-center py-5">
            {posts.length === 0 ? (
              <>
                <h5>Bạn chưa có tin đăng nào</h5>
                <p className="mb-3">
                  Hãy đăng tin đầu tiên để bắt đầu bán hàng!
                </p>
                <Button variant="success" onClick={() => navigate("/post-ad")}>
                  Đăng tin ngay
                </Button>
              </>
            ) : (
              <p className="mb-0">
                Không tìm thấy tin đăng phù hợp với bộ lọc.
              </p>
            )}
          </Alert>
        ) : (
          <Row className="g-4">
            {filteredPosts.map((post) => (
              <Col lg={6} key={post.id}>
                <Card className="h-100 shadow-sm border-0">
                  <Row className="g-0 h-100">
                    <Col md={4}>
                      <div
                        className="h-100 bg-light d-flex align-items-center justify-content-center"
                        style={{
                          backgroundImage: `url(${
                            post.image ||
                            post.vehicle?.image ||
                            post.battery?.image ||
                            post.images?.[0]
                          })`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          minHeight: "200px",
                        }}
                      >
                        {!(
                          post.image ||
                          post.vehicle?.image ||
                          post.battery?.image ||
                          post.images?.[0]
                        ) && <span className="text-muted">📷</span>}
                      </div>
                    </Col>
                    <Col md={8}>
                      <Card.Body className="p-3 d-flex flex-column h-100">
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <Badge
                              bg={getStatusColor(post.status)}
                              className="mb-2"
                            >
                              {getStatusText(post.status)}
                            </Badge>
                            <Dropdown align="end">
                              <Dropdown.Toggle
                                variant="link"
                                className="text-muted p-0 border-0"
                                style={{ fontSize: "20px" }}
                              >
                                ⋮
                              </Dropdown.Toggle>
                              <Dropdown.Menu style={{ minWidth: "150px" }}>
                                <Dropdown.Item
                                  onClick={() => handleEditPost(post)}
                                >
                                  Chỉnh sửa
                                </Dropdown.Item>
                                {(post.status === "expired" ||
                                  post.status === "sold") && (
                                  <Dropdown.Item
                                    onClick={() => handleRepost(post.id)}
                                  >
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

                          <h6 className="card-title text-truncate mb-2">
                            {post.title ||
                              post.productName ||
                              "Không có tiêu đề"}
                          </h6>
                          <p className="text-success fw-bold mb-2">
                            {formatCurrency(
                              post.price ||
                                post.vehicle?.price ||
                                post.battery?.price ||
                                0
                            )}
                          </p>
                          <p className="text-muted small mb-2">
                            {post.location ||
                              post.address ||
                              "Không có địa chỉ"}{" "}
                            •{" "}
                            {post.category ||
                              post.productType ||
                              "Không phân loại"}
                          </p>

                          <div className="d-flex justify-content-between text-muted small">
                            <span>{post.views || 0} lượt xem</span>
                            <span>{post.likes || 0} lượt thích</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-top">
                          <div className="d-flex justify-content-between text-muted small">
                            <span>
                              Đăng:{" "}
                              {formatDate(
                                post.createdDate ||
                                  post.createdAt ||
                                  post.dateCreated
                              )}
                            </span>
                            <span>
                              Hết hạn:{" "}
                              {formatDate(
                                post.expiryDate ||
                                  post.expiredAt ||
                                  post.dateExpired
                              )}
                            </span>
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
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa tin đăng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa tin đăng này không?</p>
          {selectedPost && (
            <div className="bg-light p-3 rounded">
              <strong>
                {selectedPost.title ||
                  selectedPost.productName ||
                  "Không có tiêu đề"}
              </strong>
              <br />
              <span className="text-success">
                {formatCurrency(
                  selectedPost.price ||
                    selectedPost.vehicle?.price ||
                    selectedPost.battery?.price ||
                    0
                )}
              </span>
            </div>
          )}
          <Alert variant="warning" className="mt-3 mb-0">
            <small>Hành động này không thể hoàn tác!</small>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="light"
            onClick={() => setShowDeleteModal(false)}
            style={{
              backgroundColor: "white",
              border: "1px solid black",
              color: "black",
            }}
          >
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={loading}>
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

      {/* Edit Product Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa tin đăng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPost && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>
                  Tiêu đề <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={editFormData.title}
                  onChange={(e) =>
                    handleEditFormChange("title", e.target.value)
                  }
                  placeholder="Nhập tiêu đề sản phẩm"
                  maxLength={255}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={editFormData.description}
                  onChange={(e) =>
                    handleEditFormChange("description", e.target.value)
                  }
                  placeholder="Nhập mô tả chi tiết sản phẩm"
                  maxLength={1000}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Giá (VNĐ) <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={editFormData.price}
                      onChange={(e) =>
                        handleEditFormChange(
                          "price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="Nhập giá sản phẩm"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Loại sản phẩm <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      value={editFormData.productType}
                      onChange={(e) =>
                        handleEditFormChange("productType", e.target.value)
                      }
                    >
                      <option value="VEHICLE">Xe điện</option>
                      <option value="BATTERY">Pin/Ắc quy</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Alert variant="info" className="mb-0">
                <small>
                  <strong>Lưu ý:</strong> Chỉ có thể chỉnh sửa thông tin cơ bản.
                  Để thay đổi hình ảnh, vui lòng tạo tin đăng mới.
                </small>
              </Alert>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="light"
            onClick={() => setShowEditModal(false)}
            disabled={loading}
            style={{
              backgroundColor: "white",
              border: "1px solid black",
              color: "black",
            }}
          >
            Hủy
          </Button>
          <Button
            variant="success"
            onClick={confirmEdit}
            disabled={loading || !editFormData.title || editFormData.price <= 0}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyPosts;
