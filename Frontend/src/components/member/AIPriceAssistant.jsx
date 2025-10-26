import { useState } from 'react';
import { Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { Sparkles, Copy, Trash2, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import aiPriceService from '../../services/aiPriceService';
import '../../styles/member/AIPriceAssistant.css';

const AIPriceAssistant = () => {
  const [formData, setFormData] = useState({
    productName: '',
    description: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle AI suggestion
  const handleSuggestPrice = async () => {
    // Validation
    if (!formData.productName.trim() || !formData.description.trim()) {
      toast.warning('Vui lòng điền đầy đủ tên và mô tả sản phẩm!');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await aiPriceService.suggestPrice(
        formData.productName,
        formData.description
      );

      if (response.success && response.price) {
        // Thêm vào history
        const newResult = {
          id: Date.now(),
          productName: formData.productName,
          description: formData.description,
          suggestedPrice: response.price,
          timestamp: new Date()
        };
        
        setResult(newResult);
        setHistory(prev => [newResult, ...prev].slice(0, 10)); // Giữ tối đa 10 lịch sử
        
        toast.success('AI đã gợi ý giá cho bạn! 🎯');
      } else {
        toast.error(response.message || 'Không thể gợi ý giá. Vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Có lỗi xảy ra khi gợi ý giá!');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clear form
  const handleClear = () => {
    setFormData({ productName: '', description: '' });
    setResult(null);
  };

  // Handle copy price
  const handleCopyPrice = () => {
    if (result?.suggestedPrice) {
      navigator.clipboard.writeText(result.suggestedPrice);
      toast.success('Đã sao chép giá!');
    }
  };

  // Handle use price
  const handleUsePrice = () => {
    if (result?.suggestedPrice) {
      // Store price để có thể dùng ở trang đăng tin
      localStorage.setItem('aiSuggestedPrice', result.suggestedPrice);
      localStorage.setItem('aiProductInfo', JSON.stringify(formData));
      toast.success('Đã lưu! Vào trang đăng tin để xem giá đã gợi ý.');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '0';
    const numAmount = parseInt(amount.toString().replace(/[^0-9]/g, ''));
    return numAmount.toLocaleString('vi-VN');
  };

  return (
    <div className="ai-assistant-container">
      {/* Main AI Card */}
      <Card className="ai-main-card mb-4">
        <Card.Header className="ai-card-header">
          <div className="d-flex align-items-center">
            <Sparkles className="me-2" size={24} />
            <h4 className="mb-0">Gợi Ý Giá Sản Phẩm</h4>
          </div>
          <p className="text-muted mb-0">Nhập thông tin sản phẩm để AI phân tích và gợi ý giá</p>
        </Card.Header>
        
        <Card.Body>
          {/* Input Form */}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                Tên sản phẩm <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="VD: Xe máy điện VinFast Klara S 2023"
                disabled={isLoading}
                className="ai-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                Mô tả sản phẩm <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả chi tiết về sản phẩm: tình trạng, đặc điểm, phụ kiện kèm theo..."
                disabled={isLoading}
                className="ai-input"
              />
              <Form.Text className="text-muted">
                Mô tả càng chi tiết, AI gợi ý càng chính xác
              </Form.Text>
            </Form.Group>

            {/* Action Buttons */}
            <div className="d-flex gap-2">
              <Button
                variant="primary"
                onClick={handleSuggestPrice}
                disabled={isLoading || !formData.productName.trim() || !formData.description.trim()}
                className="flex-grow-1"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="me-2" />
                    Gợi Ý Giá
                  </>
                )}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={handleClear}
                disabled={isLoading}
                size="lg"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </Form>

          {/* Result Display */}
          {result && (
            <Alert variant="info" className="mt-4 ai-result">
              <div className="d-flex align-items-start mb-2">
                <Sparkles className="me-2 mt-1" size={20} />
                <div className="flex-grow-1">
                  <h5 className="mb-2">💡 AI Gợi Ý</h5>
                  <div className="ai-price-display">
                    <div className="text-muted small mb-2">Giá đề xuất:</div>
                    <div className="ai-price-value">
                      {formatCurrency(result.suggestedPrice)} ₫
                    </div>
                  </div>
                </div>
              </div>
              
              <hr />
              
              <div className="d-flex gap-2 mt-3">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleCopyPrice}
                >
                  <Copy size={16} className="me-2" />
                  Sao chép
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleUsePrice}
                >
                  Sử dụng giá này
                </Button>
              </div>
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* History Card */}
      {history.length > 0 && (
        <Card>
          <Card.Header>
            <h5 className="mb-0">📊 Lịch Sử Gợi Ý</h5>
          </Card.Header>
          <Card.Body>
            <div className="ai-history-list">
              {history.map((item) => (
                <div key={item.id} className="ai-history-item">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="flex-grow-1">
                      <div className="fw-bold text-truncate">{item.productName}</div>
                      <div className="text-muted small text-truncate">{item.description}</div>
                    </div>
                    <div className="text-end">
                      <div className="ai-price-text">
                        {formatCurrency(item.suggestedPrice)} ₫
                      </div>
                    </div>
                  </div>
                  <div className="text-muted small">
                    {new Date(item.timestamp).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default AIPriceAssistant;

