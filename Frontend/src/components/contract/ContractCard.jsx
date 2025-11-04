import React, { useState } from 'react';
import '../../styles/contract/ContractCard.css';
import contractService from '../../services/contractService';
import orderService from '../../services/orderService';
import { toast } from 'react-toastify';

const ContractCard = ({ contract, onViewDetail, onPay, onCancel, onConfirmReceived, currentUserId }) => {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofForm, setProofForm] = useState({
    shippingCode: '',
    proofImage: null
  });

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

  // Button xác nhận nhận hàng: chỉ hiển thị khi buyer, đã SIGNED, đã thanh toán, chưa xác nhận nhận hàng, có orderId
  const canConfirmReceived = contract.status === 'SIGNED' && 
                             contract.paymentCompleted && 
                             !contract.deliveryCompleted && 
                             isBuyer && 
                             contract.orderId;

  // Seller có thể submit proof khi: đã SIGNED, đã thanh toán, buyer đã xác nhận nhận hàng, có orderId, chưa submit proof
  const canSubmitProof = contract.status === 'SIGNED' && 
                         contract.paymentCompleted && 
                         contract.deliveryCompleted && 
                         isSeller && 
                         contract.orderId &&
                         !contract.escrowStatus?.includes('ADMIN_REVIEW') && // Chưa submit proof
                         !contract.escrowStatus?.includes('ADMIN_APPROVED') && // Chưa được admin approve
                         !contract.escrowStatus?.includes('RELEASED'); // Chưa được release

  // Can cancel logic based on backend conditions:
  // Case 1: SIGNED && !paymentCompleted && isSeller && 3 days passed
  // Case 2: PENDING && sellerSigned && !buyerSigned && isSeller && 3 days passed
  const canCancel = (() => {
    if (!isSeller) return false;
    
    // Case 1: SIGNED && !paymentCompleted && 3+ days passed
    if (contract.status === 'SIGNED' && !contract.paymentCompleted) {
      // Backend có thể không trả về signedAt, dùng createdAt làm fallback
      const dateToCheck = contract.signedAt || contract.createdAt;
      if (dateToCheck) {
        const checkDate = new Date(dateToCheck);
        // Thêm 3 ngày vào ngày kiểm tra để khớp với logic backend: signedAt.plusDays(3).isAfter(now)
        const threeDaysLater = new Date(checkDate.getTime() + 3 * 24 * 60 * 60 * 1000);
        const now = new Date();
        // Kiểm tra xem 3 ngày sau ngày ký có sau thời điểm hiện tại không
        return now > threeDaysLater;
      }
      return false;
    }
    
    // Case 2: PENDING && sellerSigned && !buyerSigned && 3+ days passed
    if (contract.status === 'PENDING' && contract.sellerSigned && !contract.buyerSigned) {
      // Backend không trả về updatedAt, dùng createdAt làm fallback
      const dateToCheck = contract.updatedAt || contract.createdAt;
      if (dateToCheck) {
        const checkDate = new Date(dateToCheck);
        // Thêm 3 ngày vào ngày kiểm tra để khớp với logic backend: updatedAt.plusDays(3).isAfter(now)
        const threeDaysLater = new Date(checkDate.getTime() + 3 * 24 * 60 * 60 * 1000);
        const now = new Date();
        return now > threeDaysLater;
      }
      return false;
    }
    
    return false;
  })();

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
      const dateToCheck = contract.signedAt || contract.createdAt;
      if (dateToCheck) {
        const checkDate = new Date(dateToCheck);
        const threeDaysLater = new Date(checkDate.getTime() + 3 * 24 * 60 * 60 * 1000);
        const now = new Date();
        if (now <= threeDaysLater) {
          const daysDiff = Math.floor((threeDaysLater - now) / (1000 * 60 * 60 * 24));
          return `Cần đợi thêm ${daysDiff + 1} ngày để hủy hợp đồng đã ký (để người mua có thời gian thanh toán)`;
        }
      }
    }
    if (contract.status === 'PENDING' && contract.sellerSigned && !contract.buyerSigned) {
      // Check if 3 days passed
      const dateToCheck = contract.updatedAt || contract.createdAt;
      if (dateToCheck) {
        const checkDate = new Date(dateToCheck);
        const threeDaysLater = new Date(checkDate.getTime() + 3 * 24 * 60 * 60 * 1000);
        const now = new Date();
        if (now <= threeDaysLater) {
          const daysDiff = Math.floor((threeDaysLater - now) / (1000 * 60 * 60 * 24));
          return `Cần đợi thêm ${daysDiff + 1} ngày (để người mua có thời gian ký)`;
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
    // Nếu chưa thỏa điều kiện hủy, hiển thị nhắc nhở ngay
    if (!canCancel && cancelReason) {
      toast.warning(cancelReason);
      return;
    }

    if (onCancel && !loading) {
      // Thông điệp nhắc nhở chính sách trước khi hủy
      const cancelPolicyMessage = (() => {
        if (contract.status === 'SIGNED' && !contract.paymentCompleted) {
          return 'Hợp đồng đã ký và chưa được thanh toán. Bạn chỉ có thể hủy khi đã quá 3 ngày kể từ thời điểm ký.';
        }
        if (contract.status === 'PENDING' && contract.sellerSigned && !contract.buyerSigned) {
          return 'Người bán đã ký, người mua chưa ký. Bạn chỉ có thể hủy khi đã quá 3 ngày kể từ khi bạn ký.';
        }
        return 'Bạn có chắc chắn muốn hủy hợp đồng này?';
      })();

      const confirmed = window.confirm(`${cancelPolicyMessage}\n\nBạn có chắc chắn muốn hủy hợp đồng?`);
      if (!confirmed) return;

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

  const handleConfirmReceived = async () => {
    if (!canConfirmReceived || confirming || !contract.orderId) return;
    
    // Xác nhận với user trước khi gửi request
    const confirmed = window.confirm('Bạn có chắc chắn đã nhận hàng? Sau khi xác nhận, tiền sẽ được giải phóng cho người bán sau 3 ngày.');
    if (!confirmed) return;
    
    setConfirming(true);
    try {
      if (onConfirmReceived) {
        // Nếu có callback từ parent component
        await onConfirmReceived(contract.orderId);
      } else {
        // Gọi API trực tiếp
        const result = await orderService.confirmReceived(contract.orderId);
        if (result.success) {
          toast.success(result.message || 'Xác nhận đã nhận hàng thành công');
          // Trigger refresh nếu có event listener
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('contractUpdated'));
          }
        } else {
          toast.error(result.message || 'Xác nhận nhận hàng thất bại');
        }
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xác nhận nhận hàng');
      console.error('Confirm received error:', error);
    } finally {
      setConfirming(false);
    }
  };

  // Seller submit proof để admin review
  const handleSubmitProof = async () => {
    if (!contract.orderId || submittingProof) return;

    if (!proofForm.shippingCode.trim()) {
      toast.warning('Vui lòng nhập mã vận chuyển');
      return;
    }

    setSubmittingProof(true);
    try {
      const result = await orderService.requestOrderComplete(
        contract.orderId,
        proofForm.shippingCode.trim(),
        proofForm.proofImage
      );

      if (result.success) {
        toast.success(result.message || 'Đã gửi yêu cầu xác nhận tới admin');
        setShowProofModal(false);
        setProofForm({ shippingCode: '', proofImage: null });
        // Trigger refresh
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('contractUpdated'));
        }
      } else {
        toast.error(result.message || 'Gửi yêu cầu thất bại');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi yêu cầu');
      console.error('Submit proof error:', error);
    } finally {
      setSubmittingProof(false);
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
        <div className="contract-card-footer-top">
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

          {/* Button xác nhận đã nhận hàng */}
          {canConfirmReceived && (
            <button 
              className="btn-confirm-received"
              onClick={handleConfirmReceived}
              disabled={confirming}
              style={{
                backgroundColor: '#52c41a',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: confirming ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              <i className={`bi ${confirming ? 'bi-hourglass-split' : 'bi-check-circle'}`}></i>
              {confirming ? 'Đang xử lý...' : 'Xác nhận đã nhận hàng'}
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

          {/* Seller submit proof button */}
          {canSubmitProof && (
            <button 
              className="btn-submit-proof"
              onClick={() => setShowProofModal(true)}
              disabled={loading}
              style={{
                backgroundColor: '#1890ff',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              <i className="bi bi-upload"></i>
              Gửi minh chứng
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
        </div>
        
        {!canCancel && cancelReason && isSeller && (
          <div className="cancel-note" style={{ 
            backgroundColor: cancelReason.includes("Cần đợi") ? '#fff3cd' : '#f8f9fa',
            borderLeft: cancelReason.includes("Cần đợi") ? '4px solid #ffc107' : '4px solid #6c757d'
          }}>
            <i className={`bi ${cancelReason.includes("Cần đợi") ? 'bi-clock-history' : 'bi-info-circle'}`}></i>
            <strong>{cancelReason}</strong>
          </div>
        )}
      </div>

      {/* Modal Submit Proof */}
      {showProofModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowProofModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Gửi minh chứng giao hàng</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Mã vận chuyển <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                value={proofForm.shippingCode}
                onChange={(e) => setProofForm({ ...proofForm, shippingCode: e.target.value })}
                placeholder="Nhập mã vận chuyển (VD: GHN123456789)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Ảnh minh chứng (tùy chọn)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      toast.warning('Kích thước file không được vượt quá 5MB');
                      return;
                    }
                    setProofForm({ ...proofForm, proofImage: file });
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                }}
              />
              {proofForm.proofImage && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                  Đã chọn: {proofForm.proofImage.name}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowProofModal(false);
                  setProofForm({ shippingCode: '', proofImage: null });
                }}
                disabled={submittingProof}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: submittingProof ? 'not-allowed' : 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitProof}
                disabled={submittingProof || !proofForm.shippingCode.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: submittingProof || !proofForm.shippingCode.trim() ? '#ccc' : '#1890ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: submittingProof || !proofForm.shippingCode.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingProof ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractCard;
