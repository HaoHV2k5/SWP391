import React, { useState } from 'react';
import UserAvatar from './member/UserAvatar';
import DropdownArrow from './member/DropdownArrow';
import MenuItems from './member/MenuItems';
import PostAdButton from './member/PostAdButton';
import LogoutButton from './member/LogoutButton';
import LoginRegisterButtons from './member/LoginRegisterButtons';
import DropdownSeparator from './member/DropdownSeparator';

const MemberDropdown = ({ user }) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleItemClick = () => {
    setShowUserDropdown(false);
  };

  if (user) {
    // User đã đăng nhập
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
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
            backgroundColor: showUserDropdown ? "#f0f9f0" : "transparent"
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
          <span>{user.fullName || user.fullname || user.user?.fullname || user.email}</span>

          {/* User Dropdown Menu */}
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
              minWidth: "200px",
              padding: "8px 0",
              marginTop: "8px"
            }}>
              <MenuItems onItemClick={handleItemClick} />
              <DropdownSeparator />
              <PostAdButton onItemClick={handleItemClick} />
              <DropdownSeparator />
              <LogoutButton onLogout={handleLogout} />
            </div>
          )}
        </div>
      </div>
    );
  } else {
    // User chưa đăng nhập
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
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
          <UserAvatar user={user} size="28px" />
          <DropdownArrow isOpen={showUserDropdown} size="12px" />

          {/* User Dropdown Menu for non-logged in users */}
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
              <MenuItems onItemClick={handleItemClick} />
              <DropdownSeparator />
              <PostAdButton onItemClick={handleItemClick} />
              <DropdownSeparator />
              <LoginRegisterButtons onItemClick={handleItemClick} />
            </div>
          )}
        </div>
      </div>
    );
  }
};

export default MemberDropdown;