import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import MemberHeader from "../../components/member/MemberHeader";
import OrdersTab from "../../components/member/OrdersTab";
import "../../styles/member/index.css";

const MemberOrders = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Mock data for orders
  const [orders, setOrders] = useState([
    {
      id: 1,
      product: "VinFast Klara S 2023",
      price: 18500000,
      status: "completed",
      date: "2024-01-20",
      image: "/logo.jpg",
    },
    {
      id: 2,
      product: "Pin Lithium-ion 48V 20Ah",
      price: 3200000,
      status: "shipping",
      date: "2024-01-22",
      image: "https://bizweb.dktcdn.net/thumb/grande/100/433/676/products/pin-xe-may-dien-3-fe7c9482-c1df-4f57-8ac2-e0f227fca542.jpg",
    },
    {
      id: 3,
      product: "Honda PCX Electric 2022",
      price: 28000000,
      status: "pending",
      date: "2024-01-25",
      image: "https://www.checkraka.com/uploaded/logo/f7/f78a308ee33cc49223ef59e78aade972.webp",
    },
    {
      id: 4,
      product: "Sạc nhanh 60V 5A",
      price: 850000,
      status: "cancelled",
      date: "2024-01-10",
      image: "https://bizweb.dktcdn.net/thumb/grande/100/433/676/products/sac-nhanh-xe-may-dien.jpg",
    },
    {
      id: 5,
      product: "VinFast Evo200 2023",
      price: 42000000,
      status: "completed",
      date: "2024-01-05",
      image: "/logo.jpg",
    },
  ]);

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

    if (userRole !== "member" && userRole !== "admin") {
      console.log("User role is not member or admin:", userRole);
      navigate("/");
      return;
    }

    console.log("Member orders access granted");
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
        <OrdersTab orders={orders} formatCurrency={formatCurrency} />
      </div>
    </Container>
  );
};

export default MemberOrders;
