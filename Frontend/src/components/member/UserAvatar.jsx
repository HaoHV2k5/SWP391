import React from 'react';

const UserAvatar = ({ user, size = "32px" }) => {
  const getInitials = (user) => {
    const name = user.fullName || user.fullname || user.user?.fullname || user.email || "U";
    return name.charAt(0).toUpperCase();
  };

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
      {getInitials(user)}
    </div>
  );
};

export default UserAvatar;