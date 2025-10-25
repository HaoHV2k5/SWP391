import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import MemberHeader from "../../components/member/MemberHeader";
import OrdersTab from "../../components/member/OrdersTab";
import displayService from "../../services/home/displayService";
import "../../styles/member/index.css";

const MemberOrders = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // State for orders
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Function to load orders from productService
  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      // Sử dụng getPublicList để lấy posts, sau đó convert thành orders format
      // Hoặc có thể tạo endpoint riêng cho orders
      const result = await displayService.getPublicList();
      if (result.success) {
        // Tạm thời convert posts thành orders format
        // Trong thực tế cần có endpoint riêng cho orders
        const ordersData = result.data.map((post, index) => ({
          id: post.id || index + 1,
          product: post.title || post.productName || "Sản phẩm",
          price: post.price || post.vehicle?.price || post.battery?.price || 0,
          status: "completed", // Tạm thời set status mặc định
          date: post.createdDate || post.createdAt || new Date().toISOString().split('T')[0],
          image: post.image || post.vehicle?.image || post.battery?.image || post.images?.[0] || "/logo.jpg",
        }));
        setOrders(ordersData);
      } else {
        console.error("Failed to load orders:", result.message);
        setOrders([]);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    console.log("=== MemberOrders useEffect ===");
    console.log("MemberOrders - User object:", user);

    // Thêm delay để đợi user state được cập nhật
    if (!user) {
      console.log("No user yet, waiting...");
      setIsCheckingAuth(true);
      const timer = setTimeout(() => {
        console.log("Timeout reached, checking again...");
        if (!user) {
          console.log("Still no user after timeout, redirecting to login");
          navigate("/login");
        }
      }, 1000);

      return () => clearTimeout(timer);
    }

    // User đã có, kiểm tra auth
    setIsCheckingAuth(false);

    // Kiểm tra role (member có thể truy cập)
    let userRole = null;
    if (user.user && user.user.role) {
      userRole = user.user.role;
    } else if (user.role) {
      userRole = user.role;
    }

    console.log("Detected user role:", userRole);

    if (userRole !== "member") {
      console.log("User role is not member:", userRole);
      navigate("/");
      return;
    }

    console.log("Member orders access granted");
    
    // Load orders when user is authenticated
    loadOrders();
  }, [user, navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleTabChange = (tabId) => {
    switch (tabId) {
      case "dashboard":
        navigate("/account");
        break;
      case "orders":
        navigate("/member/orders");
        break;
      case "wishlist":
        navigate("/member/wishlist");
        break;
      case "profile":
        navigate("/member/profile");
        break;
      default:
        navigate("/account");
    }
  };

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
        <MemberHeader activeTab="orders" />

        {/* Orders Content */}
        <OrdersTab orders={orders} formatCurrency={formatCurrency} loading={loadingOrders} />
      </div>
    </Container>
  );
};

export default MemberOrders;
