import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { kycService } from '../../services/kycService';
import KycSubmissionForm from '../../components/kyc/KycSubmissionForm';
import KycStatusCard from '../../components/kyc/KycStatusCard';

const KycPage = ({ user }) => {
  const navigate = useNavigate();
  
  const [currentKyc, setCurrentKyc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadCurrentKyc();
  }, [user, navigate]);

  const loadCurrentKyc = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError('');

    try {
      const result = await kycService.getMyKyc(user.id);
      if (result.success) {
        setCurrentKyc(result.data);
      } else {
        // Nếu chưa có KYC (không phải lỗi thực sự), không hiển thị lỗi
        if (result.notExists || 
            result.message.includes('chưa có KYC') || 
            result.message.includes('KYC_NOT_EXISTED')) {
          setCurrentKyc(null);
          setError(''); // Không hiển thị lỗi khi chưa có KYC
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải thông tin KYC');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSuccess = (kycData) => {
    setCurrentKyc(kycData);
    setShowSubmissionForm(false);
    alert('Submit KYC thành công! Vui lòng chờ duyệt.');
  };

  const handleCancelSubmit = () => {
    setShowSubmissionForm(false);
  };

  const canSubmitNewKyc = () => {
    if (!currentKyc) return true;
    return currentKyc.status === 'REJECTED';
  };

  // Chỉ dành cho member (user), không xử lý staff/admin

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Đang tải thông tin KYC...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Xác thực danh tính (KYC)</h2>
              {canSubmitNewKyc() && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowSubmissionForm(true)}
                >
                  {currentKyc ? 'Submit KYC mới' : 'Submit KYC'}
                </button>
              )}
            </div>

            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            {/* User KYC Section */}
            <div className="row mb-4">
              <div className="col-12">
                {showSubmissionForm ? (
                  <KycSubmissionForm
                    userId={user?.id}
                    onSuccess={handleSubmitSuccess}
                    onCancel={handleCancelSubmit}
                  />
                ) : (
                  <KycStatusCard kycData={currentKyc} />
                )}
              </div>
            </div>

          {/* KYC Information */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5>Thông tin về KYC</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Quy trình KYC:</h6>
                      <ol>
                        <li><strong>Submit:</strong> User upload ảnh CMND/CCCD</li>
                        <li><strong>Staff Review:</strong> Staff kiểm tra và duyệt</li>
                        <li><strong>Admin Review:</strong> Admin duyệt cuối cùng</li>
                        <li><strong>Approved:</strong> User được cấp quyền SELLER</li>
                      </ol>
                    </div>
                    <div className="col-md-6">
                      <h6>Trạng thái KYC:</h6>
                      <ul className="list-unstyled">
                        <li><span className="badge bg-warning">PENDING</span> - Đang chờ duyệt</li>
                        <li><span className="badge bg-info">STAFF_APPROVED</span> - Staff đã duyệt</li>
                        <li><span className="badge bg-danger">REJECTED</span> - Bị từ chối</li>
                        <li><span className="badge bg-success">ADMIN_APPROVED</span> - Admin đã duyệt</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KycPage;
