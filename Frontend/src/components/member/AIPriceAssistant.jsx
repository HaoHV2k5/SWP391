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
    <>
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-success text-white">
          <h4 className="mb-0">Gợi Ý Giá Sản Phẩm</h4>
        </Card.Header>
      <Card.Body className="p-4">
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
            />
            <Form.Text className="text-muted">
              Mô tả càng chi tiết, AI gợi ý càng chính xác
            </Form.Text>
          </Form.Group>

          {/* Action Buttons */}
          <div className="d-flex gap-2">
            <Button
              variant="success"
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
                "Gợi Ý Giá"
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
            <Alert variant="success" className="mt-4">
              <h5 className="mb-3">AI Gợi Ý Giá</h5>
              <div className="text-center mb-3">
                <div className="text-muted small mb-2">Giá đề xuất:</div>
                <div className="h3 text-success fw-bold">
                  {formatCurrency(result.suggestedPrice)} ₫
                </div>
              </div>
              
              <hr />
              
              <div className="d-flex gap-2 justify-content-center">
                <Button
                  variant="outline-success"
                  onClick={handleCopyPrice}
                >
                  <Copy size={16} className="me-2" />
                  Sao chép
                </Button>
                <Button
                  variant="success"
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
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Lịch Sử Gợi Ý</h5>
          </Card.Header>
          <Card.Body className="p-3">
            {history.map((item) => (
              <div key={item.id} className="border-bottom pb-2 mb-2">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="flex-grow-1">
                    <div className="fw-bold">{item.productName}</div>
                    <div className="text-muted small">{item.description}</div>
                  </div>
                  <div className="text-success fw-bold">
                    {formatCurrency(item.suggestedPrice)} ₫
                  </div>
                </div>
                <div className="text-muted small">
                  {new Date(item.timestamp).toLocaleString('vi-VN')}
                </div>
              </div>
            ))}
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default AIPriceAssistant;

