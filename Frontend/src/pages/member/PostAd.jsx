import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import MemberHeader from "../../components/member/MemberHeader";
import productService from "../../services/productService";
import "../../styles/member/index.css";

const PostAd = ({ user }) => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    description: "",
    images: [],
    brand: "",
    model: "",
    yearManufactured: new Date().getFullYear(),
    batteryLevel: 80
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const categories = [
    { value: "VEHICLE", label: "Xe điện (Vehicle)" },
    { value: "BATTERY", label: "Pin & Sạc (Battery)" }
  ];

  const brands = [
    { value: "Dibao", label: "Dibao" },
    { value: "Osakar", label: "Osakar" },
    { value: "Pega", label: "Pega" },
    { value: "Vinfast", label: "Vinfast" },
    { value: "Yadea", label: "Yadea" }
  ];


  useEffect(() => {
    if (!user) {
      setIsCheckingAuth(true);
      const timer = setTimeout(() => {
        if (!user) {
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
      navigate("/");
      return;
    }
  }, [user, navigate]);

  // Real-time validation
  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'price':
        const price = parseFloat(value);
        if (!price || price < 1000) {
          errors.price = "Giá phải tối thiểu 1,000 VNĐ";
        } else {
          delete errors.price;
        }
        break;
      case 'brand':
        if (!value || value === "") {
          errors.brand = "Vui lòng chọn thương hiệu";
        } else {
          delete errors.brand;
        }
        break;
      case 'model':
        if (!value || value.trim().length < 2) {
          errors.model = "Model phải ít nhất 2 ký tự";
        } else {
          delete errors.model;
        }
        break;
      case 'yearManufactured':
        const currentYear = new Date().getFullYear();
        if (!value || value < 1900 || value > currentYear + 1) {
          errors.yearManufactured = `Năm sản xuất phải từ 1900-${currentYear + 1}`;
        } else {
          delete errors.yearManufactured;
        }
        break;
      case 'batteryLevel':
        if (formData.category === "BATTERY") {
          const batteryLevel = parseInt(value);
          if (isNaN(batteryLevel) || batteryLevel < 0 || batteryLevel > 100) {
            errors.batteryLevel = "Mức pin phải từ 0-100%";
          } else {
            delete errors.batteryLevel;
          }
        }
        break;
    }
    
    setFieldErrors(errors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation
    validateField(name, value);
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

  // Validation function
  const validateForm = () => {
    const errors = [];
    
    // Validate price
    const price = parseFloat(formData.price);
    if (!price || price < 1000) {
      errors.push("Giá phải tối thiểu 1,000 VNĐ");
    }
    
    // Validate brand/model
    if (!formData.brand || formData.brand === "") {
      errors.push("Vui lòng chọn thương hiệu");
    }
    
    if (!formData.model || formData.model.trim().length < 2) {
      errors.push("Model phải ít nhất 2 ký tự");
    }
    
    // Validate year
    const currentYear = new Date().getFullYear();
    if (!formData.yearManufactured || 
        formData.yearManufactured < 1900 || 
        formData.yearManufactured > currentYear + 1) {
      errors.push("Năm sản xuất không hợp lệ (1900-" + (currentYear + 1) + ")");
    }
    
    // Validate battery level for BATTERY category
    if (formData.category === "BATTERY") {
      const batteryLevel = parseInt(formData.batteryLevel);
      if (!batteryLevel || batteryLevel < 0 || batteryLevel > 100) {
        errors.push("Mức pin phải từ 0-100%");
      }
    }
    
    // Validate images
    if (formData.images.length > 5) {
      errors.push("Chỉ được tải lên tối đa 5 ảnh");
    }
    
    // Check image sizes
    for (let i = 0; i < formData.images.length; i++) {
      if (formData.images[i].size > 5 * 1024 * 1024) { // 5MB
        errors.push(`Ảnh ${i + 1} quá lớn (tối đa 5MB)`);
      }
    }
    
    return errors;
  };

  // Enhanced error handling
  const handleError = (error) => {
    const status = error?.response?.status;
    const backendMessage = error?.response?.data?.message || error?.message;
    
    switch (status) {
      case 401:
        toast.error("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        break;
      case 403:
        toast.error("Tài khoản của bạn chưa có quyền đăng bán (ROLE_SELLER). Vui lòng liên hệ admin.");
        break;
      case 400:
        if (backendMessage?.includes('KYC') || backendMessage?.includes('kyc')) {
          toast.error("KYC chưa được duyệt. Vui lòng hoàn thành KYC trước khi đăng tin.", {
            autoClose: 7000
          });
        } else if (backendMessage?.includes('gói') || backendMessage?.includes('hạn đăng tin') || backendMessage?.includes('quá hạn') || backendMessage?.includes('POSTING_OVER_LIMIT') || backendMessage?.includes('PACKAGE_EXPIRED')) {
          toast.error(`${backendMessage}\n\n Vui lòng mua gói đăng tin để tiếp tục.`, {
            autoClose: 7000
          });
        } else if (backendMessage?.includes('TITLE_REQUIRED') || backendMessage?.includes('PRICE_REQUIRED') || backendMessage?.includes('PRODUCT_TYPE_REQUIRED')) {
          toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
        } else if (backendMessage?.includes('TITLE_TOO_LONG') || backendMessage?.includes('DESCRIPTION_TOO_LONG')) {
          toast.error("Nội dung quá dài. Vui lòng rút gọn.");
        } else {
          toast.error(`${backendMessage || 'Vui lòng kiểm tra lại thông tin'}`);
        }
        break;
      case 404:
        toast.error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        break;
      case 500:
        toast.error("Lỗi hệ thống. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.");
        break;
      default:
        toast.error(`Đăng tin thất bại: ${backendMessage || 'Vui lòng thử lại'}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Pre-validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        toast.error(error);
      });
      return;
    }

    setLoading(true);
    
    try {
      const result = await productService.createProduct(formData);
      
      if (!result.success) {
        throw new Error(result.message || 'Đăng tin thất bại');
      }

      toast.success("Đăng tin thành công! Tin của bạn đang chờ duyệt.");
      navigate("/my-posts");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
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
                              min="1000"
                              required
                              isInvalid={!!fieldErrors.price}
                            />
                            <Form.Text className="text-muted">
                              Đơn vị: VNĐ (tối thiểu 1,000 VNĐ)
                            </Form.Text>
                            {fieldErrors.price && (
                              <Form.Control.Feedback type="invalid">
                                {fieldErrors.price}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>

                      {/* Brand, Model, Year */}
                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Thương hiệu <span className="text-danger">*</span></Form.Label>
                            <Form.Select
                              name="brand"
                              value={formData.brand}
                              onChange={handleInputChange}
                              required
                              isInvalid={!!fieldErrors.brand}
                            >
                              <option value="">Chọn thương hiệu</option>
                              {brands.map(brand => (
                                <option key={brand.value} value={brand.value}>{brand.label}</option>
                              ))}
                            </Form.Select>
                            {fieldErrors.brand && (
                              <Form.Control.Feedback type="invalid">
                                {fieldErrors.brand}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Model <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="text"
                              name="model"
                              value={formData.model}
                              onChange={handleInputChange}
                              placeholder="VD: Klara S, Air Blade"
                              required
                              isInvalid={!!fieldErrors.model}
                            />
                            {fieldErrors.model && (
                              <Form.Control.Feedback type="invalid">
                                {fieldErrors.model}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Năm sản xuất <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="number"
                              name="yearManufactured"
                              value={formData.yearManufactured}
                              onChange={handleInputChange}
                              min="1900"
                              max="2030"
                              required
                              isInvalid={!!fieldErrors.yearManufactured}
                            />
                            {fieldErrors.yearManufactured && (
                              <Form.Control.Feedback type="invalid">
                                {fieldErrors.yearManufactured}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>

                      {/* Battery Level (only for BATTERY category) */}
                      {formData.category === "BATTERY" && (
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-bold">Mức pin (%) <span className="text-danger">*</span></Form.Label>
                              <Form.Control
                                type="number"
                                name="batteryLevel"
                                value={formData.batteryLevel}
                                onChange={handleInputChange}
                                min="0"
                                max="100"
                                required
                              />
                              <Form.Text className="text-muted">
                                Nhập mức pin từ 0-100%
                              </Form.Text>
                            </Form.Group>
                          </Col>
                        </Row>
                      )}

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
                          {/* Title */}
                          <h6 className="text-truncate mb-2">{formData.title || "Tiêu đề tin đăng"}</h6>
                          
                          {/* Price */}
                          <p className="text-success fw-bold mb-2">
                            {formData.price ? `${parseInt(formData.price).toLocaleString('vi-VN')} ₫` : "0 ₫"}
                          </p>
                          
                          {/* Category */}
                          <div className="mb-2">
                            <small className="text-muted">
                              <strong>Loại:</strong> {formData.category ? categories.find(c => c.value === formData.category)?.label : "Chọn danh mục"}
                            </small>
                          </div>

                          {/* Product Details */}
                          {(formData.brand || formData.model || formData.yearManufactured) && (
                            <div className="mb-2">
                              <small className="text-muted">
                                <strong>Thông số:</strong>
                              </small>
                              <div className="small text-muted">
                                {formData.brand && <div>• Hãng: {formData.brand}</div>}
                                {formData.model && <div>• Model: {formData.model}</div>}
                                {formData.yearManufactured && <div>• Năm SX: {formData.yearManufactured}</div>}
                                {formData.category === "BATTERY" && formData.batteryLevel && (
                                  <div>• Mức pin: {formData.batteryLevel}%</div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Description Preview */}
                          {formData.description && (
                            <div className="mb-2">
                              <small className="text-muted">
                                <strong>Mô tả:</strong>
                              </small>
                              <div className="small text-muted" style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                lineHeight: "1.3"
                              }}>
                                {formData.description}
                              </div>
                            </div>
                          )}

                          {/* Images Count */}
                          {formData.images.length > 0 && (
                            <div className="mb-2">
                              <small className="text-muted">
                                <strong>Hình ảnh:</strong> {formData.images.length} ảnh
                              </small>
                            </div>
                          )}

                          {/* Seller Info */}
                          <div className="mt-2 pt-2 border-top">
                            <small className="text-muted">
                              <strong>Người bán:</strong> {user?.name || user?.username || user?.email || "Chưa có thông tin"}
                            </small>
                          </div>
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
                      disabled={loading || Object.keys(fieldErrors).length > 0}
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
