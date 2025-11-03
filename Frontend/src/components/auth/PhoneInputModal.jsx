import React, { useState } from 'react';
import { X, Phone, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { memberService } from '../../services/memberService';

const PhoneInputModal = ({ show, onClose, email, onSuccess }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validatePhone = (phone) => {
    // Phone format: ^(84|0[35789])[0-9]{8}\b
    const phoneRegex = /^(84|0[35789])[0-9]{8}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Số điện thoại không hợp lệ. Phải bắt đầu bằng 84 hoặc 0[3,5,7,8,9] và có 10 chữ số');
      return;
    }

    if (!email) {
      setError('Thiếu thông tin email');
      return;
    }

    setLoading(true);
    try {
      const result = await memberService.inputPhoneAfterFacebook(phone, email);

      if (result.success) {
        setSuccess(true);
        toast.success(result.message || 'Cập nhật số điện thoại thành công!');
        
        if (onSuccess) {
          onSuccess(result.data);
        }

        // Auto close after 2 seconds
        setTimeout(() => {
          setSuccess(false);
          setPhone('');
          onClose();
        }, 2000);
      } else {
        setError(result.message || 'Không thể cập nhật số điện thoại');
        toast.error(result.message || 'Không thể cập nhật số điện thoại');
      }
    } catch (error) {
      const errorMsg = 'Có lỗi xảy ra khi cập nhật số điện thoại';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Phone input error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  if (success) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          width: '90%',
          maxWidth: '450px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          <CheckCircle size={64} color="#00A86B" style={{ marginBottom: '20px' }} />
          <h2 style={{
            margin: '0 0 10px 0',
            fontSize: '24px',
            color: '#333',
            fontWeight: '600'
          }}>
            Cập nhật thành công!
          </h2>
          <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
            Số điện thoại của bạn đã được cập nhật
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        width: '90%',
        maxWidth: '450px',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666'
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#f0f9f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '15px',
            color: '#00A86B'
          }}>
            <Phone size={24} />
          </div>
          <h2 style={{
            margin: '0 0 10px 0',
            fontSize: '24px',
            color: '#333',
            fontWeight: '600'
          }}>
            Nhập số điện thoại
          </h2>
          <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
            Vui lòng nhập số điện thoại của bạn để hoàn tất đăng ký
          </p>
          {email && (
            <p style={{ margin: '10px 0 0 0', color: '#999', fontSize: '12px' }}>
              Email: {email}
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Số điện thoại *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, '')); // Chỉ cho phép số
                setError('');
              }}
              placeholder="Ví dụ: 0987654321 hoặc 84987654321"
              maxLength={11}
              style={{
                width: '100%',
                padding: '12px 15px',
                border: `1px solid ${error ? '#dc3545' : '#ddd'}`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={() => setError('')}
            />
            {error && (
              <p style={{ margin: '5px 0 0 0', color: '#dc3545', fontSize: '12px' }}>
                {error}
              </p>
            )}
            <p style={{ margin: '5px 0 0 0', color: '#999', fontSize: '12px' }}>
              Định dạng: 84xxxxxxxx hoặc 0[3,5,7,8,9]xxxxxxxx (10 chữ số)
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#333',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
              disabled={loading}
            >
              Bỏ qua
            </button>
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#00A86B',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: loading ? 0.7 : 1
              }}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhoneInputModal;

