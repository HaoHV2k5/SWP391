import React, { useState, useEffect } from 'react';
import UserProfileCard from '../components/account/UserProfileCard';
import EditProfileModal from '../components/account/EditProfileModal';
import PersonalInfo from '../components/account/PersonalInfo';
import { memberService } from '../services/memberService';

const AccountPage = ({ user }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await memberService.getMemberProfile();
      
      if (result.success) {
        setProfileData(result.data.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

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

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Đang tải thông tin tài khoản...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#dc3545'
      }}>
        <p>Lỗi: {error}</p>
        <button 
          onClick={loadProfile}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#00A86B',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Merge user data from props with profile data from API
  const mergedUser = {
    ...user,
    ...profileData,
    // Keep original user data as fallback
    fullName: profileData?.fullname || user?.fullName || user?.fullname,
    email: profileData?.email || user?.email,
    phone: profileData?.phone || user?.phone,
    address: profileData?.address || user?.address,
  };

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
        <UserProfileCard 
          user={mergedUser} 
          onEdit={() => setShowEdit(true)}
          onAvatarChange={loadProfile}
        />
        <PersonalInfo user={mergedUser} />
      </div>
      {showEdit && (
        <EditProfileModal
          user={mergedUser}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            setShowEdit(false);
            loadProfile();
          }}
        />
      )}
    </div>
  );
};

export default AccountPage;
