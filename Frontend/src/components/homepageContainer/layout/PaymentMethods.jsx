import React from 'react';
import { Col } from 'react-bootstrap';
import { CreditCard, Smartphone, Building } from 'lucide-react';

const PaymentMethods = () => {
  const paymentMethods = [
    { name: 'Visa/Mastercard', icon: CreditCard },
    { name: 'MoMo', icon: Smartphone },
    { name: 'ZaloPay', icon: Smartphone },
    { name: 'Bank Transfer', icon: Building }
  ];

  return (
    <Col md={3} className="mb-4">
      <h6 className="fw-bold mb-3">Phương thức thanh toán</h6>
      <div className="d-flex flex-wrap gap-2">
        {paymentMethods.map((method, index) => (
          <div 
            key={index}
            className="payment-method d-flex align-items-center bg-light p-2 rounded"
          >
            <method.icon size={16} className="me-2 text-primary" />
            <small>{method.name}</small>
          </div>
        ))}
      </div>
    </Col>
  );
};

export default PaymentMethods;