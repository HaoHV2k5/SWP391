import React from 'react';
import { Container } from 'react-bootstrap';
import ComplaintsAboutMe from '../../components/account/ComplaintsAboutMe';

const ComplaintsAboutMePage = ({ user }) => {
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
        Vui lòng đăng nhập để xem khiếu nại
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      padding: '20px 0'
    }}>
      <Container>
        <h2 className="mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2" style={{ color: '#ffc107' }}></i>
          Khiếu nại về tôi
        </h2>
        <ComplaintsAboutMe user={user} />
      </Container>
    </div>
  );
};

export default ComplaintsAboutMePage;

