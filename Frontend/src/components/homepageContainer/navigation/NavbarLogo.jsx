import React from 'react';
import { APP_CONSTANTS } from '../../../data/homepagedata';

const NavbarLogo = () => {
  return (
    <div className="d-flex align-items-center">
      {/* Logo */}
      <div className="logo-container me-2">
        <img 
          src="/logo_removeBg.png" 
          alt="Logo" 
          style={{ height: '40px', width: 'auto' }}
        />
      </div>
      
      {/* Tên ứng dụng */}
      <div className="app-name">
        <h4 className="mb-0 text-primary fw-bold">{APP_CONSTANTS.APP_NAME}</h4>
        <small className="text-muted">{APP_CONSTANTS.TAGLINE}</small>
      </div>
    </div>
  );
};

export default NavbarLogo;