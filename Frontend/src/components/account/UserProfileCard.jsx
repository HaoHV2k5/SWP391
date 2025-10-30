import React, { useState, useEffect, useRef } from 'react';
import { Edit3 } from 'lucide-react';
import { CameraOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { memberService } from '../../services/memberService';

const UserProfileCard = ({ user, onEdit, onAvatarChange }) => {
  const [avatar, setAvatar] = useState(null);
  const fileInputRef = useRef(null);

  const getInitial = () => {
    return (user?.fullName || user?.fullname || user?.user?.fullname || user?.email || "U")
      .charAt(0).toUpperCase();
  };

  const getFullName = () => {
    return user?.fullName || user?.fullname || user?.user?.fullname || 'Chưa cập nhật';
  };

  const getRole = () => {
    return user?.role === 'admin' ? 'Quản trị viên' : 'Thành viên';
  };

  const getRoleColor = () => {
    return user?.role === 'admin' ? '#dc3545' : '#00A86B';
  };

  const getCurrentAvatar = () => {
    // Ưu tiên avatar từ server (theo Backend)
    const serverAvatar = user?.avatar || user?.avatarUrl || user?.profilePicture;
    if (serverAvatar) return serverAvatar;
    
    // Không dùng localStorage nữa vì avatar đã được lưu trên server
    return null;
  };

  const handleChangeAvatar = () => {
    fileInputRef.current?.click();
  };


  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const hideLoading = message.loading('Đang upload avatar lên server...', 0);

    try {
      // Upload lên Cloudinary và cập nhật qua Backend API
      const result = await memberService.updateAvatar(file);
      
      hideLoading();

      if (result.success) {
        message.success(result.message || 'Avatar đã được cập nhật thành công!');
        
        // Cập nhật avatar trong state để hiển thị ngay
        if (result.imageUrl) {
          setAvatar(result.imageUrl);
        }
        
        // Trigger re-render - reload profile data từ server
        if (onAvatarChange) {
          onAvatarChange(); // AccountPage sẽ gọi loadProfile() để refresh user data
        }
        
        // Force re-render bằng cách dispatch custom event với URL từ server
        // Để các component khác (UserAvatar, etc.) cũng cập nhật
        const userId = localStorage.getItem('userId') || user?.id || 'default';
        window.dispatchEvent(new CustomEvent('avatarChanged', { 
          detail: { userId, avatar: result.imageUrl } 
        }));
        
        // Cập nhật user prop nếu có (để sync với parent component)
        if (user && result.imageUrl) {
          user.avatar = result.imageUrl;
        }
      } else {
        message.error(result.message || 'Có lỗi xảy ra khi cập nhật avatar');
      }
      
    } catch (error) {
      hideLoading();
      console.error('Upload avatar error:', error);
      message.error(error.message || 'Có lỗi xảy ra khi upload avatar');
    }
    
    // Reset input
    event.target.value = '';
  };

  // Listen for avatar changes từ server
  useEffect(() => {
    const handleAvatarChange = (event) => {
      const { userId, avatar } = event.detail;
      const currentUserId = localStorage.getItem('userId') || user?.id || 'default';
      
      if (userId === currentUserId && avatar) {
        setAvatar(avatar);
      }
    };

    window.addEventListener('avatarChanged', handleAvatarChange);
    
    // Set initial avatar từ server
    const serverAvatar = getCurrentAvatar();
    if (serverAvatar) {
      setAvatar(serverAvatar);
    }

    return () => {
      window.removeEventListener('avatarChanged', handleAvatarChange);
    };
  }, [user]);

  // Force re-render khi user thay đổi (bao gồm avatar)
  useEffect(() => {
    const currentAvatar = getCurrentAvatar();
    if (currentAvatar !== avatar) {
      setAvatar(currentAvatar);
    }
  }, [user?.id, user?.email, user?.avatar]);

  const currentAvatar = avatar || getCurrentAvatar();

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '30px',
      marginBottom: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Avatar */}
        <div style={{ position: 'relative' }}>
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt="Avatar"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #00A86B'
              }}
            />
          ) : (
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00A86B 0%, #2BB673 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '32px',
              fontWeight: 'bold'
            }}>
              {getInitial()}
            </div>
          )}
          
          {/* Camera Icon */}
          <button
            onClick={handleChangeAvatar}
            style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#666',
              padding: '4px'
            }}
          >
            <CameraOutlined style={{ fontSize: '20px' }} />
          </button>
        </div>
        
        {/* User Info */}
        <div style={{ flex: 1 }}>
          <h1 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '28px', 
            color: '#333',
            fontWeight: '600'
          }}>
            {getFullName()}
          </h1>
          <p style={{ 
            margin: '0 0 4px 0', 
            color: '#666', 
            fontSize: '16px' 
          }}>
            {user?.email}
          </p>
          <div style={{
            display: 'inline-block',
            backgroundColor: getRoleColor(),
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase'
          }}>
            {getRole()}
          </div>
        </div>

        {/* Edit Button */}
        <button style={{
          backgroundColor: '#00A86B',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => { e.target.style.backgroundColor = '#008f5a'; }}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#00A86B'}
        onClick={onEdit}
        >
          <Edit3 size={16} />
          Chỉnh sửa
        </button>

      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default UserProfileCard;
