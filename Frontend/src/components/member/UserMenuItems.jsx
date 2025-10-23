import React from 'react';
import { Link } from 'react-router-dom';

const UserMenuItems = ({ onItemClick }) => {
  const menuItems = [
    { to: "/account", label: "Tài khoản" },
    { to: "/kyc", label: "Xác thực danh tính" },
    { to: "/my-posts", label: "Tin đăng của tôi" },
    { to: "/saved-posts", label: "Tin đã lưu" },
    { to: "/orders", label: "Đơn hàng" },
    { to: "/view-history", label: "Lịch sử xem tin" }
  ];

  return (
    <>
      {menuItems.map((item, index) => (
        <Link 
          key={index}
          to={item.to} 
          style={{
            display: "block",
            padding: "10px 15px",
            color: "#333",
            textDecoration: "none",
            fontSize: "14px",
            transition: "background-color 0.2s"
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
          onClick={onItemClick}
        >
          {item.label}
        </Link>
      ))}
      
      <div style={{ height: "1px", background: "#e0e0e0", margin: "8px 0" }}></div>

      <Link 
        to="/post-ad" 
        style={{
          display: "block",
          padding: "10px 15px",
          color: "#00A86B",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: "600",
          transition: "background-color 0.2s"
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = "#f0f9f0"}
        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
        onClick={onItemClick}
      >
        Đăng tin ngay
      </Link>
    </>
  );
};

export default UserMenuItems;
