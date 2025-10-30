import { useEffect, useState } from "react";
import { Button, Col, Form, Row, Spinner, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import aiPriceService from "../../services/aiPriceService";

/**
 * Floating AI price suggestion widget
 * Props:
 * - initial: { category, brand, model, yearManufactured, batteryLevel }
 * - onSuggested: (price: number) => void
 * - iconSrc?: string (đường dẫn ảnh icon AI tuỳ chỉnh)
 */
const PriceSuggestChat = ({ initial, onSuggested, iconSrc }) => {
  // Luôn ưu tiên đúng ảnh yêu cầu: /@AI.png (public root)
  const preferredIcon = iconSrc || "/@AI.png";
  const [iconUrl, setIconUrl] = useState(preferredIcon);
  const [showPanel, setShowPanel] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: "vehicle",
    brand: "",
    model: "",
    yearManufactured: new Date().getFullYear(),
    // vehicle
    odometer: "",
    batteryType: "",
    batteryCapacityKWh: "",
    rangePerChargeKm: "",
    // battery
    batteryLevel: 80,
    voltage: "",
    capacityAh: "",
    sohPercent: 95,
  });
  const [suggestedPriceByType, setSuggestedPriceByType] = useState({ vehicle: null, battery: null });

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

  const PIN_TYPES = [
    { value: "", label: "Chọn loại pin" },
    { value: "Lithium-Ion", label: "Lithium-Ion" },
    { value: "Lithium-Polymer", label: "Lithium-Polymer" },
    { value: "Lead-Acid", label: "Lead-Acid" },
    { value: "Nickel-Metal Hydride", label: "Nickel-Metal Hydride" },
    { value: "Khác", label: "Khác" },
  ];

  // Prefill từ parent khi mở panel
  useEffect(() => {
    if (!initial) return;
    setForm(prev => ({
      ...prev,
      brand: initial.brand || prev.brand,
      model: initial.model || prev.model,
      yearManufactured: initial.yearManufactured || prev.yearManufactured,
      batteryLevel: typeof initial.batteryLevel === "number" ? initial.batteryLevel : prev.batteryLevel,
      type: initial.category === "BATTERY" ? "battery" : "vehicle",
    }));
  }, [initial, showPanel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const buildPriceRequest = () => {
        const req = {
          type: form.type,
          brand: form.brand?.trim() || null,
          model: form.model?.trim() || null,
          yearManufactured: form.yearManufactured ? Number(form.yearManufactured) : null,
        };
        if (form.type === "vehicle") {
          if (form.odometer !== "" && form.odometer !== undefined && form.odometer !== null) req.odometer = Number(form.odometer);
          if (form.batteryType) req.batteryType = form.batteryType?.trim();
          if (form.batteryCapacityKWh !== "" && form.batteryCapacityKWh !== undefined && form.batteryCapacityKWh !== null) req.batteryCapacityKWh = Number(form.batteryCapacityKWh);
          if (form.rangePerChargeKm !== "" && form.rangePerChargeKm !== undefined && form.rangePerChargeKm !== null) req.rangePerChargeKm = Number(form.rangePerChargeKm);
        }
        if (form.type === "battery") {
          if (form.batteryLevel !== "" && form.batteryLevel !== undefined && form.batteryLevel !== null) req.batteryLevel = Number(form.batteryLevel);
          if (form.voltage !== "" && form.voltage !== undefined && form.voltage !== null) req.voltage = Number(form.voltage);
          if (form.capacityAh !== "" && form.capacityAh !== undefined && form.capacityAh !== null) req.capacityAh = Number(form.capacityAh);
          if (form.sohPercent !== "" && form.sohPercent !== undefined && form.sohPercent !== null) req.sohPercent = Number(form.sohPercent);
        }
        return req;
      };
      const priceRequest = buildPriceRequest();
      const res = await aiPriceService.suggestPriceBySpec(priceRequest);
      if (res.success && res.price) {
        setSuggestedPriceByType(prev => ({ ...prev, [form.type]: res.price }));
        toast.success("AI đã gợi ý giá: " + res.price.toLocaleString('vi-VN') + " VNĐ");
        setShowPanel(true); // vẫn giữ panel mở, không đóng
      } else {
        setSuggestedPriceByType(prev => ({ ...prev, [form.type]: null }));
        toast.error(res.message || "Không thể gợi ý giá. Vui lòng thử lại!");
      }
    } catch (e) {
      setSuggestedPriceByType(prev => ({ ...prev, [form.type]: null }));
      toast.error("Có lỗi xảy ra khi gợi ý giá!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Icon and Inline Panel */}
      <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 2000, display: "flex", alignItems: "flex-end", gap: 12 }}>
        {showPanel && (
          <div style={{
            width: 680,
            maxWidth: "92vw",
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 10px 28px rgba(0,0,0,0.2)",
            overflow: "hidden",
            marginBottom: 12,
            border: "1px solid #e6e6e6",
            maxHeight: 560,
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{ background: "#198754", color: "#fff", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <strong>AI gợi ý giá sản phẩm</strong>
              <Button variant="light" size="sm" onClick={() => setShowPanel(false)}>×</Button>
            </div>
            <div style={{ padding: 16, overflowY: "auto", overflowX: "hidden" }}>
              <Form>
                <Row>
                  <Col md={12}>
                {/* Title */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Loại sản phẩm <span className="text-danger">*</span></Form.Label>
                  <Form.Select name="type" value={form.type} onChange={handleChange}>
                    <option value="vehicle">Xe điện (Vehicle)</option>
                    <option value="battery">Pin & Sạc (Battery)</option>
                  </Form.Select>
                </Form.Group>

                {/* Brand, Model, Year */}
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Thương hiệu <span className="text-danger">*</span></Form.Label>
                      <Form.Select name="brand" value={form.brand} onChange={handleChange}>
                        <option value="">Chọn thương hiệu</option>
                        {brands.map(brand => (
                          <option key={brand.value} value={brand.value}>{brand.label}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Model <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="model"
                        value={form.model}
                        onChange={handleChange}
                        placeholder="VD: Klara S, Air Blade"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Năm sản xuất <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        name="yearManufactured"
                        value={form.yearManufactured}
                        onChange={handleChange}
                        min="1900"
                        max="2030"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Vehicle specific fields */}
                {form.type === "vehicle" && (
                  <>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Số km đã đi</Form.Label>
                          <Form.Control
                            type="number"
                            name="odometer"
                            value={form.odometer}
                            onChange={handleChange}
                            placeholder="VD: 5000"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Loại pin</Form.Label>
                          <Form.Select name="batteryType" value={form.batteryType} onChange={handleChange}>
                            {PIN_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Dung lượng pin (kWh)</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.1"
                            name="batteryCapacityKWh"
                            value={form.batteryCapacityKWh}
                            onChange={handleChange}
                            placeholder="VD: 3.5"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Quãng đường/sạc (km)</Form.Label>
                          <Form.Control
                            type="number"
                            name="rangePerChargeKm"
                            value={form.rangePerChargeKm}
                            onChange={handleChange}
                            placeholder="VD: 100"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}

                {/* Battery specific fields */}
                {form.type === "battery" && (
                  <>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Mức pin (%) <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="number"
                            name="batteryLevel"
                            value={form.batteryLevel}
                            onChange={handleChange}
                            min="0"
                            max="100"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Loại pin</Form.Label>
                          <Form.Select name="batteryType" value={form.batteryType} onChange={handleChange}>
                            {PIN_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Điện áp (V)</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.1"
                            name="voltage"
                            value={form.voltage}
                            onChange={handleChange}
                            placeholder="VD: 48"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Dung lượng (Ah)</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.1"
                            name="capacityAh"
                            value={form.capacityAh}
                            onChange={handleChange}
                            placeholder="VD: 20"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">SoH (%)</Form.Label>
                          <Form.Control
                            type="number"
                            name="sohPercent"
                            value={form.sohPercent}
                            onChange={handleChange}
                            min="0"
                            max="100"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}
                  </Col>
                </Row>
                <div className="d-flex align-items-center justify-content-end gap-3 mt-2 pb-1">
                  <Button variant="success" onClick={submit} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Đang gợi ý...
                      </>
                    ) : (
                      "Gợi ý giá"
                    )}
                  </Button>
                  {typeof suggestedPriceByType[form.type] === 'number' && (
                    <div className="ms-2 text-nowrap" style={{fontSize: 16, color: '#05a400', fontWeight: 700}}>
                      Giá AI gợi ý ({form.type === 'battery' ? 'battery' : 'vehicle'}): {suggestedPriceByType[form.type].toLocaleString('vi-VN')} VNĐ
                      <span style={{ display: 'block', fontSize: 12, color: '#888', fontWeight: 400 }}>Hãy dán thủ công nếu muốn dùng giá này!</span>
                    </div>
                  )}
                </div>
              </Form>
            </div>
          </div>
        )}
        <button
          onClick={() => setShowPanel(v => !v)}
          style={{ 
            width: 64,
            height: 64,
            borderRadius: 32,
            background: "#ffffff", 
            border: "1px solid #e6e6e6", 
            boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
            padding: 0,
            overflow: "hidden"
          }}
          title="AI gợi ý giá"
        >
          <img
            src={iconUrl}
            alt="AI"
            style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6, display: "block" }}
            onError={() => setIconUrl("/@AI.png")}
          />
        </button>
      </div>
    </>
  );
};

export default PriceSuggestChat;


