import {
  TrendingUp,
  ClipboardList,
  Users,
  Package,
  LogOut,
} from "lucide-react";

const StaffSidebar = ({ user, activeTab, setActiveTab, onLogout }) => {
  //MENU ITEMS - Danh sách menu items
  const menuItems = [
    {
      id: "dashboard",
      label: "Tổng quan",
      icon: <TrendingUp size={20} />,
    },
    {
      id: "orders",
      label: "Đơn hàng",
      icon: <ClipboardList size={20} />,
    },
    {
      id: "customers",
      label: "Khách hàng",
      icon: <Users size={20} />,
    },
    {
      id: "products",
      label: "Sản phẩm",
      icon: <Package size={20} />,
    },
  ];
  // RENDER - Giao diện sidebar
  return (
    <div
      style={{
        width: "250px",
        backgroundColor: "rgba(26, 26, 46, 0.9)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
        minHeight: "100vh",
        padding: "2rem 0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER - Logo và title */}
      <div style={{ padding: "0 2rem", marginBottom: "2rem" }}>
        <h2
          style={{
            color: "#ffffff",
            fontSize: "1.5rem",
            fontWeight: "700",
            margin: 0,
          }}
        >
          Staff Panel
        </h2>
        <p
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "0.9rem",
            margin: "0.5rem 0 0 0",
          }}
        >
          Quản lý đơn hàng & khách hàng
        </p>
      </div>

      {/* NAVIGATION - Menu items */}
      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              width: "100%",
              padding: "1rem 2rem",
              border: "none",
              background:
                activeTab === item.id
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "transparent",
              color:
                activeTab === item.id ? "white" : "rgba(255, 255, 255, 0.8)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textAlign: "left",
              transition: "all 0.3s",
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== item.id) {
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== item.id) {
                e.target.style.background = "transparent";
              }
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* USER INFO & LOGOUT - Thông tin user và đăng xuất */}
      <div
        style={{
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
            {user?.fullname?.charAt(0) || "S"}
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
              {user?.fullname || "Staff"}
            </p>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.6)",
                margin: 0,
                fontSize: "0.8rem",
              }}
            >
              Nhân viên
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

export default StaffSidebar;
