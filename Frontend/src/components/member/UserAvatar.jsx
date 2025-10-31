import React, { useState, useEffect } from 'react';
import { memberService } from '../../services/memberService';

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

  // Load avatar từ server khi component mount và listen for changes
  useEffect(() => {
    // Load avatar từ server khi mount để đảm bảo luôn có data mới nhất (giống AccountPage)
    const loadAvatarFromServer = async () => {
      // Chỉ load nếu có user (đã đăng nhập)
      const token = localStorage.getItem('token');
      if (!token || !user) {
        // Nếu chưa đăng nhập, dùng avatar từ user prop hoặc hiển thị initial
        setAvatar(getCurrentAvatar());
        return;
      }

      try {
        const profileResult = await memberService.getMemberProfile();
        if (profileResult.success && profileResult.data?.data?.avatar) {
          setAvatar(profileResult.data.data.avatar);
        } else {
          // Nếu server không có avatar, dùng từ user prop
          setAvatar(getCurrentAvatar());
        }
      } catch (error) {
        console.error('Failed to load avatar from server:', error);
        // Nếu lỗi, dùng avatar từ user prop
        setAvatar(getCurrentAvatar());
      }
    };

    // Load từ server khi mount
    loadAvatarFromServer();

    // Listen for avatar changes khi upload mới
    const handleAvatarChange = async (event) => {
      const { avatar: eventAvatar } = event.detail || {};
      
      // Nếu có avatar trong event, cập nhật ngay
      if (eventAvatar) {
        setAvatar(eventAvatar);
        return;
      }
      
      // Nếu không có avatar trong event, reload từ server để đảm bảo có data mới nhất
      try {
        const profileResult = await memberService.getMemberProfile();
        if (profileResult.success && profileResult.data?.data?.avatar) {
          setAvatar(profileResult.data.data.avatar);
        }
      } catch (error) {
        console.error('Failed to reload avatar from server:', error);
      }
    };

    window.addEventListener('avatarChanged', handleAvatarChange);

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