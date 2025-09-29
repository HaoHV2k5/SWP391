import React from 'react';
import { Modal, ListGroup, Button } from 'react-bootstrap';
import { MapPin, Phone } from 'lucide-react';
import { storeLocations } from '../../../data/homepagedata';

const StoreLocationModal = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <MapPin size={20} className="me-2" />
          Cửa hàng gần bạn
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <ListGroup variant="flush">
          {storeLocations.map((store) => (
            <ListGroup.Item key={store.id} className="d-flex justify-content-between align-items-start">
              <div className="ms-2 me-auto">
                <div className="fw-bold">{store.name}</div>
                <div className="text-muted small mb-1">{store.address}</div>
                <div className="d-flex align-items-center text-muted small">
                  <Phone size={14} className="me-1" />
                  {store.phone}
                </div>
              </div>
              <div className="text-end">
                <div className="badge bg-primary">{store.distance}</div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StoreLocationModal;