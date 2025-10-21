import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { facebookAuthService } from "../services/authService";

const FacebookCallbackPage = ({ onLogin }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleFacebookCallback = async () => {
      try {
        setLoading(true);
        console.log("🔄 Handling Facebook callback...");

        // Lấy thông tin từ URL params (backend đã redirect với token)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        const email = urlParams.get("email");
        const name = urlParams.get("name");

        console.log("🔍 URL params:", { token, email, name });

        if (token && email && name) {
          console.log("✅ Facebook login successful from URL params");

          // Xác định role (mặc định là member)
          let userRole = "member";

          // Tạo userData object cho onLogin
          const loginData = {
            token: token,
            user: {
              id: email, // Sử dụng email làm ID
              email: email,
              username: email,
              fullName: name,
              role: userRole,
              roles: [],
              picture: "", // Có thể lấy từ backend sau
              provider: "facebook",
            },
          };

          // Gọi onLogin để cập nhật state
          onLogin(loginData);

          // Hiển thị thông báo thành công
          toast.success("Đăng nhập Facebook thành công!");

          // Chuyển hướng dựa trên role
          if (userRole === "ROLE_ADMIN") {
            navigate("/admin");
          } else if (userRole === "ROLE_STAFF") {
            navigate("/staff");
          } else {
            navigate("/");
          }

          // Xóa URL params
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } else {
          console.error("❌ Missing token, email, or name in URL params");
          setError("Thiếu thông tin đăng nhập từ Facebook");
          toast.error("Thiếu thông tin đăng nhập từ Facebook");

          // Chuyển hướng về trang login sau 3 giây
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        }
      } catch (error) {
        console.error("❌ Facebook callback error:", error);
        setError("Có lỗi xảy ra khi xử lý đăng nhập Facebook");
        toast.error("Có lỗi xảy ra khi xử lý đăng nhập Facebook");

        // Chuyển hướng về trang login sau 3 giây
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleFacebookCallback();
  }, [navigate, onLogin]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundImage:
            "url('/src/assets/images/background_den_7_6268ebdce9.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(2px)",
          }}
        />

        {/* Loading content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            textAlign: "center",
            color: "white",
            background: "rgba(26, 26, 46, 0.9)",
            backdropFilter: "blur(20px)",
            padding: "3rem",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              border: "5px solid rgba(255, 255, 255, 0.3)",
              borderTop: "5px solid #1877f2",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 2rem",
            }}
          />
          <h2 style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>
            Đang xử lý đăng nhập Facebook...
          </h2>
          <p style={{ color: "rgba(255, 255, 255, 0.8)" }}>
            Vui lòng chờ trong giây lát
          </p>
        </div>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundImage:
            "url('/src/assets/images/background_den_7_6268ebdce9.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(2px)",
          }}
        />

        {/* Error content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            textAlign: "center",
            color: "white",
            background: "rgba(26, 26, 46, 0.9)",
            backdropFilter: "blur(20px)",
            padding: "3rem",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
            maxWidth: "500px",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              background: "#dc3545",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 2rem",
              fontSize: "2rem",
            }}
          >
            ✕
          </div>
          <h2
            style={{
              marginBottom: "1rem",
              fontSize: "1.5rem",
              color: "#ff6b6b",
            }}
          >
            Đăng nhập thất bại
          </h2>
          <p
            style={{ color: "rgba(255, 255, 255, 0.8)", marginBottom: "2rem" }}
          >
            {error}
          </p>
          <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.9rem" }}>
            Sẽ chuyển hướng về trang đăng nhập trong vài giây...
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default FacebookCallbackPage;
