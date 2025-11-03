import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, Phone, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import firebaseAuthService from "../services/firebaseAuthService";
import ForgotPasswordModal from "../components/auth/ForgotPasswordModal";

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Validation functions
  const _validateRegistration = (data) => {
    // Kiểm tra tất cả trường không được bỏ trống
    if (!data.fullName.trim()) {
      return "Họ và tên không được bỏ trống";
    }
    if (!data.email.trim()) {
      return "Email không được bỏ trống";
    }
    if (!data.phone.trim()) {
      return "Số điện thoại không được bỏ trống";
    }
    if (!data.dateOfBirth) {
      return "Ngày sinh không được bỏ trống";
    }
    if (!data.password) {
      return "Mật khẩu không được bỏ trống";
    }
    if (!data.confirmPassword) {
      return "Xác nhận mật khẩu không được bỏ trống";
    }

    // Kiểm tra họ và tên không có ký tự đặc biệt
    const nameRegex =
      /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔưăâêô\s]+$/;
    if (!nameRegex.test(data.fullName)) {
      return "Họ và tên không được chứa ký tự đặc biệt";
    }

    // Kiểm tra số điện thoại theo format Việt Nam
    const phoneRegex = /^(84|0[35789])[0-9]{8}$/;
    if (!phoneRegex.test(data.phone)) {
      return "Số điện thoại phải bắt đầu bằng 84 hoặc 0[3,5,7,8,9] và có 10 chữ số";
    }

    // Kiểm tra mật khẩu trên 5 ký tự, có chữ hoa và ký tự đặc biệt
    if (data.password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!/[A-Z]/.test(data.password)) {
      return "Mật khẩu phải có ít nhất 1 chữ hoa";
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(data.password)) {
      return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt";
    }

    // Kiểm tra xác nhận mật khẩu
    if (data.password !== data.confirmPassword) {
      return "Xác nhận mật khẩu không khớp";
    }

    return null; // Không có lỗi
  };

  // Real-time validation functions
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
    setError("");

    // Real-time validation cho đăng ký
    if (!isLogin) {
      validateField(name, value);
    }
  };

  // Xử lý Google login với Firebase - Đã tạm thời comment
  /*
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      console.log("🔄 Starting Google login...");

      const result = await firebaseAuthService.signInWithGoogle();
      console.log("📋 Google login result:", result);

      if (result.success) {
        console.log("✅ Google login successful!");
        toast.success("Đăng nhập Google thành công!");

        // Gọi onLogin để xử lý redirect
        const userData = {
          token: result.data.token,
          user: result.data
        };
        onLogin(userData);
      } else if (result.cancelled) {
        // User đã hủy đăng nhập, không hiển thị lỗi
        console.log("User cancelled Google login");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Lỗi đăng nhập Google");
    } finally {
      setLoading(false);
    }
  };
  */

  // Xử lý Facebook login với Firebase - Đã tạm thời comment
  /*
  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      console.log("🔄 Starting Facebook login...");

      const result = await firebaseAuthService.signInWithFacebook();
      console.log("📋 Facebook login result:", result);

      if (result.success) {
        console.log("✅ Facebook login successful!");
        toast.success("Đăng nhập Facebook thành công!");

        // Gọi onLogin để xử lý redirect
        const userData = {
          token: result.data.token,
          user: result.data
        };
        
        // Check if user needs to input phone number (after Facebook login)
        // Pass email to parent so App.jsx can show PhoneInputModal if needed
        const userEmail = result.data?.email || result.data?.user?.email;
        const userPhone = result.data?.phone || result.data?.user?.phone;
        if (userEmail && !userPhone) {
          // User logged in via Facebook but no phone number - will show modal in App.jsx
          onLogin(userData, { showPhoneInput: true, email: userEmail });
        } else {
          onLogin(userData);
        }
      } else if (result.cancelled) {
        // User đã hủy đăng nhập, không hiển thị lỗi
        console.log("User cancelled Facebook login");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Facebook login error:", error);
      toast.error("Lỗi đăng nhập Facebook");
    } finally {
      setLoading(false);
    }
  };
  */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Admin login sẽ được xử lý bởi backend API

        // Đăng nhập thông thường - gọi API backend
        try {
          const response = await fetch("http://localhost:3979/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: formData.email, // Gửi email như username
              password: formData.password,
            }),
          });

          const data = await response.json();
          console.log("🔍 Login response:", data);
          console.log("🔍 Response status:", response.status);

          if (data.code === 1000 && data.data.authenticated) {
            // Sử dụng thông tin user từ backend
            const backendUser = data.data.user;
            console.log("🔍 Backend user data:", backendUser);

            // Xác định role từ JWT token scope
            let userRole = "member"; // default role
            console.log("🔍 Backend user data:", backendUser);
            console.log("🔍 Token:", data.data.token);

            // Decode JWT token để lấy scope (roles)
            try {
              const tokenParts = data.data.token.split(".");
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log("🔍 JWT payload:", payload);

              if (payload.scope) {
                const scopes = payload.scope.split(" ");
                console.log("🔍 JWT scopes:", scopes);

                // Tìm role trong scopes
                const roleScope = scopes.find((scope) =>
                  scope.startsWith("ROLE_")
                );
                if (roleScope) {
                  userRole = roleScope; // Giữ nguyên format ROLE_XXX
                  console.log("🔍 Detected role from JWT scope:", userRole);
                }
              }
            } catch (error) {
              console.error("🔍 Error decoding JWT:", error);
            }

            // Chuẩn hóa role name (JWT trả về format ROLE_XXX)
            if (userRole === "ROLE_ADMIN") {
              userRole = "ROLE_ADMIN";
            } else if (userRole === "ROLE_STAFF") {
              userRole = "ROLE_STAFF";
            } else if (userRole === "ROLE_USER") {
              userRole = "member"; // Convert ROLE_USER to member for frontend
            } else if (formData.email === "admin@gmail.com") {
              // Fallback: nếu là admin email nhưng role không được detect đúng
              console.log(
                "🔍 Fallback: Admin email detected, forcing admin role"
              );
              userRole = "ROLE_ADMIN";
            } else {
              userRole = "member";
            }

            console.log("🔍 Final user role:", userRole);

            const userData = {
              token: data.data.token,
              refreshToken: data.data.refreshToken, // Lưu refreshToken từ backend
              user: {
                id: backendUser?.id || 0,
                email: backendUser?.email || formData.email,
                username:
                  backendUser?.username || backendUser?.email || formData.email,
                fullName:
                  backendUser?.fullname ||
                  backendUser?.fullName ||
                  "Người dùng",
                role: userRole,
                roles: backendUser?.roles || [],
              },
            };

            console.log("🔍 Calling onLogin with userData:", userData);
            onLogin(userData);
            console.log("✅ onLogin called successfully");

            // Navigate dựa trên role thực tế từ backend
            if (userRole === "ROLE_ADMIN") {
              toast.success("Đăng nhập admin thành công!");
              navigate("/admin");
            } else if (userRole === "ROLE_STAFF") {
              toast.success("Đăng nhập staff thành công!");
              navigate("/staff");
            } else {
              toast.success("Đăng nhập thành công!");
              navigate("/");
            }
          } else {
            console.error("❌ Login failed:", data);
            toast.error(data.message || "Email hoặc mật khẩu không đúng");
          }
        } catch (error) {
          console.error("Login error:", error);
          toast.error("Lỗi kết nối server");
        }
      } else {
        // Đăng ký - gọi API backend
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
              gender: "Nam", // Giá trị mặc định
              address: "Địa chỉ mặc định", // Giá trị mặc định
            }),
          });

          const data = await response.json();
          console.log("🔍 Register response:", data);
          console.log("🔍 Response status:", response.status);
          console.log("🔍 Response headers:", response.headers);
          console.log("🔍 Request body:", {
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            fullname: formData.fullName,
            phone: formData.phone,
            yob: formData.dateOfBirth
              ? new Date(formData.dateOfBirth).toISOString().split("T")[0]
              : "1990-01-01",
            gender: "Nam",
            address: "Địa chỉ mặc định",
          });

          if (
            response.ok &&
            data.message &&
            data.message.includes("Check your email")
          ) {
            toast.success(
              "Đăng ký thành công! Vui lòng kiểm tra email để xác thực OTP."
            );
            // Redirect đến trang OTP verification
            navigate("/verify-otp", {
              state: { email: formData.email },
            });
          } else {
            console.error("❌ Register failed:", data);
            toast.error(
              data.message || `Đăng ký thất bại! (${response.status})`
            );
          }
        } catch (error) {
          console.error("❌ Register error:", error);
          toast.error("Lỗi kết nối server");
        }
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <style>
        {`
          .card input, .card select {
            background-color: #fff !important;
            border: 1px solid #e0e0e0 !important;
            transition: border-color 0.3s ease;
          }
          
          .card input:focus, .card select:focus {
            border-color: #667eea !important;
            outline: none;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
          
          .card .input-visible {
            color: #333 !important;
            background-color: #fff !important;
          }
          
          .card input::placeholder {
            color: rgba(0, 0, 0, 0.4) !important;
          }
          
          .card label {
            color: #333 !important;
            font-weight: 500;
          }
          
          .card .error {
            color: #ff6b6b !important;
          }
          
          .card button {
            background: linear-gradient(135deg, #00A86B 0%, #2BB673 100%) !important;
            border: none !important;
            color: white !important;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          
          .card button:hover {
            background: linear-gradient(135deg, #009057 0%, #00A86B 100%) !important;
            opacity: 0.95;
          }
          
          .card .google-login {
            background: rgba(66, 133, 244, 0.1) !important;
            border: 1px solid rgba(66, 133, 244, 0.3) !important;
            color: #4285f4 !important;
          }
          
          .card .google-login:hover {
            background: rgba(66, 133, 244, 0.2) !important;
          }
          
          .card .divider {
            color: #666 !important;
          }
          
          .card .divider::before,
          .card .divider::after {
            background: rgba(0, 0, 0, 0.2) !important;
          }
          
          .card .link {
            color: #00A86B !important;
          }
          
          .card .link:hover {
            color: #2BB673 !important;
          }
          
          .card .form-group {
            margin-bottom: 1rem !important;
          }
        `}
      </style>
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "500px",
          position: "relative",
          zIndex: 10,
          background: "#ffffff",
          border: "1px solid #e0e0e0",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "12px",
          padding: "2rem",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h1
            style={{
              fontSize: "2rem",
              marginBottom: "0.25rem",
              color: "#333",
              fontWeight: "700",
            }}
          >
            {isLogin ? "Đăng nhập" : "Đăng ký"}
          </h1>
          <p
            style={{
              color: "#666",
              fontSize: "1rem",
              fontWeight: "500",
              margin: "0",
            }}
          >
            {isLogin
              ? "Chào mừng bạn quay trở lại!"
              : "Tạo tài khoản mới để bắt đầu"}
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "0.75rem",
              border: "1px solid #f5c6cb",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="fullName">
                <User size={16} className="inline-block mr-1" />
                Họ và tên
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required={!isLogin}
                placeholder="Nhập họ và tên"
                className="input-visible"
                style={{
                  borderColor: fieldErrors.fullName ? "#e74c3c" : "#ddd",
                  borderWidth: fieldErrors.fullName ? "2px" : "1px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  transition: "border-color 0.3s ease",
                }}
              />
              {fieldErrors.fullName && (
                <div
                  style={{
                    color: "#e74c3c",
                    fontSize: "0.875rem",
                    marginTop: "0.25rem",
                  }}
                >
                  {fieldErrors.fullName}
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              <Mail size={16} className="inline-block mr-1" />
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Nhập email"
              className="input-visible"
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                fontSize: "16px",
                border: "1px solid #ddd",
                outline: "none",
                transition: "border-color 0.3s ease",
                width: "100%",
              }}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="phone">
                <Phone size={16} className="inline-block mr-1" />
                Số điện thoại
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required={!isLogin}
                placeholder="Nhập số điện thoại"
                className="input-visible"
                style={{
                  borderColor: fieldErrors.phone ? "#e74c3c" : "#ddd",
                  borderWidth: fieldErrors.phone ? "2px" : "1px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  transition: "border-color 0.3s ease",
                  width: "100%",
                }}
              />
              {fieldErrors.phone && (
                <div
                  style={{
                    color: "#e74c3c",
                    fontSize: "0.875rem",
                    marginTop: "0.25rem",
                  }}
                >
                  {fieldErrors.phone}
                </div>
              )}
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="dateOfBirth">
                <Calendar size={16} className="inline-block mr-1" />
                Ngày sinh
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required={!isLogin}
                className="input-visible"
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  border: "1px solid #ddd",
                  outline: "none",
                  transition: "border-color 0.3s ease",
                  width: "100%",
                }}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={16} className="inline-block mr-1" />
              Mật khẩu
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Nhập mật khẩu"
                className="input-visible"
                style={{
                  paddingRight: "3rem",
                  borderColor: fieldErrors.password ? "#e74c3c" : "#ddd",
                  borderWidth: fieldErrors.password ? "2px" : "1px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  transition: "border-color 0.3s ease",
                  width: "100%",
                }}
              />
              {fieldErrors.password && (
                <div
                  style={{
                    color: "#e74c3c",
                    fontSize: "0.875rem",
                    marginTop: "0.25rem",
                  }}
                >
                  {fieldErrors.password}
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#666",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "24px",
                  height: "24px",
                  padding: "0",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">
                <Lock size={16} className="inline-block mr-1" />
                Xác nhận mật khẩu
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLogin}
                  placeholder="Nhập lại mật khẩu"
                  className="input-visible"
                  style={{
                    paddingRight: "3rem",
                    borderColor: fieldErrors.confirmPassword
                      ? "#e74c3c"
                      : "#ddd",
                    borderWidth: fieldErrors.confirmPassword ? "2px" : "1px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    transition: "border-color 0.3s ease",
                    width: "100%",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#666",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "24px",
                    height: "24px",
                    padding: "0",
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <div
                  style={{
                    color: "#e74c3c",
                    fontSize: "0.875rem",
                    marginTop: "0.25rem",
                  }}
                >
                  {fieldErrors.confirmPassword}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: "100%",
              marginBottom: "0.75rem",
              opacity:
                !isLogin && Object.keys(fieldErrors).length > 0 ? 0.6 : 1,
              cursor:
                !isLogin && Object.keys(fieldErrors).length > 0
                  ? "not-allowed"
                  : "pointer",
            }}
            disabled={
              loading || (!isLogin && Object.keys(fieldErrors).length > 0)
            }
          >
            {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>


        {/* Google và Facebook login tạm thời bị comment */}
        {false && (
          <div style={{ textAlign: "center", margin: "1rem 0 0.5rem 0" }}>
          <button
            onClick={() => {}}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 24px",
              backgroundColor: "#4285f4",
              color: "white",
              border: "none",
              borderRadius: "25px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.3s ease",
              marginBottom: "0.75rem",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#3367d6";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#4285f4";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLogin ? "Đăng nhập với Google" : "Đăng ký với Google"}
          </button>

          <button
            onClick={() => {}}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 24px",
              backgroundColor: "#1877f2",
              color: "white",
              border: "none",
              borderRadius: "25px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.3s ease",
              marginBottom: "0.75rem",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#166fe5";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#1877f2";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {isLogin ? "Đăng nhập với Facebook" : "Đăng ký với Facebook"}
          </button>

          <div style={{ margin: "0.75rem 0", color: "#aaa", fontWeight: 500 }}>
            Hoặc
          </div>
          <p style={{ color: "#666" }}>
            {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setFieldErrors({});
                setFormData({
                  email: "",
                  password: "",
                  fullName: "",
                  phone: "",
                  dateOfBirth: "",
                  confirmPassword: "",
                });
              }}
              style={{
                background: "none",
                border: "none",
                color: "#667eea",
                cursor: "pointer",
                textDecoration: "none",
                marginLeft: "0.5rem",
              }}
            >
              {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
            </button>
          </p>
          </div>
        )}

        <p style={{ color: "#666", textAlign: "center", marginTop: "1.5rem" }}>
          {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setFieldErrors({});
              setFormData({
                email: "",
                password: "",
                fullName: "",
                phone: "",
                dateOfBirth: "",
                confirmPassword: "",
              });
            }}
            style={{
              background: "linear-gradient(135deg, #00A86B 0%, #2BB673 100%)",
              border: "none",
              color: "white",
              cursor: "pointer",
              textDecoration: "none",
              fontWeight: "500",
              padding: "8px 20px",
              fontSize: "14px",
              borderRadius: "8px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "linear-gradient(135deg, #007A4B 0%, #22995A 100%)";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(0, 168, 107, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "linear-gradient(135deg, #00A86B 0%, #2BB673 100%)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
          </button>
        </p>

        <div style={{ textAlign: "center", marginTop: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
          <Link
            to="/"
            style={{
              color: "#667eea",
              textDecoration: "none",
              fontWeight: "500",
              transition: "color 0.3s ease",
              fontSize: "0.95rem",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#764ba2")}
            onMouseLeave={(e) => (e.target.style.color = "#667eea")}
          >
            ← Quay về trang chủ
          </Link>
          {isLogin && (
            <span style={{ color: "#666" }}>|</span>
          )}
          {isLogin && (
            <button
              onClick={() => setShowForgotPassword(true)}
              style={{
                background: "none",
                border: "none",
                color: "#00A86B",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                textDecoration: "none",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#007A4B")}
              onMouseLeave={(e) => (e.target.style.color = "#00A86B")}
            >
              Quên mật khẩu?
            </button>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        show={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSuccess={(email) => {
          // Navigate to reset password page with email
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }}
      />
    </div>
  );
};

export default LoginPage;
