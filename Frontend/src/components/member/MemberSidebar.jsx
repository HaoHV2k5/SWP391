import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Nav, Card, Button, Image } from "react-bootstrap";
import { Camera } from "lucide-react";

const MemberSidebar = ({ user, activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const navigationItems = [
    {
      id: "dashboard",
      label: "Tổng quan",
    },
    {
      id: "orders",
      label: "Đơn hàng",
    },
    {
      id: "wishlist",
      label: "Yêu thích",
    },
    {
      id: "profile",
      label: "Hồ sơ",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    toast.success("Đăng xuất thành công!");
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  return (
    <div className="member-sidebar bg-white border-end shadow-sm" style={{ width: "280px", minHeight: "100vh" }}>
      {/* Profile Section */}
      <div className="p-3 mb-3">
        <Card className="text-center border-0 bg-light">
          <Card.Body className="p-3">
            <div className="position-relative d-inline-block mb-3">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                style={{
                  width: "80px", 
                  height: "80px", 
                  background: "linear-gradient(135deg, #00A86B 0%, #2BB673 100%)",
                  fontSize: "1.5rem"
                }}
              >
                {(user?.fullName || user?.fullname || user?.user?.fullname || "Member").charAt(0).toUpperCase()}
              </div>
              <Button 
                size="sm" 
                variant="outline-success" 
                className="position-absolute rounded-circle p-1"
                style={{ bottom: "-5px", right: "-5px", width: "30px", height: "30px" }}
              >
                <Camera size={14} />
              </Button>
            </div>
            <Card.Title className="h6 mb-1">
              {user?.fullName || user?.fullname || user?.user?.fullname || "Member"}
            </Card.Title>
            <Card.Text className="text-muted small mb-0">
              {user?.email || user?.user?.email}
            </Card.Text>
          </Card.Body>
        </Card>
      </div>

      {/* Navigation */}
      <Nav className="flex-column px-2">
        {navigationItems.map((tab) => (
          <Nav.Item key={tab.id}>
            <Nav.Link
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-2 mb-1 ${
                activeTab === tab.id 
                  ? 'bg-success text-white' 
                  : 'text-dark hover-bg-light'
              }`}
              style={{ cursor: "pointer", border: "none" }}
            >
              {tab.label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {/* Logout Button */}
      <div className="p-3 mt-auto">
        <Button 
          variant="danger" 
          onClick={handleLogout} 
          className="w-100"
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  );
};

export default MemberSidebar;
