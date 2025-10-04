import React from 'react';

const AccountStats = () => {
  const StatCard = ({ title, value }) => (
    <div style={{
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px'
    }}>
      <div style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        color: '#00A86B', 
        marginBottom: '8px' 
      }}>
        {value}
      </div>
      <div style={{ fontSize: '14px', color: '#666' }}>
        {title}
      </div>
    </div>
  );

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ 
        margin: '0 0 20px 0', 
        fontSize: '20px', 
        color: '#333',
        fontWeight: '600'
      }}>
        Thống kê tài khoản
      </h2>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px' 
      }}>
        <StatCard title="Tin đã đăng" value="0" />
        <StatCard title="Tin đã lưu" value="0" />
        <StatCard title="Đơn hàng" value="0" />
        <StatCard title="Lượt xem" value="0" />
      </div>
    </div>
  );
};

export default AccountStats;
