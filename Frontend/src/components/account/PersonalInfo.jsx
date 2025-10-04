import React from 'react';
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react';

const PersonalInfo = ({ user }) => {
  const InfoItem = ({ icon: Icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        backgroundColor: '#f0f9f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#00A86B'
      }}>
        <Icon size={18} />
      </div>
      <div>
        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>
          {label}
        </p>
        <p style={{ margin: '0', fontSize: '16px', color: '#333' }}>
          {value}
        </p>
      </div>
    </div>
  );

  const getFullName = () => {
    return user?.fullName || user?.fullname || user?.user?.fullname || 'Chưa cập nhật';
  };

  const getJoinDate = () => {
    return user?.createdAt 
      ? new Date(user.createdAt).toLocaleDateString('vi-VN') 
      : 'Không xác định';
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '30px',
      marginBottom: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ 
        margin: '0 0 20px 0', 
        fontSize: '20px', 
        color: '#333',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <User size={20} />
        Thông tin cá nhân
      </h2>

      <div style={{ display: 'grid', gap: '20px' }}>
        <InfoItem 
          icon={Mail} 
          label="Email" 
          value={user?.email} 
        />
        
        <InfoItem 
          icon={User} 
          label="Họ và tên" 
          value={getFullName()} 
        />
        
        <InfoItem 
          icon={Phone} 
          label="Số điện thoại" 
          value={user?.phone || 'Chưa cập nhật'} 
        />
        
        <InfoItem 
          icon={MapPin} 
          label="Địa chỉ" 
          value={user?.address || 'Chưa cập nhật'} 
        />
        
        <InfoItem 
          icon={Calendar} 
          label="Ngày tham gia" 
          value={getJoinDate()} 
        />
      </div>
    </div>
  );
};

export default PersonalInfo;
