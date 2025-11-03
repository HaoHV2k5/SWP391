import React from 'react';
import { User, Mail, Phone, MapPin, Users, Calendar, Lock } from 'lucide-react';

const PersonalInfo = ({ user, onChangePassword }) => {
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

  const getGender = () => {
    const raw = (user?.gender || '').toString().toLowerCase();
    if (!raw) return 'Chưa cập nhật';
    if (raw === 'male' || raw === 'nam') return 'Nam';
    if (raw === 'female' || raw === 'nu' || raw === 'nữ') return 'Nữ';
    return 'Khác';
  };

  const getYob = () => {
    const yob = user?.yob;
    if (!yob) return 'Chưa cập nhật';
    if (typeof yob === 'string') {
      if (yob.includes('/')) return yob; // dd/MM/yyyy
      if (yob.includes('-')) {
        const parts = yob.split('-');
        if (parts.length === 3) {
          const [yyyy, mm, dd] = parts;
          return `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy}`;
        }
      }
    }
    return yob;
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
          icon={Calendar} 
          label="Ngày sinh" 
          value={getYob()} 
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
          icon={Users} 
          label="Giới tính" 
          value={getGender()} 
        />
      </div>

      {/* Change Password Button */}
      {onChangePassword && (
        <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid #eee' }}>
          <button
            onClick={onChangePassword}
            style={{
              width: '100%',
              padding: '12px 24px',
              border: '1px solid #00A86B',
              borderRadius: '8px',
              backgroundColor: 'white',
              color: '#00A86B',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f0f9f0';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
            }}
          >
            <Lock size={18} />
            Đổi mật khẩu
          </button>
        </div>
      )}
    </div>
  );
};

export default PersonalInfo;
