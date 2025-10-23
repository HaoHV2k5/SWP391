import React from 'react';
const appConstants = {
  APP_NAME: 'ElectricStore',
  TAGLINE: 'Marketplace xe điện uy tín'
};

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
        <h4 className="mb-0 text-primary fw-bold">{appConstants.APP_NAME}</h4>
        <small className="text-muted">{appConstants.TAGLINE}</small>
      </div>
    </div>
  );
};

export default NavbarLogo;
