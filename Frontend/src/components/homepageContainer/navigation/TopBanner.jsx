import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const TopBanner = () => {
  return (
    <div className="top-banner bg-primary text-white py-2">
      <Container>
        <Row>
          <Col className="text-center">
            <small>
              🚗 Xe điện & Pin Chính hãng - Đã qua sử dụng | 
              🚚 Giao nhanh - Miễn phí cho đơn 500k | 
              💰 Thu cũ giá cao - Đổi mới tiết kiệm
            </small>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TopBanner;