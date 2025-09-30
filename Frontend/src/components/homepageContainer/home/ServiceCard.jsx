import React from 'react';
import { Card } from 'react-bootstrap';
import { 
  Truck, 
  Shield, 
  RefreshCw, 
  Headphones,
  Wrench,
  Battery,
  Zap,
  Clock
} from 'lucide-react';

const ServiceCard = ({ service }) => {
  const getIcon = (iconName) => {
    const icons = {
      truck: Truck,
      shield: Shield,
      'refresh-cw': RefreshCw,
      headphones: Headphones,
      wrench: Wrench,
      battery: Battery,
      zap: Zap,
      clock: Clock
    };
    
    const IconComponent = icons[iconName] || Truck;
    return <IconComponent size={24} />;
  };

  return (
    <>
      <div style={{ color: "#2E7D32", marginBottom: "10px" }}>
        {getIcon(service.icon)}
      </div>
      <h3 style={{ 
        fontSize: "16px", 
        fontWeight: "600", 
        marginBottom: "5px",
        color: "#333"
      }}>
        {service.title}
      </h3>
      <p style={{ 
        fontSize: "14px", 
        color: "#666",
        margin: 0
      }}>
        {service.description}
      </p>
    </>
  );
};

export default ServiceCard;