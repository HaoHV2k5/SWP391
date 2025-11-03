import { TrendingUp, Users, Package, Shield, AlertTriangle, LogOut, Lock, DollarSign, FileText } from "lucide-react";

const AdminSidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
  const tabs = [
    {
      id: "dashboard",
      label: "Tổng quan",
      icon: <TrendingUp size={20} />,
    },
    { id: "users", label: "Người dùng", icon: <Users size={20} /> },
    {
      id: "products",
      label: "Sản phẩm",
      icon: <Package size={20} />,
    },
    {
      id: "revenue",
      label: "Doanh thu",
      icon: <DollarSign size={20} />,
    },
    {
      id: "packages",
      label: "Gói dịch vụ",
      icon: <ShoppingBag size={20} />,
    },
    {
      id: "kyc",
      label: "KYC Approval",
      icon: <Shield size={20} />,
    },
    {
      id: "complaints",
      label: "Khiếu nại",
      icon: <AlertTriangle size={20} />,
    },
    {
      id: "escrow",
      label: "Escrow",
      icon: <FileText size={20} />,
    },
    {
      id: "roles",
      label: "Phân quyền",
      icon: <Lock size={20} />,
    },
    {
      id: "withdrawals",
      label: "Rút tiền",
      icon: <Wallet size={20} />,
    },
  ];

  return (
    <div
      style={{
        width: "250px",
        backgroundColor: "rgba(26, 26, 46, 0.9)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
        minHeight: "100vh",
        padding: "2rem 0",
      }}
    >
      <div style={{ padding: "0 2rem", marginBottom: "2rem" }}>
        <h2
          style={{
            color: "#ffffff",
            fontSize: "1.5rem",
            fontWeight: "700",
          }}
        >
          Admin Panel
        </h2>
        <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.9rem" }}>
          Quản lý hệ thống
        </p>
      </div>

      <nav>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              width: "100%",
              padding: "1rem 2rem",
              border: "none",
              background:
                activeTab === tab.id
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "transparent",
              color:
                activeTab === tab.id ? "white" : "rgba(255, 255, 255, 0.8)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textAlign: "left",
              transition: "all 0.3s",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div
        style={{
          marginTop: "auto",
          padding: "1rem 2rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1rem",
            padding: "1rem",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "1.2rem",
            }}
          >
            {user?.fullname?.charAt(0) || "A"}
          </div>
          <div>
            <p
              style={{
                color: "white",
                margin: "0 0 0.25rem 0",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              {user?.fullname || "Admin"}
            </p>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.6)",
                margin: 0,
                fontSize: "0.8rem",
              }}
            >
              Quản trị viên
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            fontSize: "0.9rem",
            fontWeight: "500",
            transition: "all 0.3s ease",
            backdropFilter: "blur(10px)",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.2)";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.1)";
            e.target.style.transform = "translateY(0)";
          }}
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
