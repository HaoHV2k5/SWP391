import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff } from "lucide-react";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Handle registration logic here
      console.log("Registration data:", formData);
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div className="card" style={{ width: "100%", maxWidth: "500px", padding: "1rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <div style={{
            background: "#00A86B",
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 10px",
            color: "white"
          }}>
            <User size={30} />
          </div>
          <h1 style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#00A86B",
            marginBottom: "5px"
          }}>
            Đăng ký tài khoản
          </h1>
          <p style={{
            color: "#666",
            fontSize: "13px"
          }}>
            Tạo tài khoản để mua sắm xe điện và pin
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#333"
            }}>
              Họ và tên *
            </label>
            <div style={{ position: "relative" }}>
              <User 
                size={16} 
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#999"
                }}
              />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Nhập họ và tên"
                style={{
                  width: "100%",
                  padding: "8px 8px 8px 35px",
                  border: `2px solid ${errors.fullName ? "#f44336" : "#e0e0e0"}`,
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.3s ease"
                }}
                onFocus={(e) => {
                  if (!errors.fullName) {
                    e.target.style.borderColor = "#00A86B";
                    e.target.style.boxShadow = "0 0 0 3px rgba(0, 168, 107, 0.1)";
                  }
                }}
                onBlur={(e) => {
                  if (!errors.fullName) {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.boxShadow = "none";
                  }
                }}
              />
            </div>
            {errors.fullName && (
              <p style={{ color: "#f44336", fontSize: "12px", marginTop: "5px" }}>
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#333"
            }}>
              Email *
            </label>
            <div style={{ position: "relative" }}>
              <Mail 
                size={16} 
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#999"
                }}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Nhập email"
                style={{
                  width: "100%",
                  padding: "8px 8px 8px 35px",
                  border: `2px solid ${errors.email ? "#f44336" : "#e0e0e0"}`,
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.3s ease"
                }}
                onFocus={(e) => {
                  if (!errors.email) {
                    e.target.style.borderColor = "#00A86B";
                    e.target.style.boxShadow = "0 0 0 3px rgba(0, 168, 107, 0.1)";
                  }
                }}
                onBlur={(e) => {
                  if (!errors.email) {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.boxShadow = "none";
                  }
                }}
              />
            </div>
            {errors.email && (
              <p style={{ color: "#f44336", fontSize: "12px", marginTop: "5px" }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#333"
            }}>
              Số điện thoại *
            </label>
            <div style={{ position: "relative" }}>
              <Phone 
                size={16} 
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#999"
                }}
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại"
                style={{
                  width: "100%",
                  padding: "8px 8px 8px 35px",
                  border: `2px solid ${errors.phone ? "#f44336" : "#e0e0e0"}`,
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.3s ease"
                }}
                onFocus={(e) => {
                  if (!errors.phone) {
                    e.target.style.borderColor = "#00A86B";
                    e.target.style.boxShadow = "0 0 0 3px rgba(0, 168, 107, 0.1)";
                  }
                }}
                onBlur={(e) => {
                  if (!errors.phone) {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.boxShadow = "none";
                  }
                }}
              />
            </div>
            {errors.phone && (
              <p style={{ color: "#f44336", fontSize: "12px", marginTop: "5px" }}>
                {errors.phone}
              </p>
            )}
          </div>

          {/* Address */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#333"
            }}>
              Địa chỉ *
            </label>
            <div style={{ position: "relative" }}>
              <MapPin 
                size={16} 
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#999"
                }}
              />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ"
                style={{
                  width: "100%",
                  padding: "8px 8px 8px 35px",
                  border: `2px solid ${errors.address ? "#f44336" : "#e0e0e0"}`,
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.3s ease"
                }}
                onFocus={(e) => {
                  if (!errors.address) {
                    e.target.style.borderColor = "#00A86B";
                    e.target.style.boxShadow = "0 0 0 3px rgba(0, 168, 107, 0.1)";
                  }
                }}
                onBlur={(e) => {
                  if (!errors.address) {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.boxShadow = "none";
                  }
                }}
              />
            </div>
            {errors.address && (
              <p style={{ color: "#f44336", fontSize: "12px", marginTop: "5px" }}>
                {errors.address}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#333"
            }}>
              Mật khẩu *
            </label>
            <div style={{ position: "relative" }}>
              <Lock 
                size={16} 
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#999"
                }}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu"
                style={{
                  width: "100%",
                  padding: "12px 45px 12px 45px",
                  border: `2px solid ${errors.password ? "#f44336" : "#e0e0e0"}`,
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.3s ease"
                }}
                onFocus={(e) => {
                  if (!errors.password) {
                    e.target.style.borderColor = "#00A86B";
                    e.target.style.boxShadow = "0 0 0 3px rgba(0, 168, 107, 0.1)";
                  }
                }}
                onBlur={(e) => {
                  if (!errors.password) {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.boxShadow = "none";
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#999"
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p style={{ color: "#f44336", fontSize: "12px", marginTop: "5px" }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: "30px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#333"
            }}>
              Xác nhận mật khẩu *
            </label>
            <div style={{ position: "relative" }}>
              <Lock 
                size={16} 
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#999"
                }}
              />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Xác nhận mật khẩu"
                style={{
                  width: "100%",
                  padding: "12px 45px 12px 45px",
                  border: `2px solid ${errors.confirmPassword ? "#f44336" : "#e0e0e0"}`,
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.3s ease"
                }}
                onFocus={(e) => {
                  if (!errors.confirmPassword) {
                    e.target.style.borderColor = "#00A86B";
                    e.target.style.boxShadow = "0 0 0 3px rgba(0, 168, 107, 0.1)";
                  }
                }}
                onBlur={(e) => {
                  if (!errors.confirmPassword) {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.boxShadow = "none";
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#999"
                }}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p style={{ color: "#f44336", fontSize: "12px", marginTop: "5px" }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button - Nút đăng ký */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: "100%",
              marginBottom: "12px"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#007A4B";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(0, 168, 107, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#00A86B";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 8px rgba(0, 168, 107, 0.2)";
            }}
          >
            Đăng ký tài khoản
          </button>

          {/* Back to Home Link - Link quay về trang chủ */}
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <Link to="/" style={{ 
              color: "#00A86B", 
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.3s ease",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px"
            }}
            onMouseEnter={(e) => {
              e.target.style.color = "#007A4B";
              e.target.style.textDecoration = "underline";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#00A86B";
              e.target.style.textDecoration = "none";
            }}>
              ← Quay về trang chủ
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
