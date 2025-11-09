import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../services/authService";

// CSS animations
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }
  
  @keyframes slideInUp {
    0% { 
      transform: translateY(50px); 
      opacity: 0; 
    }
    100% { 
      transform: translateY(0); 
      opacity: 1; 
    }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(46, 204, 113, 0.3); }
    50% { box-shadow: 0 0 20px rgba(46, 204, 113, 0.6); }
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Lấy email từ state hoặc URL params
  const email =
    location.state?.email || new URLSearchParams(location.search).get("email");

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Vui lòng nhập mã OTP 6 chữ số");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3979/users/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp: otp,
        }),
      });

      const data = await response.json();
      console.log("🔍 OTP verification response:", data);

      if (data.message && data.message.includes("Verification successful")) {
        toast.success("Xác thực OTP thành công! Bạn có thể đăng nhập ngay.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(data.message || "Mã OTP không đúng hoặc đã hết hạn");
      }
    } catch (error) {
      console.error("❌ OTP verification error:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error("Không tìm thấy email để gửi lại OTP");
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.resendOtp(email);
      
      if (result.success) {
        toast.success(result.message || "Đã gửi lại mã OTP mới!");
      } else {
        toast.error(result.message || "Lỗi khi gửi lại OTP");
      }
    } catch (error) {
      console.error("❌ Resend OTP error:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <h2>Không tìm thấy email để xác thực</h2>
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Quay lại đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: `
          linear-gradient(135deg, rgba(46, 204, 113, 0.1) 0%, rgba(52, 152, 219, 0.1) 50%, rgba(155, 89, 182, 0.1) 100%),
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><pattern id="electric" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="2" fill="%232ecc71" opacity="0.3"/><circle cx="20" cy="20" r="1" fill="%233498db" opacity="0.2"/><circle cx="80" cy="30" r="1.5" fill="%239b59b6" opacity="0.2"/><circle cx="30" cy="80" r="1" fill="%23e74c3c" opacity="0.2"/><circle cx="70" cy="70" r="1" fill="%23f39c12" opacity="0.2"/></pattern></defs><rect width="100%" height="100%" fill="url(%23electric)"/></svg>')
        `,
        backgroundSize: "cover, 100px 100px",
        backgroundPosition: "center, 0 0",
        backgroundAttachment: "fixed",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Electric car icons floating in background */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          fontSize: "60px",
          opacity: "0.1",
          animation: "float 6s ease-in-out infinite",
          zIndex: 0,
        }}
      >
        🚗
      </div>
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "15%",
          fontSize: "40px",
          opacity: "0.08",
          animation: "float 8s ease-in-out infinite reverse",
          zIndex: 0,
        }}
      >
        ⚡
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: "20%",
          fontSize: "50px",
          opacity: "0.1",
          animation: "float 7s ease-in-out infinite",
          zIndex: 0,
        }}
      >
        🔋
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "30%",
          right: "10%",
          fontSize: "45px",
          opacity: "0.08",
          animation: "float 9s ease-in-out infinite reverse",
          zIndex: 0,
        }}
      >
        🌱
      </div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "5%",
          fontSize: "35px",
          opacity: "0.1",
          animation: "float 5s ease-in-out infinite",
          zIndex: 0,
        }}
      >
        🚙
      </div>
      <div
        style={{
          position: "absolute",
          top: "60%",
          right: "5%",
          fontSize: "55px",
          opacity: "0.08",
          animation: "float 6.5s ease-in-out infinite reverse",
          zIndex: 0,
        }}
      >
        ⚡
      </div>
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: `
            0 20px 40px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3)
          `,
          width: "100%",
          maxWidth: "450px",
          position: "relative",
          zIndex: 1,
          border: "1px solid rgba(46, 204, 113, 0.2)",
          animation: "slideInUp 0.6s ease-out",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: "#2c3e50",
            fontSize: "28px",
            fontWeight: "700",
            background: "linear-gradient(135deg, #2ecc71, #3498db)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          ⚡ Xác thực OTP ⚡
        </h2>

        <p
          style={{
            textAlign: "center",
            marginBottom: "30px",
            color: "#666",
          }}
        >
          Chúng tôi đã gửi mã OTP đến email: <strong>{email}</strong>
        </p>

        <form onSubmit={handleVerifyOTP}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Mã OTP (6 chữ số):
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Nhập mã OTP"
              style={{
                width: "100%",
                padding: "16px 20px",
                border: "2px solid #2ecc71",
                borderRadius: "15px",
                fontSize: "24px",
                fontWeight: "700",
                textAlign: "center",
                letterSpacing: "6px",
                background: "#ffffff",
                color: "#2c3e50",
                transition: "all 0.3s ease",
                outline: "none",
                boxShadow:
                  "0 4px 12px rgba(46, 204, 113, 0.2), inset 0 1px 3px rgba(0,0,0,0.1)",
                animation:
                  otp.length === 6 ? "glow 2s ease-in-out infinite" : "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#27ae60";
                e.target.style.boxShadow =
                  "0 0 0 4px rgba(46, 204, 113, 0.2), 0 6px 20px rgba(46, 204, 113, 0.3)";
                e.target.style.transform = "scale(1.02)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#2ecc71";
                e.target.style.boxShadow =
                  "0 4px 12px rgba(46, 204, 113, 0.2), inset 0 1px 3px rgba(0,0,0,0.1)";
                e.target.style.transform = "scale(1)";
              }}
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            style={{
              width: "100%",
              padding: "16px 24px",
              background:
                isLoading || otp.length !== 6
                  ? "linear-gradient(135deg, #bdc3c7, #95a5a6)"
                  : "linear-gradient(135deg, #2ecc71, #27ae60)",
              color: "white",
              border: "none",
              borderRadius: "15px",
              fontSize: "18px",
              fontWeight: "600",
              cursor: isLoading || otp.length !== 6 ? "not-allowed" : "pointer",
              marginBottom: "20px",
              transition: "all 0.3s ease",
              boxShadow:
                isLoading || otp.length !== 6
                  ? "0 4px 8px rgba(0,0,0,0.1)"
                  : "0 6px 20px rgba(46, 204, 113, 0.3)",
              transform:
                isLoading || otp.length !== 6 ? "none" : "translateY(0)",
              animation:
                otp.length === 6 && !isLoading
                  ? "pulse 2s ease-in-out infinite"
                  : "none",
            }}
            onMouseEnter={(e) => {
              if (!isLoading && otp.length === 6) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 25px rgba(46, 204, 113, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && otp.length === 6) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 6px 20px rgba(46, 204, 113, 0.3)";
              }
            }}
          >
            {isLoading ? "⚡ Đang xác thực..." : "🔐 Xác thực OTP"}
          </button>
        </form>

        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#666", marginBottom: "10px" }}>
            Không nhận được mã OTP?
          </p>
          <button
            onClick={handleResendOTP}
            disabled={isLoading}
            style={{
              padding: "12px 20px",
              background: "linear-gradient(135deg, #3498db, #2980b9)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: isLoading ? "not-allowed" : "pointer",
              marginRight: "12px",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(52, 152, 219, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(52, 152, 219, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(52, 152, 219, 0.3)";
              }
            }}
          >
            🔄 Gửi lại OTP
          </button>

          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "12px 20px",
              background: "linear-gradient(135deg, #95a5a6, #7f8c8d)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(149, 165, 166, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 16px rgba(149, 165, 166, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(149, 165, 166, 0.3)";
            }}
          >
            ← Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
