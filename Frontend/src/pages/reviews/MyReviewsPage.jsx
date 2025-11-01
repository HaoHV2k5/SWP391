import React from 'react';
import { Container } from 'react-bootstrap';
import MyReviews from '../../components/account/MyReviews';

const MyReviewsPage = ({ user }) => {
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
        Vui lòng đăng nhập để xem đánh giá
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
          <i className="bi bi-star-fill me-2" style={{ color: '#ffc107' }}></i>
          Đánh giá tôi đã viết
        </h2>
        <MyReviews user={user} />
      </Container>
    </div>
  );
};

export default MyReviewsPage;

