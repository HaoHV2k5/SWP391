import React from 'react';
import { Link } from 'react-router-dom';

const MenuItems = ({ onItemClick }) => {
  const menuItems = [
    { to: "/account", label: "Tài khoản" },
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
    </>
  );
};

export default MenuItems;
