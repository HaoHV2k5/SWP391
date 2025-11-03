import React, { useState } from 'react';
import { X, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { memberService } from '../../services/memberService';

const ForgotPasswordModal = ({ show, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      console.log('📧 Sending forgot password request for email:', email);
      const result = await memberService.forgotPassword(email);
      console.log('📧 Forgot password result:', result);

      if (result.success) {
        toast.success(result.message || 'Đã gửi OTP đến email của bạn!');
        if (onSuccess) {
          onSuccess(result.email || email); // Pass email to parent for reset password page
        }
        setEmail('');
        onClose();
      } else {
        const errorMsg = result.message || 'Không thể gửi OTP. Vui lòng thử lại.';
        setError(errorMsg);
        toast.error(errorMsg);
        console.error('❌ Forgot password failed:', result);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      'Có lỗi xảy ra khi gửi OTP. Vui lòng kiểm tra kết nối và thử lại.';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('❌ Forgot password error:', {
        error,
        response: error.response,
        data: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

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
          <h2 style={{
            margin: '0 0 10px 0',
            fontSize: '24px',
            color: '#333',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Mail size={24} />
            Quên mật khẩu
          </h2>
          <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
            Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="Nhập email của bạn"
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
              Hủy
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
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi OTP'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;

