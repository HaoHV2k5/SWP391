import React from 'react';
import UserProfileCard from '../components/account/UserProfileCard';
import PersonalInfo from '../components/account/PersonalInfo';
import AccountStats from '../components/account/AccountStats';

const AccountPage = ({ user }) => {
  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Vui lòng đăng nhập để xem thông tin tài khoản
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      padding: '20px 0'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '0 20px' 
      }}>
        <UserProfileCard user={user} />
        <PersonalInfo user={user} />
        <AccountStats />
      </div>
    </div>
  );
};

export default AccountPage;
