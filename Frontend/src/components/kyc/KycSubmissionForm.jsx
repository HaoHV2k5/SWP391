import React, { useState } from 'react';
import { kycService } from '../../services/kycService';

const KycSubmissionForm = ({ userId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    frontImage: null,
    backImage: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (field, file) => {
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, [field]: file }));
      setError('');
    } else {
      setError('Vui lòng chọn file ảnh hợp lệ');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.frontImage || !formData.backImage) {
      setError('Vui lòng chọn đầy đủ ảnh mặt trước và mặt sau');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await kycService.submitKyc(
        userId, 
        formData.frontImage, 
        formData.backImage
      );

      if (result.success) {
        onSuccess?.(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi submit KYC');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kyc-submission-form">
      <h3>Xác thực danh tính (KYC)</h3>
      <p className="text-muted">
        Vui lòng upload ảnh mặt trước và mặt sau của CMND/CCCD để xác thực danh tính
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label className="form-label">Ảnh mặt trước CMND/CCCD *</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => handleImageChange('frontImage', e.target.files[0])}
            required
          />
          {formData.frontImage && (
            <div className="mt-2">
              <img 
                src={URL.createObjectURL(formData.frontImage)} 
                alt="Front preview" 
                style={{ maxWidth: '200px', maxHeight: '150px' }}
                className="img-thumbnail"
              />
            </div>
          )}
        </div>

        <div className="form-group mb-3">
          <label className="form-label">Ảnh mặt sau CMND/CCCD *</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => handleImageChange('backImage', e.target.files[0])}
            required
          />
          {formData.backImage && (
            <div className="mt-2">
              <img 
                src={URL.createObjectURL(formData.backImage)} 
                alt="Back preview" 
                style={{ maxWidth: '200px', maxHeight: '150px' }}
                className="img-thumbnail"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <div className="d-flex gap-2">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || !formData.frontImage || !formData.backImage}
          >
            {loading ? 'Đang xử lý...' : 'Submit KYC'}
          </button>
          <button 
            type="button" 
            className="btn btn-outline-dark"
            onClick={onCancel}
            disabled={loading}
            style={{ 
              borderColor: 'black', 
              color: 'black',
              backgroundColor: 'transparent',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'black';
              e.target.style.color = 'white';
              e.target.style.backgroundColor = 'black';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'black';
              e.target.style.color = 'black';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default KycSubmissionForm;
