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
import "bootstrap-icons/font/bootstrap-icons.css";
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

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const loadPosts = async () => {
    setLoadingPosts(true);
    try {
      localStorage.removeItem("recentPendingPost");
      const username = user?.username || user?.user?.username || user?.email || user?.user?.email;
      const result = await productService.getMyPosts(username);
      if (result.success) {
        console.log("📸 MyPosts data:", result.data); // Debug để xem dữ liệu hình ảnh
        setPosts(result.data || []);
      } else {
        toast.error(result.message);
        setPosts([]);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải danh sách tin đăng");
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    let filtered = posts;
    if (filterStatus !== "ALL") {
      filtered = filtered.filter((p) => (p.status || "").toUpperCase() === filterStatus);
    }
    setFilteredPosts(filtered);
  }, [posts, filterStatus]);

  useEffect(() => {
    localStorage.removeItem("recentPendingPost");
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
    loadPosts();
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
    if (!amount || amount === 0) return "0 ₫";
    
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return "0 ₫";
    
    // Format với dấu phẩy và đơn vị ₫
    return new Intl.NumberFormat("vi-VN").format(numAmount) + " ₫";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "";
      }
      return date.toLocaleDateString("vi-VN");
    } catch (error) {
      return "";
    }
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
      const result = await productService.updateProduct(selectedPost.id, editFormData);
      if (result.success) {
        await loadPosts();
        toast.success("Cập nhật tin đăng thành công!");
        setShowEditModal(false);
        setSelectedPost(null);
      } else {
        toast.error(result.message || "Có lỗi xảy ra khi cập nhật tin đăng!");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật tin đăng!");
    } finally {
      setLoading(false);
    }
  };

  const handleRepost = async (postId) => {
    setLoading(true);
    try {
      await loadPosts();
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
              className="text-dark h-100"
              style={{
                backgroundColor: "white",
                border: "2px solid #28a745",
              }}
            >
              <Card.Body className="text-center p-3">
                <h4 className="fw-bold mb-1 text-dark">
                  {
                    posts.filter(
                      (p) => (p.status || "").toUpperCase() === "PENDING"
                    ).length
                  }
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
                  {
                    posts.filter(
                      (p) => (p.status || "").toUpperCase() === "STAFF_APPROVED"
                    ).length
                  }
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
                  {
                    posts.filter(
                      (p) =>
                        (p.status || "").toUpperCase() === "ADMIN_APPROVED" ||
                        (p.status || "").toUpperCase() === "ACTIVE"
                    ).length
                  }
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
                  {
                    posts.filter(
                      (p) => (p.status || "").toUpperCase() === "REJECTED"
                    ).length
                  }
                </h4>
                <small className="text-dark">Bị từ chối</small>
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "25px",
              padding: "20px 0",
            }}
          >
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                style={{
                  height: "100%",
                  cursor: "pointer",
                }}
              >
                <Card.Img
                  variant="top"
                  src={
                    post.imageUrls?.[0] ||
                    post.image ||
                    post.vehicle?.image ||
                    post.battery?.image ||
                    post.images?.[0] ||
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=="
                  }
                  style={{ height: "200px", objectFit: "cover" }}
                  onError={(e) => {
                    e.currentTarget.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
                  }}
                />

                <Card.Body
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    {/* Status Badge and Menu */}
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

                    {/* Title */}
                    <Card.Title
                      style={{
                        fontSize: "16px",
                        marginBottom: "4px",
                        fontWeight: "500",
                        lineHeight: "1.4",
                        color: "#333",
                      }}
                    >
                      {post.title ||
                        post.productName ||
                        "Không có tiêu đề"}
                    </Card.Title>

                    {/* Description */}
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#666",
                        marginBottom: "8px",
                        lineHeight: "1.3",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {post.description ||
                        post.vehicleInfo?.description ||
                        "Không có mô tả"}
                    </div>

                    {/* Vehicle Info */}
                    <div
                      style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}
                    >
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span>{post.year}</span>
                        <span>{post.brand}</span>
                        <span>{post.category || post.productType || ""}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#e74c3c",
                        marginBottom: "10px",
                      }}
                    >
                      {formatCurrency(
                        post.price ||
                          post.vehicle?.price ||
                          post.battery?.price ||
                          0
                      )}
                    </div>

                    {/* Location */}
                    <div style={{ fontSize: "12px", color: "#999", marginBottom: "10px" }}>
                      <i className="bi bi-geo-alt"></i> {post.location || post.address || post.sellerAddress || "Chưa có địa chỉ"}
                    </div>

                    {/* Stats */}
                    <div className="d-flex justify-content-between text-muted small mb-2">
                      <span>{post.views || 0} lượt xem</span>
                      <span>{post.likes || 0} lượt thích</span>
                    </div>
                  </div>

                  {/* Date Info */}
                  <div className="mt-3 pt-2 border-top">
                    <div className="d-flex justify-content-between text-muted small">
                      <span>
                        {formatDate(
                          post.createdDate ||
                            post.createdAt ||
                            post.dateCreated
                        ) && `Đăng: ${formatDate(
                          post.createdDate ||
                            post.createdAt ||
                            post.dateCreated
                        )}`}
                      </span>
                      <span>
                        {formatDate(
                          post.expiryDate ||
                            post.expiredAt ||
                            post.dateExpired
                        ) && `Hết hạn: ${formatDate(
                          post.expiryDate ||
                            post.expiredAt ||
                            post.dateExpired
                        )}`}
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
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
