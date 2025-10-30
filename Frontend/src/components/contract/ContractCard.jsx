import React, { useState } from 'react';
import './ContractCard.css';
import contractService from '../../services/contractService';
import { toast } from 'react-toastify';

const ContractCard = ({ contract, onViewDetail, onPay, onCancel, currentUserId }) => {
  const [loading, setLoading] = useState(false);

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

  const getPriceDisplay = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const isSeller = currentUserId === contract.sellerId;
  const isBuyer = currentUserId === contract.buyerId;

  const canPay = contract.status === 'SIGNED' && 
                 !contract.paymentCompleted && 
                 isBuyer;

  // Can cancel logic based on backend conditions:
  // Case 1: SIGNED && !paymentCompleted && isSeller
  // Case 2: PENDING && sellerSigned && !buyerSigned && isSeller
  const canCancel = 
    (contract.status === 'SIGNED' && !contract.paymentCompleted && isSeller) ||
    (contract.status === 'PENDING' && contract.sellerSigned && !contract.buyerSigned && isSeller);

  // Get cancel reason if cannot cancel
  const getCannotCancelReason = () => {
    if (!isSeller) {
      return "Chỉ người bán mới có thể hủy hợp đồng";
    }
    if (contract.status === 'COMPLETED') {
      return "Hợp đồng đã hoàn thành, không thể hủy";
    }
    if (contract.status === 'CANCELLED') {
      return "Hợp đồng đã bị hủy";
    }
    if (contract.status === 'SIGNED' && contract.paymentCompleted) {
      return "Đã thanh toán, không thể hủy. Vui lòng sử dụng chức năng khiếu nại nếu có vấn đề";
    }
    if (contract.status === 'PENDING' && !contract.sellerSigned) {
      return "Bạn cần ký hợp đồng trước (chưa ai ký)";
    }
    if (contract.status === 'PENDING' && !contract.sellerSigned && !contract.buyerSigned) {
      return "Cần có người ký hợp đồng trước (chưa ai ký)";
    }
    if (contract.status === 'PENDING' && contract.buyerSigned && !contract.sellerSigned) {
      return "Người mua đã ký, bạn cần ký để hoàn tất hợp đồng";
    }
    if (contract.status === 'SIGNED' && !contract.paymentCompleted) {
      // Check if 3 days passed
      const signedDate = new Date(contract.signedAt);
      const now = new Date();
      const daysDiff = Math.floor((now - signedDate) / (1000 * 60 * 60 * 24));
      if (daysDiff < 3) {
        return `Cần đợi thêm ${3 - daysDiff} ngày để hủy hợp đồng đã ký (để người mua có thời gian thanh toán)`;
      }
    }
    if (contract.status === 'PENDING' && contract.sellerSigned && !contract.buyerSigned) {
      // Check if 3 days passed
      if (contract.updatedAt) {
        const updatedDate = new Date(contract.updatedAt);
        const now = new Date();
        const daysDiff = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));
        if (daysDiff < 3) {
          return `Cần đợi thêm ${3 - daysDiff} ngày (để người mua có thời gian ký)`;
        }
      }
    }
    return null;
  };

  const cancelReason = !canCancel ? getCannotCancelReason() : null;

  const handlePay = async () => {
    if (onPay && !loading) {
      setLoading(true);
      await onPay(contract.id);
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!loading && contract.contractCode) {
      setLoading(true);
      try {
        const result = await contractService.downloadContract(contract.contractCode);
        if (result.success) {
          toast.success(result.message || 'Tải xuống hợp đồng thành công');
        } else {
          toast.error(result.message || 'Tải xuống hợp đồng thất bại');
        }
      } catch (error) {
        console.error('Download error:', error);
        toast.error('Có lỗi xảy ra khi tải xuống');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = async () => {
    if (onCancel && !loading) {
      setLoading(true);
      console.log("🔄 Card: Cancelling contract", {
        id: contract.id,
        code: contract.contractCode,
        sellerId: contract.sellerId,
        allFields: Object.keys(contract)
      });
      
      // Use contract.id if available, otherwise log error
      const contractIdToUse = contract.id;
      if (!contractIdToUse) {
        console.error("❌ Contract ID is missing! Available fields:", contract);
        toast.error("Không tìm thấy ID hợp đồng");
        setLoading(false);
        return;
      }
      
      await onCancel(contractIdToUse, contract.sellerId);
      setLoading(false);
    }
  };

  const lifecycleStep = (() => {
    if (contract.status === 'COMPLETED') return 3;
    if (contract.status === 'SIGNED') return 2;
    if (contract.status === 'PENDING') return 1;
    return 0; // CANCELLED or other
  })();

  return (
    <div className="contract-card">
      <div className="contract-card-header">
        <div className="contract-info">
          <h4 className="contract-code">{contract.contractCode}</h4>
          <span className="contract-date">
            {new Date(contract.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
        {getStatusBadge(contract.status)}
      </div>

      <div className="lifecycle">
        <div className="lifecycle-progress">
          <div className={`lc-dot ${lifecycleStep >= 1 ? 'active' : ''}`}>1</div>
          <div className={`lc-line ${lifecycleStep >= 2 ? 'active' : ''}`}></div>
          <div className={`lc-dot ${lifecycleStep >= 2 ? 'active' : ''}`}>2</div>
          <div className={`lc-line ${lifecycleStep >= 3 ? 'active' : ''}`}></div>
          <div className={`lc-dot ${lifecycleStep >= 3 ? 'active' : ''}`}>3</div>
        </div>
        <div className="lc-labels">
          <span>Khởi tạo</span>
          <span>Đã ký</span>
          <span>Hoàn thành</span>
        </div>
      </div>

      <div className="contract-card-body">
        <div className="contract-parties">
          <div className="party-info">
            <span className="party-label">Người mua:</span>
            <span className="party-name">{contract.buyerName}</span>
          </div>
          <div className="party-info">
            <span className="party-label">Người bán:</span>
            <span className="party-name">{contract.sellerName}</span>
          </div>
        </div>

        <div className="contract-product">
          <span className="product-label">Sản phẩm:</span>
          <span className="product-name">{contract.productName}</span>
        </div>

        <div className="contract-price">
          <span className="price-label">Giá thỏa thuận:</span>
          <span className="price-value">{getPriceDisplay(contract.agreedPrice)}</span>
        </div>

        <div className="contract-sign-status">
          <span className={`sign-badge ${contract.sellerSigned ? 'signed' : 'unsigned'}`}>
            {contract.sellerSigned ? '✓ Người bán đã ký' : '○ Người bán chưa ký'}
          </span>
          <span className={`sign-badge ${contract.buyerSigned ? 'signed' : 'unsigned'}`}>
            {contract.buyerSigned ? '✓ Người mua đã ký' : '○ Người mua chưa ký'}
          </span>
        </div>

        {contract.paymentCompleted && (
          <div className="payment-status paid">✓ Đã thanh toán</div>
        )}

        {contract.deliveryCompleted && (
          <div className="delivery-status completed">
            ✓ Đã nhận hàng
          </div>
        )}
      </div>

      <div className="contract-card-footer">
        <button 
          className="btn-view-detail"
          onClick={() => onViewDetail && onViewDetail(contract)}
        >
          Xem chi tiết
        </button>

        {canPay && (
          <button 
            className="btn-pay"
            onClick={handlePay}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Thanh toán'}
          </button>
        )}

        {/* Download button */}
        {contract.status === 'SIGNED' && contract.contractCode && (
          <button 
            className="btn-download"
            onClick={handleDownload}
            disabled={loading}
            title="Tải xuống bản PDF của hợp đồng đã ký"
          >
            {loading ? <i className="bi bi-hourglass-split"></i> : <i className="bi bi-download"></i>}
            {loading ? ' Đang tải...' : ' Tải xuống'}
          </button>
        )}

        {canCancel && (
          <button 
            className="btn-cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Hủy hợp đồng'}
          </button>
        )}
        
        {!canCancel && cancelReason && isSeller && (
          <div className="cancel-note" style={{ 
            backgroundColor: cancelReason.includes("Cần đợi") ? '#fff3cd' : '#f8f9fa',
            borderLeft: cancelReason.includes("Cần đợi") ? '3px solid #ffc107' : '3px solid #6c757d'
          }}>
            <i className={`bi ${cancelReason.includes("Cần đợi") ? 'bi-clock-history' : 'bi-info-circle'} me-1`}></i>
            <strong>{cancelReason}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractCard;
