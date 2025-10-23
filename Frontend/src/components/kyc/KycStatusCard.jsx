import React from 'react';
import { KYC_STATUS_LABELS, KYC_STATUS_COLORS } from '../../services/kycService';

const KycStatusCard = ({ kycData }) => {
  if (!kycData) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <h5 className="card-title">Chưa có KYC</h5>
          <p className="text-muted">Bạn chưa submit KYC nào</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const colorClass = KYC_STATUS_COLORS[status] || 'secondary';
    return (
      <span className={`badge bg-${colorClass}`}>
        {KYC_STATUS_LABELS[status] || status}
      </span>
    );
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'PENDING':
        return 'KYC của bạn đang chờ staff duyệt. Vui lòng chờ thông báo.';
      case 'STAFF_APPROVED':
        return 'Staff đã duyệt KYC của bạn. Đang chờ admin duyệt cuối cùng.';
      case 'ADMIN_APPROVED':
        return 'KYC của bạn đã được duyệt hoàn toàn. Bạn có thể sử dụng đầy đủ chức năng.';
      case 'REJECTED':
        return `KYC của bạn bị từ chối. Lý do: ${kycData.rejectionReason || 'Không rõ'}`;
      default:
        return 'Trạng thái không xác định';
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Trạng thái KYC</h5>
        {getStatusBadge(kycData.status)}
      </div>
      <div className="card-body">
        <p className="card-text">{getStatusMessage(kycData.status)}</p>
        
        {kycData.status === 'REJECTED' && kycData.rejectionReason && (
          <div className="alert alert-danger">
            <strong>Lý do từ chối:</strong> {kycData.rejectionReason}
          </div>
        )}

        <div className="row">
          <div className="col-md-6">
            <h6>Ảnh mặt trước:</h6>
            <img 
              src={kycData.frontImageUrl} 
              alt="Front ID" 
              className="img-fluid rounded"
              style={{ maxHeight: '200px' }}
            />
          </div>
          <div className="col-md-6">
            <h6>Ảnh mặt sau:</h6>
            <img 
              src={kycData.backImageUrl} 
              alt="Back ID" 
              className="img-fluid rounded"
              style={{ maxHeight: '200px' }}
            />
          </div>
        </div>

        <div className="mt-3">
          <small className="text-muted">
            <strong>Ngày tạo:</strong> {new Date(kycData.createdAt).toLocaleString('vi-VN')}
          </small>
          {kycData.updatedAt !== kycData.createdAt && (
            <small className="text-muted ms-3">
              <strong>Cập nhật:</strong> {new Date(kycData.updatedAt).toLocaleString('vi-VN')}
            </small>
          )}
        </div>
      </div>
    </div>
  );
};

export default KycStatusCard;
