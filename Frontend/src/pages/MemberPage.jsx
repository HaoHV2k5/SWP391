import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import MemberSidebar from "../components/member/MemberSidebar";
import MemberHeader from "../components/member/MemberHeader";
import DashboardTab from "../components/member/DashboardTab";
import OrdersTab from "../components/member/OrdersTab";
import WishlistTab from "../components/member/WishlistTab";
import ProfileTab from "../components/member/ProfileTab";
import "../styles/member/index.css";

const MemberPage = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
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
      image:
        "https://files01.danhgiaxe.com/E5ymWrMde4anYgID6PhKW8Gdw6g=/fit-in/1280x0/20230912/klara-xanh-154835.jpg",
    },
    {
      id: 2,
      product: "Pin Lithium-ion 48V 20Ah",
      price: 3200000,
      status: "shipping",
      date: "2024-01-22",
      image:
        "https://bizweb.dktcdn.net/thumb/grande/100/433/676/products/pin-xe-may-dien-3-fe7c9482-c1df-4f57-8ac2-e0f227fca542.jpg",
    },
    {
      id: 3,
      product: "Honda PCX Electric 2022",
      price: 28000000,
      status: "pending",
      date: "2024-01-25",
      image:
        "https://www.checkraka.com/uploaded/logo/f7/f78a308ee33cc49223ef59e78aade972.webp",
    },
  ]);

  // Mock data for wishlist
  const [wishlist, setWishlist] = useState([
    {
      id: 1,
      name: "Yamaha E01 2023",
      price: 35000000,
      image:
        "https://vn.e-scooter.co/i/ya/ma/yamaha-e01/full/yamaha-e01-front-left-angle-view.webp",
      addedDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Tesla Model 3 2022",
      price: 980000000,
      image:
        "https://mkt-vehicleimages-prd.autotradercdn.ca/photos/chrome/Expanded/White/2022TSC030022/2022TSC03002201.jpg",
      addedDate: "2024-01-18",
    },
  ]);

  useEffect(() => {
    console.log("=== MemberPage useEffect ===");
    console.log("MemberPage - User object:", user);

    // Thêm delay để đợi user state được cập nhật
    if (!user) {
      console.log("⏳ No user yet, waiting...");
      setIsCheckingAuth(true);
      const timer = setTimeout(() => {
        console.log("⏰ Timeout reached, checking again...");
        if (!user) {
          console.log("❌ Still no user after timeout, redirecting to login");
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

    console.log("🔍 Detected user role:", userRole);

    if (userRole !== "member" && userRole !== "admin") {
      console.log("❌ User role is not member or admin:", userRole);
      navigate("/");
      toast.error("Bạn cần đăng nhập để truy cập trang này!");
      return;
    }

    console.log("✅ Member access granted");
  }, [user, navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (isCheckingAuth) {
    return (
      <Container
        fluid
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
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
      <Row className="g-0">
        {/* Sidebar */}
        <Col xs="auto">
          <MemberSidebar
            user={user}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </Col>

        {/* Main Content */}
        <Col>
          <div className="p-4">
            {/* Header */}
            <MemberHeader activeTab={activeTab} />

            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <DashboardTab
                orders={orders}
                wishlist={wishlist}
                formatCurrency={formatCurrency}
                setActiveTab={setActiveTab}
              />
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <OrdersTab orders={orders} formatCurrency={formatCurrency} />
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <WishlistTab
                wishlist={wishlist}
                formatCurrency={formatCurrency}
              />
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && <ProfileTab user={user} />}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default MemberPage;
