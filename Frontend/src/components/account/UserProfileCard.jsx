import React, { useState, useEffect, useRef } from 'react';
import { Edit3 } from 'lucide-react';
import { CameraOutlined } from '@ant-design/icons';
import { message } from 'antd';

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
    // Ưu tiên avatar từ server
    const serverAvatar = user?.avatar || user?.avatarUrl || user?.profilePicture;
    if (serverAvatar) return serverAvatar;
    
    // Fallback: Lấy avatar từ localStorage
    const userId = localStorage.getItem('userId') || user?.id || 'default';
    const localAvatar = localStorage.getItem(`avatar_${userId}`);
    return localAvatar;
  };

  const handleChangeAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      message.error('Chỉ được upload file ảnh!');
      return;
    }

    // Kiểm tra kích thước file (max 5MB)
    if (file.size / 1024 / 1024 > 5) {
      message.error('Kích thước file không được vượt quá 5MB!');
      return;
    }

    try {
      message.loading('Đang lưu avatar...', 0);
      
      // Chuyển đổi file thành base64
      const base64 = await fileToBase64(file);
      
      // Lưu vào localStorage
      const userId = localStorage.getItem('userId') || user?.id || 'default';
      localStorage.setItem(`avatar_${userId}`, base64);
      
      message.destroy();
      message.success('Avatar đã được cập nhật thành công!');
      
      // Trigger re-render
      if (onAvatarChange) {
        onAvatarChange();
      }
      
      // Force re-render bằng cách dispatch custom event
      window.dispatchEvent(new CustomEvent('avatarChanged', { 
        detail: { userId, avatar: base64 } 
      }));
      
    } catch (error) {
      message.destroy();
      console.error('Upload avatar error:', error);
      message.error('Có lỗi xảy ra khi lưu avatar');
    }
    
    // Reset input
    event.target.value = '';
  };

  // Helper function để chuyển file thành base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
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
