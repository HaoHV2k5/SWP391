import React from 'react';
import { Col } from 'react-bootstrap';
import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

const SocialMedia = () => {
  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: '#' },
    { name: 'Instagram', icon: Instagram, url: '#' },
    { name: 'YouTube', icon: Youtube, url: '#' },
    { name: 'Twitter', icon: Twitter, url: '#' }
  ];

  return (
    <Col md={3} className="mb-4">
      <h6 className="fw-bold mb-3">Theo dõi chúng tôi</h6>
      <div className="d-flex gap-2">
        {socialLinks.map((social, index) => (
          <a
            key={index}
            href={social.url}
            className="social-link d-flex align-items-center justify-content-center bg-primary text-white rounded-circle"
            style={{ width: '40px', height: '40px' }}
          >
            <social.icon size={18} />
          </a>
        ))}
      </div>
    </Col>
  );
};

export default SocialMedia;