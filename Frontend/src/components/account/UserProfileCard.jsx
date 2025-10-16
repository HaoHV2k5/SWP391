import React from 'react';
import { Edit3 } from 'lucide-react';
import { CameraOutlined } from '@ant-design/icons';

const UserProfileCard = ({ user, onEdit }) => {
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

  const handleChangeAvatar = () => {
    alert('Chức năng đổi avatar sẽ được phát triển sau');
  };

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
    </div>
  );
};

export default UserProfileCard;
