import React from 'react';
import { Link } from 'react-router-dom';

const LoginRegisterButtons = ({ onItemClick }) => {
  return (
    <div style={{
      display: "flex",
      padding: "0 15px 10px 15px",
      gap: "8px"
    }}>
      <Link 
        to="/login" 
        style={{
          flex: 1,
          padding: "8px 12px",
          color: "#00A86B",
          textDecoration: "none",
          fontSize: "13px",
          fontWeight: "500",
          textAlign: "center",
          border: "1px solid #00A86B",
          borderRadius: "6px",
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "#00A86B";
          e.target.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "transparent";
          e.target.style.color = "#00A86B";
        }}
        onClick={onItemClick}
      >
        Đăng nhập
      </Link>
      
      <Link 
        to="/register" 
        style={{
          flex: 1,
          padding: "8px 12px",
          background: "#00A86B",
          color: "white",
          textDecoration: "none",
          fontSize: "13px",
          fontWeight: "600",
          textAlign: "center",
          borderRadius: "6px",
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "#007A4B";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "#00A86B";
        }}
        onClick={onItemClick}
      >
        Đăng ký
      </Link>
    </div>
  );
};

export default LoginRegisterButtons;
