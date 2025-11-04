import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, Phone, MapPin, Calendar } from "lucide-react";
import { toast } from "react-toastify";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focused, setFocused] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    dateOfBirth: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Real-time validation
    validateField(name, value);
  };

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };

    switch (name) {
      case "fullName":
        if (!value.trim()) {
          errors.fullName = "Họ và tên không được bỏ trống";
        } else if (
          !/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔưăâêô\s]+$/.test(
            value
          )
        ) {
          errors.fullName = "Họ và tên không được chứa ký tự đặc biệt";
        } else {
          delete errors.fullName;
        }
        break;

      case "phone":
        if (!value.trim()) {
          errors.phone = "Số điện thoại không được bỏ trống";
        } else if (!/^[0-9]{10}$/.test(value)) {
          errors.phone = "Số điện thoại phải là số và đủ 10 chữ số";
        } else {
          delete errors.phone;
        }
        break;

      case "password":
        if (!value) {
          errors.password = "Mật khẩu không được bỏ trống";
        } else if (value.length < 6) {
          errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        } else if (!/[A-Z]/.test(value)) {
          errors.password = "Mật khẩu phải có ít nhất 1 chữ hoa";
        } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
          errors.password = "Mật khẩu phải có ít nhất 1 ký tự đặc biệt";
        } else {
          delete errors.password;
        }
        break;

      case "confirmPassword":
        if (!value) {
          errors.confirmPassword = "Xác nhận mật khẩu không được bỏ trống";
        } else if (value !== formData.password) {
          errors.confirmPassword = "Xác nhận mật khẩu không khớp";
        } else {
          delete errors.confirmPassword;
        }
        break;

      default:
        break;
    }

    setFieldErrors(errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3979/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          fullname: formData.fullName,
          phone: formData.phone,
          yob: formData.dateOfBirth
            ? (() => {
                const date = new Date(formData.dateOfBirth);
                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
              })()
            : "01/01/1990",
          gender: "Nam",
          address: "Địa chỉ mặc định",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          "Đăng ký thành công! Vui lòng kiểm tra email để xác thực OTP."
        );
        navigate("/verify-otp", {
          state: { email: formData.email },
        });
      } else {
        const errorMsg = data?.message || `Đăng ký thất bại! (${response.status})`;
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("❌ Register error:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '1.5rem 2rem',
      overflowY: 'auto',
      background: '#ffffff'
    }} className="register-form-container">
      <div style={{
        maxWidth: '28rem',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            display: 'inline-block',
            padding: '0.2rem 0.625rem',
            background: '#dcfce7',
            borderRadius: '9999px',
            marginBottom: '0.5rem'
          }}>
            <span style={{
              color: '#15803d',
              fontSize: '0.75rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <span style={{
                width: '0.4rem',
                height: '0.4rem',
                background: '#16a34a',
                borderRadius: '9999px'
              }}></span>
              Tạo tài khoản mới
            </span>
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.25rem'
          }}>Đăng ký tài khoản</h1>
          <p style={{
            color: '#6b7280',
            fontSize: '0.875rem',
            marginBottom: 0
          }}>Tạo tài khoản để mua sắm xe điện và pin</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Full Name */}
          <div>
            <label style={{
              fontSize: '0.8125rem',
              fontWeight: '500',
              color: '#374151',
              display: 'block',
              marginBottom: '0.375rem'
            }}>Họ và tên *</label>
            <div style={{ position: 'relative' }}>
              <User style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1.125rem',
                height: '1.125rem',
                color: focused === "fullName" ? '#16a34a' : '#9ca3af'
              }} />
              <input
                type="text"
                name="fullName"
                placeholder="Nhập họ và tên"
                value={formData.fullName}
                onChange={handleInputChange}
                onFocus={() => setFocused("fullName")}
                onBlur={() => setFocused(null)}
                required
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  paddingRight: '1rem',
                  paddingTop: '0.625rem',
                  paddingBottom: '0.625rem',
                  border: `1px solid ${fieldErrors.fullName ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
                className="register-input"
              />
            </div>
            {fieldErrors.fullName && (
              <div style={{
                color: '#ef4444',
                fontSize: '0.75rem',
                marginTop: '0.2rem'
              }}>{fieldErrors.fullName}</div>
            )}
          </div>

          {/* Email */}
          <div>
            <label style={{
              fontSize: '0.8125rem',
              fontWeight: '500',
              color: '#374151',
              display: 'block',
              marginBottom: '0.375rem'
            }}>Email *</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1.125rem',
                height: '1.125rem',
                color: focused === "email" ? '#16a34a' : '#9ca3af'
              }} />
              <input
                type="email"
                name="email"
                placeholder="Nhập email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                required
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  paddingRight: '1rem',
                  paddingTop: '0.625rem',
                  paddingBottom: '0.625rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
                className="register-input"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label style={{
              fontSize: '0.8125rem',
              fontWeight: '500',
              color: '#374151',
              display: 'block',
              marginBottom: '0.375rem'
            }}>Số điện thoại *</label>
            <div style={{ position: 'relative' }}>
              <Phone style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1.125rem',
                height: '1.125rem',
                color: focused === "phone" ? '#16a34a' : '#9ca3af'
              }} />
              <input
                type="tel"
                name="phone"
                placeholder="Nhập số điện thoại"
                value={formData.phone}
                onChange={handleInputChange}
                onFocus={() => setFocused("phone")}
                onBlur={() => setFocused(null)}
                required
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  paddingRight: '1rem',
                  paddingTop: '0.625rem',
                  paddingBottom: '0.625rem',
                  border: `1px solid ${fieldErrors.phone ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
                className="register-input"
              />
            </div>
            {fieldErrors.phone && (
              <div style={{
                color: '#ef4444',
                fontSize: '0.75rem',
                marginTop: '0.2rem'
              }}>{fieldErrors.phone}</div>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label style={{
              fontSize: '0.8125rem',
              fontWeight: '500',
              color: '#374151',
              display: 'block',
              marginBottom: '0.375rem'
            }}>Ngày sinh *</label>
            <div style={{ position: 'relative' }}>
              <Calendar style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1.125rem',
                height: '1.125rem',
                color: focused === "dateOfBirth" ? '#16a34a' : '#9ca3af'
              }} />
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                onFocus={() => setFocused("dateOfBirth")}
                onBlur={() => setFocused(null)}
                required
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  paddingRight: '1rem',
                  paddingTop: '0.625rem',
                  paddingBottom: '0.625rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
                className="register-input"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{
              fontSize: '0.8125rem',
              fontWeight: '500',
              color: '#374151',
              display: 'block',
              marginBottom: '0.375rem'
            }}>Mật khẩu *</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1.125rem',
                height: '1.125rem',
                color: focused === "password" ? '#16a34a' : '#9ca3af'
              }} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                required
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  paddingRight: '3rem',
                  paddingTop: '0.625rem',
                  paddingBottom: '0.625rem',
                  border: `1px solid ${fieldErrors.password ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
                className="register-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff style={{ width: '1.125rem', height: '1.125rem' }} /> : <Eye style={{ width: '1.125rem', height: '1.125rem' }} />}
              </button>
            </div>
            {fieldErrors.password && (
              <div style={{
                color: '#ef4444',
                fontSize: '0.75rem',
                marginTop: '0.2rem'
              }}>{fieldErrors.password}</div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{
              fontSize: '0.8125rem',
              fontWeight: '500',
              color: '#374151',
              display: 'block',
              marginBottom: '0.375rem'
            }}>Xác nhận mật khẩu *</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1.125rem',
                height: '1.125rem',
                color: focused === "confirmPassword" ? '#16a34a' : '#9ca3af'
              }} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onFocus={() => setFocused("confirmPassword")}
                onBlur={() => setFocused(null)}
                required
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  paddingRight: '3rem',
                  paddingTop: '0.625rem',
                  paddingBottom: '0.625rem',
                  border: `1px solid ${fieldErrors.confirmPassword ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
                className="register-input"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: 0
                }}
              >
                {showConfirmPassword ? <EyeOff style={{ width: '1.125rem', height: '1.125rem' }} /> : <Eye style={{ width: '1.125rem', height: '1.125rem' }} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <div style={{
                color: '#ef4444',
                fontSize: '0.75rem',
                marginTop: '0.2rem'
              }}>{fieldErrors.confirmPassword}</div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || Object.keys(fieldErrors).length > 0}
            style={{
              width: '100%',
              paddingTop: '0.625rem',
              paddingBottom: '0.625rem',
              background: '#16a34a',
              color: 'white',
              fontWeight: '600',
              borderRadius: '0.5rem',
              border: 'none',
              marginTop: '1rem',
              fontSize: '0.9375rem',
              cursor: isLoading || Object.keys(fieldErrors).length > 0 ? 'not-allowed' : 'pointer',
              opacity: isLoading || Object.keys(fieldErrors).length > 0 ? 0.6 : 1,
              transition: 'all 0.3s'
            }}
            className="register-submit-btn"
            onMouseEnter={(e) => {
              if (!isLoading && Object.keys(fieldErrors).length === 0) {
                e.currentTarget.style.background = '#15803d';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = '#16a34a';
              }
            }}
          >
            {isLoading ? "Đang xử lý..." : "Đăng ký tài khoản"}
          </button>
        </form>

        {/* Login Link */}
        <div style={{
          marginTop: '1rem',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#6b7280',
            fontSize: '0.875rem',
            marginBottom: 0
          }}>
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              style={{
                color: '#16a34a',
                fontWeight: '600',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#15803d';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#16a34a';
              }}
            >
              Đăng nhập
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <Link
            to="/"
            style={{
              fontSize: '0.8125rem',
              color: '#6b7280',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#111827';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#6b7280';
            }}
          >
            ← Quay về trang chủ
          </Link>
        </div>
      </div>

      {/* CSS */}
      <style>{`
        .register-input:focus {
          border-color: #16a34a !important;
          outline: none;
        }
        
        .register-input:hover {
          border-color: #9ca3af;
        }
        
        .register-form-container {
          width: 100%;
        }
        
        @media (min-width: 768px) {
          .register-form-container {
            width: 50% !important;
          }
        }
      `}</style>
    </div>
  );
}

