import { Modal, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";

const EditProductModal = ({
  show,
  onHide,
  loading,
  editFormData,
  onFormChange,
  onSubmit,
  brands,
  batteryTypes,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Chỉnh sửa tin đăng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>
              Tiêu đề <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={editFormData.title}
              onChange={(e) => onFormChange("title", e.target.value)}
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
              onChange={(e) => onFormChange("description", e.target.value)}
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
                    onFormChange("price", parseFloat(e.target.value) || 0)
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
                  onChange={(e) => onFormChange("productType", e.target.value)}
                >
                  <option value="VEHICLE">Xe điện</option>
                  <option value="BATTERY">Pin/Ắc quy</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Brand, Model, Year */}
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Thương hiệu <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={editFormData.brand}
                  onChange={(e) => onFormChange("brand", e.target.value)}
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map((brand) => (
                    <option key={brand.value} value={brand.value}>
                      {brand.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Model <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={editFormData.model}
                  onChange={(e) => onFormChange("model", e.target.value)}
                  placeholder="VD: Klara S"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Năm sản xuất <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  value={editFormData.yearManufactured}
                  onChange={(e) =>
                    onFormChange(
                      "yearManufactured",
                      parseInt(e.target.value) || new Date().getFullYear()
                    )
                  }
                  min="1900"
                  max="2030"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Vehicle specific fields */}
          {editFormData.productType === "VEHICLE" && (
            <>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Số km đã đi (km)</Form.Label>
                    <Form.Control
                      type="number"
                      value={editFormData.odometer || ""}
                      onChange={(e) => onFormChange("odometer", e.target.value)}
                      placeholder="VD: 5000"
                      min="0"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Loại pin</Form.Label>
                    <Form.Select
                      value={editFormData.vehicleBatteryType || ""}
                      onChange={(e) =>
                        onFormChange("vehicleBatteryType", e.target.value)
                      }
                    >
                      <option value="">Chọn loại pin</option>
                      {batteryTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dung lượng pin (kWh)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      value={editFormData.batteryCapacityKWh || ""}
                      onChange={(e) =>
                        onFormChange("batteryCapacityKWh", e.target.value)
                      }
                      placeholder="VD: 2.5"
                      min="0"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Quãng đường 1 lần sạc (km)</Form.Label>
                    <Form.Control
                      type="number"
                      value={editFormData.rangePerChargeKm || ""}
                      onChange={(e) =>
                        onFormChange("rangePerChargeKm", e.target.value)
                      }
                      placeholder="VD: 60"
                      min="0"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}

          {/* Battery specific fields */}
          {editFormData.productType === "BATTERY" && (
            <>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Mức pin (%) <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={editFormData.batteryLevel || 80}
                      onChange={(e) =>
                        onFormChange(
                          "batteryLevel",
                          parseInt(e.target.value) || 80
                        )
                      }
                      min="0"
                      max="100"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Độ bền pin - SoH (%)</Form.Label>
                    <Form.Control
                      type="number"
                      value={editFormData.sohPercent || ""}
                      onChange={(e) => onFormChange("sohPercent", e.target.value)}
                      placeholder="VD: 85"
                      min="0"
                      max="100"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Loại pin</Form.Label>
                    <Form.Select
                      value={editFormData.batteryBatteryType || ""}
                      onChange={(e) =>
                        onFormChange("batteryBatteryType", e.target.value)
                      }
                    >
                      <option value="">Chọn loại pin</option>
                      {batteryTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Điện áp (V)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      value={editFormData.voltage || ""}
                      onChange={(e) => onFormChange("voltage", e.target.value)}
                      placeholder="VD: 48"
                      min="0"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dung lượng (Ah)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      value={editFormData.capacityAh || ""}
                      onChange={(e) => onFormChange("capacityAh", e.target.value)}
                      placeholder="VD: 20"
                      min="0"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}

          <Alert variant="info" className="mb-0">
            <small>
              <strong>Lưu ý:</strong> Chỉ có thể chỉnh sửa thông tin cơ bản.
              Để thay đổi hình ảnh, vui lòng tạo tin đăng mới.
            </small>
          </Alert>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="light"
          onClick={onHide}
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
          onClick={onSubmit}
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
  );
};

export default EditProductModal;

