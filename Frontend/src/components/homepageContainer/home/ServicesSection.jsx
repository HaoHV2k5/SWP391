import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import ServiceCard from './ServiceCard';
import { servicesData } from '../../../data/homepagedata';

const ServicesSection = () => {
  return (
    <section style={{ padding: "30px 0", background: "#f8f9fa" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "20px"
        }}>
          {servicesData.map((service, index) => (
            <div key={index} style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;