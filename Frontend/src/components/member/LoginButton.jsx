import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

const LoginButton = () => {
  return (
    <Link 
      to="/login" 
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "#00A86B",
        fontSize: "14px",
        fontWeight: "500",
        textDecoration: "none",
        padding: "10px 16px",
        borderRadius: "8px",
        transition: "all 0.3s ease",
        backgroundColor: "transparent",
        border: "1px solid #00A86B"
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = "#00A86B";
        e.target.style.color = "white";
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = "transparent";
        e.target.style.color = "#00A86B";
      }}
    >
      <User size={18} />
      <span>Đăng nhập</span>
    </Link>
  );
};

export default LoginButton;
