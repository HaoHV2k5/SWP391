import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import MemberHeader from "../../components/member/MemberHeader";
import { useSavedProducts } from "../../components/homepageContainer/contexts/SavedProductsContext";
import "../../styles/member/index.css";

const SavedPosts = ({ user }) => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);

  const { savedProducts, remove, loading: contextLoading } = useSavedProducts();
  
  // Debug: Log cấu trúc dữ liệu wishlist
  console.log("🔍 SavedPosts - savedProducts structure:", savedProducts);
  console.log("🔍 SavedPosts - first product:", savedProducts[0]);
  console.log("🔍 SavedPosts - seller info:", savedProducts[0]?.seller, savedProducts[0]?.sellerName, savedProducts[0]?.user);

  // Chuẩn hóa dữ liệu wishlist giống như useProducts.js
  const normalizedProducts = savedProducts.map(product => {
    // Chuẩn hóa các trường dữ liệu với fallback values
    const id = product.id || product.productId || product._id;
    const brand = product.vehicle?.brand || product.battery?.brand || product.brand || product.vehicleBrand || product.manufacturer || "";
    const year = String(product.vehicle?.yearManufactured || product.battery?.yearManufactured || product.year || product.modelYear || product.vehicleInfo?.year || "");
    
    // Chuẩn hóa loại sản phẩm
    let type = product.type || product.category || product.vehicleType || "";
    const productTypeUpper = (product.productType || "").toString().toUpperCase();
    if (!type && productTypeUpper) {
      if (productTypeUpper === 'VEHICLE') type = 'electric-scooter';
      if (productTypeUpper === 'BATTERY') type = 'battery';
    }
    
    const mileage = String(product.mileage || product.kilometers || '');
    const priceNumber = product.price || product.listPrice || product.amount || 0;
    
    // Format giá tiền theo định dạng Việt Nam
    const price = typeof priceNumber === "number" 
      ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(priceNumber)
      : String(priceNumber);
    
    const image = product.imageUrls?.[0] || product.image || product.thumbnailUrl || "";
    const sellerAddress = product.location || product.address || product.SellerInfo?.sellerAddress || "";
    
    // Chuẩn hóa thông tin seller - tìm tên thực từ nhiều nguồn
    const seller = product.seller?.username || 
                   product.seller?.fullName || 
                   product.seller?.name ||
                   product.sellerName || 
                   product.SellerInfo?.sellerName ||
                   product.user?.username ||
                   product.user?.fullName ||
                   product.user?.name ||
                   product.seller ||
                   "Không rõ người bán";
    
    // Chuẩn hóa ngày lưu
    const savedDate = product.savedDate || product.savedAt || product.dateSaved || new Date().toISOString();
    
    const title = product.title || product.vehicleInfo?.title || product.name || "";
    const description = product.description || product.vehicleInfo?.description || title;
    
    return {
      id,
      title,
      description,
      brand,
      year,
      price,
      image,
      productType: productTypeUpper,
      SellerInfo: { sellerAddress },
      seller,
      savedDate,
      isAvailable: product.isAvailable !== false, // Mặc định là true nếu không có thông tin
      // Giữ nguyên các field gốc để tương thích
      ...product
    };
  });

  // Lọc chỉ hiển thị sản phẩm còn khả dụng
  const availableProducts = normalizedProducts.filter(product => {
    const hasValidPrice = product.price && product.price !== "NaN ₫" && product.price !== "0 ₫" && !product.price.includes("NaN");
    const hasValidTitle = product.title && product.title.trim() !== "";
    const isNotExpired = product.isAvailable !== false;
    const hasValidDate = product.savedDate && product.savedDate !== "Invalid Date";
    
    return hasValidPrice && hasValidTitle && isNotExpired && hasValidDate;
  });

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
      await remove(postId);
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
                    <h4 className="fw-bold mb-1" style={{ color: "black" }}>{savedProducts.length}</h4>
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
                    <h4 className="fw-bold mb-1" style={{ color: "black" }}>{savedProducts.length - availableProducts.length}</h4>
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
            {contextLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="success" className="mb-3" />
                <p className="text-muted">Đang tải danh sách tin đã lưu...</p>
              </div>
            ) : availableProducts.length === 0 ? (
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
                                  onClick={() => handleRemoveFromSaved(post.id)}
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
                                {post.SellerInfo?.sellerAddress || "Không có địa chỉ"} • {post.productType || "Không phân loại"}
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
