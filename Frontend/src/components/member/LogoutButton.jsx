import React from 'react';

const LogoutButton = ({ onLogout }) => {
  return (
    <button 
      onClick={onLogout} 
      style={{
        width: "100%",
        padding: "10px 15px",
        background: "none",
        border: "none",
        color: "#dc3545",
        fontSize: "14px",
        cursor: "pointer",
        textAlign: "left",
        transition: "background-color 0.2s"
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
      onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
    >
      Đăng xuất
    </button>
  );
};

export default LogoutButton;
