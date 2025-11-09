import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { memberService } from '../services/memberService';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error('Thiếu thông tin email. Vui lòng bắt đầu từ trang quên mật khẩu.');
      navigate('/login');
    }
  }, [email, navigate]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.otp) {
      newErrors.otp = 'Mã OTP không được bỏ trống';
    } else if (formData.otp.length < 4) {
      newErrors.otp = 'Mã OTP không hợp lệ';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới không được bỏ trống';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không được bỏ trống';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Thiếu thông tin email');
      return;
    }

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const result = await memberService.resetPassword(
        email,
        formData.newPassword,
        formData.otp
      );

      if (result.success) {
        setSuccess(true);
        toast.success(result.message || 'Đặt lại mật khẩu thành công!');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(result.message || 'Không thể đặt lại mật khẩu. Vui lòng kiểm tra OTP và thử lại.');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đặt lại mật khẩu');
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <CheckCircle size={64} color="#00A86B" style={{ marginBottom: '20px' }} />
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#333' }}>
            Đặt lại mật khẩu thành công!
          </h2>
          <p style={{ margin: '0 0 20px 0', color: '#666' }}>
            Bạn sẽ được chuyển đến trang đăng nhập trong giây lát...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#f0f9f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: '#00A86B'
          }}>
            <Lock size={30} />
          </div>
          <h2 style={{
            margin: '0 0 10px 0',
            fontSize: '24px',
            color: '#333',
            fontWeight: '600'
          }}>
            Đặt lại mật khẩu
          </h2>
          <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
            Mã OTP đã được gửi đến email: <strong>{email}</strong>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* OTP */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Mã OTP *
            </label>
            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              placeholder="Nhập mã OTP từ email"
              maxLength={6}
              style={{
                width: '100%',
                padding: '12px 15px',
                border: `1px solid ${errors.otp ? '#dc3545' : '#ddd'}`,
                borderRadius: '8px',
                outline: 'none',
                boxSizing: 'border-box',
                textAlign: 'center',
                letterSpacing: '8px',
                fontSize: '18px',
                fontWeight: '600'
              }}
              onFocus={() => setErrors(prev => ({ ...prev, otp: '' }))}
            />
            {errors.otp && (
              <p style={{ margin: '5px 0 0 0', color: '#dc3545', fontSize: '12px' }}>
                {errors.otp}
              </p>
            )}
          </div>

          {/* New Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Mật khẩu mới *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                style={{
                  width: '100%',
                  padding: '12px 45px 12px 15px',
                  border: `1px solid ${errors.newPassword ? '#dc3545' : '#ddd'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={() => setErrors(prev => ({ ...prev, newPassword: '' }))}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '5px'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && (
              <p style={{ margin: '5px 0 0 0', color: '#dc3545', fontSize: '12px' }}>
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Xác nhận mật khẩu mới *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu mới"
                style={{
                  width: '100%',
                  padding: '12px 45px 12px 15px',
                  border: `1px solid ${errors.confirmPassword ? '#dc3545' : '#ddd'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={() => setErrors(prev => ({ ...prev, confirmPassword: '' }))}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '5px'
                }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p style={{ margin: '5px 0 0 0', color: '#dc3545', fontSize: '12px' }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                flex: 1,
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
              Quay lại đăng nhập
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
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
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

