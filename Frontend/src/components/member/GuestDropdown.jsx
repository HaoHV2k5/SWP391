import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import LoginRegisterButtons from './LoginRegisterButtons';
import UserMenuItems from './UserMenuItems';

const GuestDropdown = () => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleItemClick = () => {
    setShowUserDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div
        ref={dropdownRef}
        className="user-dropdown"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          color: "#333",
          fontSize: "14px",
          fontWeight: "500",
          cursor: "pointer",
          position: "relative",
          padding: "8px 16px",
          borderRadius: "25px",
          transition: "all 0.3s ease",
          backgroundColor: "white",
          border: "1px solid #e0e0e0"
        }}
        onClick={() => setShowUserDropdown(!showUserDropdown)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f8f9fa";
        }}
        onMouseLeave={(e) => {
e.currentTarget.style.backgroundColor = "white";
        }}
      >
        <div style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "transparent",
          border: "2px solid black",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "black",
          fontSize: "16px",
          fontWeight: "normal"
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <span style={{
          fontSize: "12px",
          color: "black",
          transform: showUserDropdown ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.3s ease"
        }}>
          ▼
        </span>

        {/* Guest Dropdown Menu */}
        {showUserDropdown && (
          <div style={{
            position: "absolute",
            top: "100%",
            right: "0",
            background: "white",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
            zIndex: 1001,
            minWidth: "250px",
            padding: "8px 0",
            marginTop: "8px"
          }}>
            <UserMenuItems onItemClick={handleItemClick} />
            
            <div style={{ height: "1px", background: "#e0e0e0", margin: "8px 0" }}></div>
            
            <LoginRegisterButtons onItemClick={handleItemClick} />
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestDropdown;
