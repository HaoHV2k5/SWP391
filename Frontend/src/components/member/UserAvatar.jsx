import React, { useState, useEffect } from 'react';

const UserAvatar = ({ user, size = "32px" }) => {
  const [avatar, setAvatar] = useState(null);

  const getInitials = (user) => {
    const name = user.fullName || user.fullname || user.user?.fullname || user.email || "U";
    return name.charAt(0).toUpperCase();
  };

  const getCurrentAvatar = () => {
    // Ưu tiên avatar từ server (theo Backend)
    const serverAvatar = user?.avatar || user?.avatarUrl || user?.profilePicture;
    if (serverAvatar) return serverAvatar;
    
    // Không dùng localStorage nữa vì avatar đã được lưu trên server
    return null;
  };

  // Listen for avatar changes
  useEffect(() => {
    const handleAvatarChange = (event) => {
      const { userId, avatar } = event.detail;
      const currentUserId = localStorage.getItem('userId') || user?.id || 'default';
      
      if (userId === currentUserId) {
        setAvatar(avatar);
      }
    };

    window.addEventListener('avatarChanged', handleAvatarChange);
    
    // Set initial avatar
    setAvatar(getCurrentAvatar());

    return () => {
      window.removeEventListener('avatarChanged', handleAvatarChange);
    };
  }, [user]);

  const currentAvatar = avatar || getCurrentAvatar();

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
      fontWeight: "bold",
      overflow: "hidden"
    }}>
      {currentAvatar ? (
        <img
          src={currentAvatar}
          alt="Avatar"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%"
          }}
        />
      ) : (
        getInitials(user)
      )}
    </div>
  );
};

export default UserAvatar;