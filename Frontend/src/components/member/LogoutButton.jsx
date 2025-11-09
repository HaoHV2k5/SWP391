import React from 'react';
import { LogOut } from "lucide-react";

const LogoutButton = ({ onLogout }) => {
  return (
    <button 
      onClick={onLogout} 
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        background: "none",
        border: "none",
        color: "#ef4444",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        textAlign: "left",
        transition: "background-color 0.15s"
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fef2f2"}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
    >
      <LogOut size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>Đăng xuất</span>
    </button>
  );
};

export default LogoutButton;
