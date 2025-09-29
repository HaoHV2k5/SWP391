import React from 'react';
import { Col, Button } from 'react-bootstrap';
import { Smartphone, QrCode } from 'lucide-react';

const AppDownload = () => {
  return (
    <Col md={3} className="mb-4">
      <h6 className="fw-bold mb-3">Tải ứng dụng</h6>
      
      {/* QR Code */}
      <div className="text-center mb-3">
        <div className="qr-code-placeholder bg-light p-3 rounded d-inline-block">
          <QrCode size={80} className="text-muted" />
        </div>
        <p className="small text-muted mt-2">Quét mã QR để tải app</p>
      </div>

      {/* Download buttons */}
      <div className="d-grid gap-2">
        <Button 
          variant="dark" 
          size="sm"
          className="d-flex align-items-center justify-content-center"
        >
          <Smartphone size={16} className="me-2" />
          App Store
        </Button>
        <Button 
          variant="dark" 
          size="sm"
          className="d-flex align-items-center justify-content-center"
        >
          <Smartphone size={16} className="me-2" />
          Google Play
        </Button>
      </div>
    </Col>
  );
};

export default AppDownload;