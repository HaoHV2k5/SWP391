import React, { useState } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { MapPin, Package, Bell, ShoppingCart } from 'lucide-react';
import StoreLocationModal from './StoreLocationModal';

const NavbarActions = () => {
  const [showStoreModal, setShowStoreModal] = useState(false);

  return (
    <>
      <div className="d-flex align-items-center gap-3">
        {/* Cửa hàng gần bạn */}
        <Button
          variant="link"
          className="text-decoration-none text-dark d-flex align-items-center"
          onClick={() => setShowStoreModal(true)}
        >
          <MapPin size={18} className="me-1" />
          <span className="d-none d-md-inline">Cửa hàng gần bạn</span>
        </Button>

        {/* Tra cứu đơn hàng */}
        <Button
          variant="link"
          className="text-decoration-none text-dark d-flex align-items-center"
        >
          <Package size={18} className="me-1" />
          <span className="d-none d-md-inline">Tra cứu đơn hàng</span>
        </Button>

        {/* Thông báo */}
        <Button
          variant="link"
          className="text-decoration-none text-dark position-relative"
        >
          <Bell size={18} />
          <Badge 
            bg="danger" 
            className="position-absolute top-0 start-100 translate-middle rounded-pill"
            style={{ fontSize: '10px' }}
          >
            0
          </Badge>
        </Button>

        {/* Giỏ hàng */}
        <Button
          variant="link"
          className="text-decoration-none text-dark position-relative"
        >
          <ShoppingCart size={18} />
          <Badge 
            bg="danger" 
            className="position-absolute top-0 start-100 translate-middle rounded-pill"
            style={{ fontSize: '10px' }}
          >
            0
          </Badge>
        </Button>
      </div>

      {/* Modal cửa hàng gần bạn */}
      <StoreLocationModal 
        show={showStoreModal} 
        onHide={() => setShowStoreModal(false)} 
      />
    </>
  );
};

export default NavbarActions;