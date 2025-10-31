import React, { useState } from 'react';
import contractService from '../../services/contractService';
import { toast } from 'react-toastify';
import '../../styles/contract/ContractDetailModal.css';

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
        {/* Header */}
        <div className="modal-header-new">
          <div className="header-left">
            <i className="bi bi-file-earmark-text header-icon"></i>
            <div>
              <h3>Chi tiết hợp đồng</h3>
              <div className="contract-id-text">ID: {contract.contractCode}</div>
            </div>
          </div>
          <div className="header-right">
            {getStatusBadge(contract.status)}
            <button className="modal-close-btn-new" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="modal-body-new">
          {/* Thông tin các bên */}
          <section className="detail-section">
            <div className="section-header-new">
              <i className="bi bi-people section-icon-new"></i>
              <h4>Thông tin các bên</h4>
            </div>
            <div className="parties-grid-new">
              <div className="party-box-new">
                <div className="avatar-circle-new buyer-avatar">
                  {contract.buyerName?.[0]?.toUpperCase() || 'B'}
                </div>
                <div className="party-info-new">
                  <div className="party-label-new">Người mua</div>
                  <div className="party-name-new">{contract.buyerName}</div>
                  <div className="party-id-new">ID: {contract.buyerId}</div>
                </div>
              </div>
              <div className="party-box-new">
                <div className="avatar-circle-new seller-avatar">
                  {contract.sellerName?.[0]?.toUpperCase() || 'S'}
                </div>
                <div className="party-info-new">
                  <div className="party-label-new">Người bán</div>
                  <div className="party-name-new">{contract.sellerName}</div>
                  <div className="party-id-new">ID: {contract.sellerId}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Sản phẩm */}
          <section className="detail-section">
            <div className="section-header-new">
              <i className="bi bi-box section-icon-new"></i>
              <h4>Sản phẩm</h4>
            </div>
            <div className="product-box-new">
              <div className="product-name-new">{contract.productName}</div>
              <div className="product-id-new">ID: {contract.productId}</div>
              <div className="product-desc-new">Mô tả sản phẩm chi tiết sẽ hiển thị tại đây</div>
            </div>
          </section>

          {/* Thanh toán */}
          <section className="detail-section">
            <div className="section-header-new">
              <i className="bi bi-cash-coin section-icon-new"></i>
              <h4>Thanh toán</h4>
            </div>
            <div className="payment-box-new">
              <div className="payment-row-new">
                <span className="payment-label-new">Tổng tiền</span>
                <span className="payment-amount-new">{formatCurrency(contract.agreedPrice)}</span>
              </div>
              <div className={`payment-status-badge-new ${contract.paymentCompleted ? 'paid' : 'unpaid'}`}>
                {contract.paymentCompleted ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </div>
            </div>
          </section>

          {/* Tình trạng ký */}
          <section className="detail-section">
            <div className="section-header-new">
              <i className="bi bi-check-circle section-icon-new"></i>
              <h4>Tình trạng ký</h4>
            </div>
            <div className="signature-grid-new">
              <div className={`signature-box-new ${contract.sellerSigned ? 'signed' : 'unsigned'}`}>
                <div className="signature-icon-new">
                  {contract.sellerSigned ? '✓' : '○'}
                </div>
                <div className="signature-info-new">
                  <div className="signature-role-new">Người bán</div>
                  <div className="signature-status-new">{contract.sellerSigned ? 'Đã ký' : 'Chưa ký'}</div>
                </div>
              </div>
              <div className={`signature-box-new ${contract.buyerSigned ? 'signed' : 'unsigned'}`}>
                <div className="signature-icon-new">
                  {contract.buyerSigned ? '✓' : '○'}
                </div>
                <div className="signature-info-new">
                  <div className="signature-role-new">Người mua</div>
                  <div className="signature-status-new">{contract.buyerSigned ? 'Đã ký' : 'Chưa ký'}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Mốc thời gian */}
          <section className="detail-section">
            <div className="section-header-new">
              <i className="bi bi-clock-history section-icon-new"></i>
              <h4>Mốc thời gian</h4>
            </div>
            <div className="timeline-list-new">
              <div className="timeline-item-new">
                <div className="timeline-dot-new blue"></div>
                <div className="timeline-content-new">
                  <div className="timeline-title-new">Hợp đồng được tạo</div>
                  <div className="timeline-date-new">{formatDate(contract.createdAt)}</div>
                </div>
              </div>
              {contract.sellerSigned && (
                <div className="timeline-item-new">
                  <div className="timeline-dot-new blue"></div>
                  <div className="timeline-content-new">
                    <div className="timeline-title-new">Người bán ký kết</div>
                    <div className="timeline-date-new">{formatDate(contract.updatedAt || contract.createdAt)}</div>
                  </div>
                </div>
              )}
              {contract.buyerSigned && (
                <div className="timeline-item-new">
                  <div className="timeline-dot-new green"></div>
                  <div className="timeline-content-new">
                    <div className="timeline-title-new">Người mua ký kết</div>
                    <div className="timeline-date-new">{formatDate(contract.signedAt || contract.updatedAt)}</div>
                  </div>
                </div>
              )}
              {contract.completedAt && (
                <div className="timeline-item-new">
                  <div className="timeline-dot-new green"></div>
                  <div className="timeline-content-new">
                    <div className="timeline-title-new">Hợp đồng hoàn thành</div>
                    <div className="timeline-date-new">{formatDate(contract.completedAt)}</div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="modal-footer-new">
          <button className="btn-cancel-modal" onClick={onClose}>
            Hủy
          </button>
          {contract.status === 'SIGNED' && contract.contractCode && (
            <button
              className="btn-download-modal"
              onClick={handleDownload}
              disabled={downloading}
            >
              <i className={`bi ${downloading ? 'bi-hourglass-split' : 'bi-download'}`}></i>
              {downloading ? 'Đang tải...' : 'Tải xuống PDF'}
            </button>
          )}
          {canPay && (
            <button
              className="btn-pay-modal"
              onClick={handlePay}
              disabled={loading}
            >
              <i className={`bi ${loading ? 'bi-hourglass-split' : 'bi-credit-card'}`}></i>
              {loading ? 'Đang xử lý...' : 'Thanh toán'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractDetailModal;
