import { useState } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, Phone, Calendar } from "lucide-react";
import { toast } from "react-toastify";


const LoginPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Validation functions
  const validateRegistration = (data) => {
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

    // Kiểm tra số điện thoại phải là số và đủ 10 số
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(data.phone)) {
      return "Số điện thoại phải là số và đủ 10 chữ số";
    }

    // Kiểm tra mật khẩu trên 5 ký tự, có chữ hoa và ký tự đặc biệt
    if (data.password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!/[A-Z]/.test(data.password)) {
      return "Mật khẩu phải có ít nhất 1 chữ hoa";
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(data.password)) {
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
        } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(value)) {
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
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Tài khoản admin mặc định
        if (
          formData.email === "admin@electricrade.com" &&
          formData.password === "admin123"
        ) {
          const adminUser = {
            token: "admin-token-123",
            user: {
              id: 1,
              email: "admin@electricrade.com",
              fullName: "Administrator",
              role: "admin",
            },
          };

          console.log("Admin login data:", adminUser);
          onLogin(adminUser);
          toast.success("Đăng nhập admin thành công!");

          // Thêm delay để đảm bảo state được cập nhật
          setTimeout(() => {
            console.log("Navigating to admin page...");
            navigate("/admin");
          }, 100);
          return;
        }

        // Tài khoản guest mặc định
        if (
          formData.email === "guest@electricrade.com" &&
          formData.password === "guest123"
        ) {
          onLogin({
            token: "guest-token-123",
            user: {
              id: 0,
              email: "guest@electricrade.com",
              fullName: "Guest User",
              role: "user",
            },
          });
          toast.success("Đăng nhập guest thành công!");
          setTimeout(() => navigate("/"), 1000);
          return;
        }

        // Đăng nhập thông thường - kiểm tra localStorage
        const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const user = existingUsers.find(
          (u) => u.email === formData.email && u.password === formData.password
        );

        if (user) {
          onLogin({
            token: `user-token-${user.id}`,
            user: {
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              role: user.role,
            },
          });
          toast.success(`Chào mừng ${user.fullName}! Đăng nhập thành công!`);

          // Chuyển hướng dựa trên role
          if (user.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        } else {
          toast.error("Email hoặc mật khẩu không đúng");
        }
      } else {
        // Đăng ký - hoạt động hoàn toàn ở frontend
        // Validation tất cả các trường
        const validationError = validateRegistration(formData);
        if (validationError) {
          toast.error(validationError);
          setLoading(false);
          return;
        }

        // Kiểm tra email đã tồn tại chưa (trong localStorage)
        const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const userExists = existingUsers.find(
          (user) => user.email === formData.email
        );

        if (userExists) {
          toast.error("Email này đã được sử dụng");
          setLoading(false);
          return;
        }

        // Tạo user mới
        const newUser = {
          id: Date.now(),
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          password: formData.password, // Trong thực tế nên hash password
          role: "guest", // Mặc định role guest
          createdAt: new Date().toISOString(),
        };

        // Lưu user vào localStorage
        existingUsers.push(newUser);
        localStorage.setItem("users", JSON.stringify(existingUsers));

        toast.success(`Chào mừng ${formData.fullName}! Đăng ký thành công!`);
        setTimeout(() => {
          setIsLogin(true);
          setFormData({
            email: formData.email,
            password: "",
            fullName: "",
            phone: "",
            dateOfBirth: "",
            confirmPassword: "",
          });
        }, 1500);
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
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: "500px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "#333" }}
          >
            {isLogin ? "Đăng nhập" : "Đăng ký"}
          </h1>
          <p style={{ color: "#666" }}>
            {isLogin
              ? "Chào mừng bạn quay trở lại!"
              : "Tạo tài khoản mới để bắt đầu"}
          </p>
          {isLogin && (
            <div
              style={{
                backgroundColor: "#e3f2fd",
                padding: "1rem",
                borderRadius: "5px",
                marginTop: "1rem",
                fontSize: "0.9rem",
              }}
            >
              <strong>Tài khoản Admin:</strong>
              <br />
              Email: admin@electricrade.com
              <br />
              Password: admin123
              <br />
              <br />
              {/* <strong>Tài khoản Guest:</strong>
              <br />
              Email: guest@electricrade.com
              <br />
              Password: guest123 */}
            </div>
          )}
        </div>

  {error && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "1rem",
              borderRadius: "5px",
              marginBottom: "1rem",
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
                style={{
                  borderColor: fieldErrors.fullName ? "#e74c3c" : "#ddd",
                  borderWidth: fieldErrors.fullName ? "2px" : "1px",
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
                style={{
                  borderColor: fieldErrors.phone ? "#e74c3c" : "#ddd",
                  borderWidth: fieldErrors.phone ? "2px" : "1px",
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
                style={{
                  paddingRight: "3rem",
                  borderColor: fieldErrors.password ? "#e74c3c" : "#ddd",
                  borderWidth: fieldErrors.password ? "2px" : "1px",
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
                  style={{
                    paddingRight: "3rem",
                    borderColor: fieldErrors.confirmPassword
                      ? "#e74c3c"
                      : "#ddd",
                    borderWidth: fieldErrors.confirmPassword ? "2px" : "1px",
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
              marginBottom: "1rem",
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

        <div style={{ textAlign: "center", margin: "1.5rem 0 0.5rem 0" }}>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              try {
                const credential = credentialResponse?.credential;
                if (!credential) {
                  toast.error("Không nhận được thông tin Google");
                  return;
                }
                const payload = JSON.parse(atob(credential.split('.')[1] || ''));
                const googleUser = {
                  id: payload.sub,
                  email: payload.email,
                  fullName: payload.name,
                  avatar: payload.picture,
                  role: 'user',
                };
                // Auto-register to local users store if not exists
                const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
                const found = existingUsers.find(u => u.email === googleUser.email);
                if (!found) {
                  existingUsers.push({
                    id: googleUser.id,
                    email: googleUser.email,
                    fullName: googleUser.fullName,
                    password: '',
                    role: 'user',
                    createdAt: new Date().toISOString(),
                    provider: 'google'
                  });
                  localStorage.setItem('users', JSON.stringify(existingUsers));
                }
                const loginData = {
                  token: credential,
                  user: googleUser,
                };
                onLogin(loginData);
                toast.success("Đăng nhập Google thành công!");
                setTimeout(() => navigate('/'), 400);
              } catch (e) {
                toast.error("Không thể xử lý thông tin Google");
                console.error(e);
              }
            }}
            onError={() => {
              toast.error("Đăng nhập Google thất bại!");
            }}
            width="100%"
            text={isLogin ? "signin_with" : "signup_with"}
            shape="pill"
            theme="filled_black"
            locale="vi"
          />
          <div style={{ margin: '1rem 0', color: '#aaa', fontWeight: 500 }}>Hoặc</div>
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
                textDecoration: "underline",
                marginLeft: "0.5rem",
              }}
            >
              {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
            </button>
          </p>
        </div>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link to="/" style={{ color: "#667eea", textDecoration: "none" }}>
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
