import React from 'react';

const UserAvatar = ({ user, size = "32px" }) => {
  if (user) {
    // Avatar cho user đã đăng nhập
    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #00A86B 0%, #2BB673 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "14px",
        fontWeight: "bold"
      }}>
        {(user.fullName || user.fullname || user.user?.fullname || user.email || "U").charAt(0).toUpperCase()}
      </div>
    );
  } else {
    // Avatar cho user chưa đăng nhập
    return (
      <div style={{
        width: size,
        height: size,
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
    );
  }
};

export default UserAvatar;
