import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Zap } from "lucide-react";
import { toast } from "react-toastify";
import ForgotPasswordModal from "../auth/ForgotPasswordModal";

export default function LoginForm({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3979/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      const data = await response.json();
      console.log("🔍 Login response:", data);

      if (data.code === 1000 && data.data.authenticated) {
        const backendUser = data.data.user;
        let userRole = "member";

        // Decode JWT token để lấy scope (roles)
        try {
          const tokenParts = data.data.token.split(".");
          const payload = JSON.parse(atob(tokenParts[1]));

          if (payload.scope) {
            const scopes = payload.scope.split(" ");
            const roleScope = scopes.find((scope) => scope.startsWith("ROLE_"));
            if (roleScope) {
              userRole = roleScope;
            }
          }
        } catch (error) {
          console.error("🔍 Error decoding JWT:", error);
        }

        // Chuẩn hóa role name
        if (userRole === "ROLE_ADMIN") {
          userRole = "ROLE_ADMIN";
        } else if (userRole === "ROLE_STAFF") {
          userRole = "ROLE_STAFF";
        } else if (userRole === "ROLE_USER") {
          userRole = "member";
        } else if (email === "admin@gmail.com") {
          userRole = "ROLE_ADMIN";
        } else {
          userRole = "member";
        }

        const userData = {
          token: data.data.token,
          refreshToken: data.data.refreshToken,
          user: {
            id: backendUser?.id || 0,
            email: backendUser?.email || email,
            username: backendUser?.username || backendUser?.email || email,
            fullName: backendUser?.fullname || backendUser?.fullName || "Người dùng",
            role: userRole,
            roles: backendUser?.roles || [],
          },
        };

        onLogin(userData);

        // Navigate dựa trên role
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
        toast.error(data.message || "Email hoặc mật khẩu không đúng");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1.5rem 1.5rem 3rem',
      background: 'linear-gradient(to bottom right, #f8fafc, #dbeafe)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '28rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        {/* Logo - visible on mobile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '2rem'
        }} className="mobile-logo">
          <img 
            src="/logo.jpg" 
            alt="GREENLOOP Logo"
            style={{
              width: '4rem',
              height: '4rem',
              objectFit: 'contain',
              borderRadius: '0rem'
            }}
          />
          <div>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#1e3a8a'
            }}>GREENLOOP</span>
            <p style={{
              fontSize: '0.75rem',
              color: '#16a34a',
              fontWeight: '600',
              marginTop: '-0.25rem',
              marginBottom: 0
            }}>Electric Store</p>
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            margin: '0 auto',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(to right, #dcfce7, #dbeafe)',
            borderRadius: '9999px',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#15803d',
            marginBottom: '1rem',
            border: '1px solid #bbf7d0'
          }}>
            <span style={{
              width: '0.5rem',
              height: '0.5rem',
              background: '#16a34a',
              borderRadius: '9999px'
            }}></span>
            Đăng nhập vào tài khoản
          </div>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 'bold',
            color: '#1e3a8a',
            marginBottom: '0.5rem'
          }}>Chào bạn!</h1>
          <p style={{
            color: '#64748b',
            fontSize: '1rem',
            marginBottom: 0
          }}>Nhập thông tin để tiếp tục bán, trao đổi xe điện và pin</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Email Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="email" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#1e3a8a'
            }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1.25rem',
                height: '1.25rem',
                transition: 'all 0.3s',
                color: focused === "email" ? '#16a34a' : '#94a3b8'
              }} />
              <input
                id="email"
                type="email"
                placeholder="example@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                required
                style={{
                  width: '100%',
                  paddingLeft: '3rem',
                  paddingRight: '1rem',
                  paddingTop: '0.875rem',
                  paddingBottom: '0.875rem',
                  borderRadius: '0.75rem',
                  border: `2px solid ${focused === "email" ? '#22c55e' : '#cbd5e1'}`,
                  background: 'white',
                  color: '#1e3a8a',
                  outline: 'none',
                  transition: 'all 0.3s',
                  fontSize: '1rem',
                  boxShadow: focused === "email" ? '0 0 0 4px rgba(34, 197, 94, 0.1)' : 'none'
                }}
                className="login-input"
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1e3a8a'
              }}>
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#16a34a',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#15803d'}
                onMouseLeave={(e) => e.target.style.color = '#16a34a'}
              >
                Quên mật khẩu?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1.25rem',
                height: '1.25rem',
                transition: 'all 0.3s',
                color: focused === "password" ? '#16a34a' : '#94a3b8'
              }} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                required
                style={{
                  width: '100%',
                  paddingLeft: '3rem',
                  paddingRight: '3rem',
                  paddingTop: '0.875rem',
                  paddingBottom: '0.875rem',
                  borderRadius: '0.75rem',
                  border: `2px solid ${focused === "password" ? '#22c55e' : '#cbd5e1'}`,
                  background: 'white',
                  color: '#1e3a8a',
                  outline: 'none',
                  transition: 'all 0.3s',
                  fontSize: '1rem',
                  boxShadow: focused === "password" ? '0 0 0 4px rgba(34, 197, 94, 0.1)' : 'none'
                }}
                className="login-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  transition: 'color 0.3s',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#64748b'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff style={{ width: '1.25rem', height: '1.25rem' }} /> : <Eye style={{ width: '1.25rem', height: '1.25rem' }} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              paddingTop: '0.875rem',
              paddingBottom: '0.875rem',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '0.75rem',
              background: 'linear-gradient(to right, #22c55e, #16a34a)',
              color: 'white',
              border: 'none',
              boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.3)',
              transition: 'all 0.3s',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            className="login-submit-btn"
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'linear-gradient(to right, #16a34a, #15803d)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(34, 197, 94, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'linear-gradient(to right, #22c55e, #16a34a)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(34, 197, 94, 0.3)';
              }
            }}
          >
            {isLoading ? (
              <>
                <span style={{
                  width: '1rem',
                  height: '1rem',
                  borderRadius: '50%',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  animation: 'spin 1s linear infinite'
                }}></span>
                Đang đăng nhập...
              </>
            ) : (
              <>
                Đăng nhập
                <ArrowRight style={{ width: '1rem', height: '1rem' }} className="arrow-icon" />
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <p style={{
          textAlign: 'center',
          color: '#64748b',
          paddingTop: '1rem',
          marginBottom: 0
        }}>
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            style={{
              fontWeight: '600',
              color: '#16a34a',
              textDecoration: 'none',
              transition: 'color 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#15803d';
              e.target.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#16a34a';
              e.target.style.textDecoration = 'none';
            }}
          >
            Đăng ký ngay
          </Link>
        </p>

        {/* Footer Links */}
        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid #cbd5e1',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          fontSize: '0.75rem',
          color: '#64748b'
        }} className="footer-links">
          <Link
            to="/"
            style={{
              color: '#64748b',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#475569'}
            onMouseLeave={(e) => e.target.style.color = '#64748b'}
          >
            ← Quay về trang chủ
          </Link>
          <span style={{ color: '#cbd5e1', display: 'none' }} className="separator">•</span>
          <a
            href="/supportpage/contact.html"
            style={{
              color: '#64748b',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#475569'}
            onMouseLeave={(e) => e.target.style.color = '#64748b'}
          >
            Liên hệ hỗ trợ
          </a>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        show={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSuccess={(email) => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }}
      />

      {/* CSS Animations and Responsive */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .login-input:hover {
          border-color: #94a3b8;
        }
        
        .login-submit-btn:hover .arrow-icon {
          transform: translateX(4px);
          transition: transform 0.3s;
        }
        
        @media (max-width: 1024px) {
          .mobile-logo {
            display: flex !important;
          }
        }
        
        @media (min-width: 1024px) {
          .mobile-logo {
            display: none !important;
          }
        }
        
        @media (min-width: 640px) {
          .footer-links {
            flex-direction: row !important;
          }
          .separator {
            display: block !important;
          }
        }
        
        .login-input::placeholder {
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}

