import React, { useState } from 'react';
import contractService from '../../services/contractService';
import { toast } from 'react-toastify';
import './ContractDetailModal.css';

const ContractDetailModal = ({ contract, isOpen, onClose, currentUserId, onPay }) => {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !contract) return null;

  const isSeller = currentUserId === contract.sellerId;
  const isBuyer = currentUserId === contract.buyerId;

  const canPay = contract.status === 'SIGNED' && !contract.paymentCompleted && isBuyer;

  const handlePay = async () => {
    if (!canPay || loading) return;
    
    setLoading(true);
    try {
      if (onPay) {
        await onPay(contract.id);
      } else {
        const result = await contractService.payContract(contract.id);
        if (result.success) {
          toast.success(result.message || 'Thanh toán thành công');
          onClose();
        } else {
          toast.error(result.message || 'Thanh toán thất bại');
        }
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thanh toán');
    } finally {
      setLoading(false);
    }
  };


  const handleDownload = async () => {
    if (downloading || contract.status !== 'SIGNED') return;
    
    setDownloading(true);
    try {
      // Sử dụng contractCode thay vì contractHash
      if (!contract.contractCode) {
        toast.warning('Không thể tải xuống hợp đồng này');
        return;
      }
      
      await contractService.downloadContract(contract.contractCode);
      toast.success('Tải xuống hợp đồng thành công');
    } catch (error) {
      toast.error('Tải xuống hợp đồng thất bại');
    } finally {
      setDownloading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { class: 'status-pending', label: 'Đang chờ ký' },
      SIGNED: { class: 'status-signed', label: 'Đã ký' },
      COMPLETED: { class: 'status-completed', label: 'Hoàn thành' },
      CANCELLED: { class: 'status-cancelled', label: 'Đã hủy' },
      DISPUTED: { class: 'status-disputed', label: 'Đang tranh chấp' }
    };
    const config = statusConfig[status] || { class: 'status-default', label: status };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content contract-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Chi tiết hợp đồng</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Simple text layout */}
          <div className="contract-info">
            <div className="info-row">
              <span className="info-label">Mã hợp đồng:</span>
              <span className="info-value">{contract.contractCode}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Trạng thái:</span>
              <span className="info-value">{getStatusBadge(contract.status)}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Người mua:</span>
              <span className="info-value">{contract.buyerName} (ID: {contract.buyerId})</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Người bán:</span>
              <span className="info-value">{contract.sellerName} (ID: {contract.sellerId})</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Thông tin sản phẩm:</span>
              <span className="info-value">{contract.productName} (ID: {contract.productId})</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Thông tin thanh toán:</span>
              <span className="info-value">{formatCurrency(contract.agreedPrice)} - {contract.paymentCompleted ? 'Đã thanh toán' : 'Chưa thanh toán'}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Tình trạng ký:</span>
              <span className="info-value">
                Người bán: {contract.sellerSigned ? 'Đã ký' : 'Chưa ký'} | 
                Người mua: {contract.buyerSigned ? 'Đã ký' : 'Chưa ký'}
              </span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Thời gian:</span>
              <span className="info-value">
                Tạo: {formatDate(contract.createdAt)}
                {contract.signedAt && ` | Ký: ${formatDate(contract.signedAt)}`}
                {contract.completedAt && ` | Hoàn thành: ${formatDate(contract.completedAt)}`}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="footer-actions">
            {contract.status === 'SIGNED' && contract.contractCode && (
              <button
                className="btn-download"
                onClick={handleDownload}
                disabled={downloading}
              >
                <i className={`bi ${downloading ? 'bi-hourglass-split' : 'bi-download'}`}></i>
                {downloading ? 'Đang tải...' : 'Tải xuống PDF'}
              </button>
            )}
            
            {canPay && (
              <button
                className="btn-pay"
                onClick={handlePay}
                disabled={loading}
              >
                <i className={`bi ${loading ? 'bi-hourglass-split' : 'bi-credit-card'}`}></i>
                {loading ? 'Đang xử lý...' : 'Thanh toán'}
              </button>
            )}
          </div>
          
          <button className="btn-close" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractDetailModal;
