import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import UserAvatar from "./UserAvatar";
import UserMenuItems from "./UserMenuItems";
import LogoutButton from "./LogoutButton";

const UserDropdown = ({ user, onLogout }) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleItemClick = () => {
    setShowUserDropdown(false);
  };

  const handleLogout = () => {
    setShowUserDropdown(false);
    onLogout();
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
      {/* Admin Link */}
      {user.role === "admin" && (
        <Link
          to="/admin"
          style={{
            color: "#00A86B",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "500",
            padding: "8px 12px",
            borderRadius: "6px",
            transition: "all 0.3s",
          }}
        >
          Admin
        </Link>
      )}

      <div
        ref={dropdownRef}
        className="user-dropdown"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#333",
          fontSize: "14px",
          fontWeight: "500",
          cursor: "pointer",
          position: "relative",
          padding: "8px 12px",
          borderRadius: "8px",
          transition: "all 0.3s ease",
          backgroundColor: showUserDropdown ? "#f0f9f0" : "transparent",
        }}
        onClick={() => setShowUserDropdown(!showUserDropdown)}
        onMouseEnter={(e) => {
if (!showUserDropdown) {
            e.currentTarget.style.backgroundColor = "#f8f9fa";
          }
        }}
        onMouseLeave={(e) => {
          if (!showUserDropdown) {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
      >
        <UserAvatar user={user} size="32px" />
        <span>
          {user.fullName || user.fullname || user.user?.fullname || user.email}
        </span>
        <span
          style={{
            fontSize: "10px",
            transform: showUserDropdown ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        >
          ▼
        </span>

        {/* User Dropdown Menu */}
        {showUserDropdown && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: "0",
              background: "white",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              zIndex: 1001,
              minWidth: "230px",
              marginTop: "8px",
              overflow: "hidden",
            }}
          >
            {/* Scrollable menu items */}
            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                overflowX: "hidden",
                padding: "8px 0",
              }}
            >
              <UserMenuItems user={user} onItemClick={handleItemClick} />
            </div>

            {/* Fixed bottom buttons */}
            <div
              style={{ height: "1px", background: "#e5e7eb" }}
            ></div>

            <LogoutButton onLogout={handleLogout} />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDropdown;
