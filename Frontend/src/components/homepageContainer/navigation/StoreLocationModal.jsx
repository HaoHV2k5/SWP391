import { Modal, ListGroup } from 'react-bootstrap';
import { MapPin, Phone } from 'lucide-react';
const storeLocations = [
  { id: 1, name: 'ElectricStore Q1', address: '123 Lê Lợi, Q1, TP.HCM', phone: '0900 000 001', distance: '1.2km' },
  { id: 2, name: 'ElectricStore Q3', address: '45 Pasteur, Q3, TP.HCM', phone: '0900 000 002', distance: '2.8km' }
];

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
    </Modal>
  );
};

export default StoreLocationModal;