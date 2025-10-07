import { Search, Bell, Settings } from "lucide-react";

const StaffHeader = ({ activeTab, searchQuery, setSearchQuery }) => {
  //PAGE TITLE - Lấy title theo activeTab

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "📊 Tổng quan";
      case "orders":
        return "📋 Quản lý đơn hàng";
      case "customers":
        return "👥 Quản lý khách hàng";
      case "products":
        return "📦 Quản lý sản phẩm";
      default:
        return "Staff Panel";
    }
  };
  //RENDER - Giao diện header

  return (
    <div
      style={{
        backgroundColor: "rgba(26, 26, 46, 0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "1.5rem 2rem",
        borderRadius: "15px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        marginBottom: "2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* PAGE TITLE - Tiêu đề trang */}
      <h1
        style={{
          color: "#ffffff",
          fontSize: "2rem",
          fontWeight: "700",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          margin: 0,
        }}
      >
        {getPageTitle()}
      </h1>
      {/*HEADER ACTIONS - Các action buttons */}

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        {/*SEARCH BAR - Thanh tìm kiếm */}
        <div style={{ position: "relative" }}>
          <Search
            size={20}
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(255, 255, 255, 0.7)",
            }}
          />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "0.75rem 1rem 0.75rem 3rem",
              border: "2px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "10px",
              fontSize: "1rem",
              width: "300px",
              background: "rgba(255, 255, 255, 0.1)",
              color: "white",
              backdropFilter: "blur(10px)",
            }}
          />
        </div>
        {/* NOTIFICATIONS - Button thông báo */}
        <button
          style={{
            padding: "0.75rem",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "10px",
            color: "white",
            cursor: "pointer",
            position: "relative",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.1)";
          }}
        >
          <Bell size={20} />
          <div
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              width: "20px",
              height: "20px",
              background: "#ff4757",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.7rem",
              fontWeight: "bold",
            }}
          >
            3
          </div>
        </button>

        {/* SETTINGS - Button cài đặt */}
        <button
          style={{
            padding: "0.75rem",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "10px",
            color: "white",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.1)";
          }}
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};

export default StaffHeader;
