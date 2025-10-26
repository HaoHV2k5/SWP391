import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import MemberHeader from "../../components/member/MemberHeader";
import AIPriceAssistant from "../../components/member/AIPriceAssistant";

const AITools = ({ user }) => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Auth check - similar to PostAd.jsx
    if (!user) {
      setIsCheckingAuth(true);
      const timer = setTimeout(() => {
        if (!user) {
          navigate("/login");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    setIsCheckingAuth(false);

    // Check role
    let userRole = null;
    if (user.user && user.user.role) {
      userRole = user.user.role;
    } else if (user.role) {
      userRole = user.role;
    }

    console.log("🔍 AITools - Current user role:", userRole);
    console.log("🔍 AITools - Full user object:", user);

    // Let backend handle role checking via @PreAuthorize
    // Frontend will just show the page, backend will return 403 if no permission
    console.log("✅ AITools - Page loaded, backend will handle authorization");
  }, [user, navigate]);

  if (isCheckingAuth) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <Spinner animation="border" variant="success" className="mb-3" />
          <p className="text-muted">Đang kiểm tra quyền truy cập...</p>
        </div>
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Container fluid className="p-0 bg-light" style={{ minHeight: "100vh" }}>
      <div className="p-4">
        {/* Header */}
        <MemberHeader activeTab="ai-tools" />

        {/* Main Content */}
        <div className="mx-auto" style={{ maxWidth: "1200px" }}>
          <AIPriceAssistant user={user} />
        </div>
      </div>
    </Container>
  );
};

export default AITools;

