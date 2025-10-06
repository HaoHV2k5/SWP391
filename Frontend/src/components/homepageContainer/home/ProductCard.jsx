import React from 'react';
import { Button, Card } from 'react-bootstrap';
import "bootstrap-icons/font/bootstrap-icons.css";

const ProductCard = ({ product }) => {
  const { vehicleInfo, listingInfo } = product;

  return (
    <Card style={{
      height: "100%",
      transition: "transform 0.2s ease-in-out",
      cursor: "pointer"
    }}
      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>

      <Card.Img
        variant="top"
        src={product.image}
        style={{ height: "200px", objectFit: "cover" }}
      />

      <Card.Body style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          {/* Title */}
          <Card.Title style={{
            fontSize: "16px",
            fontWeight: "bold",
            marginBottom: "8px",
            color: "#333"
          }}>
            {listingInfo?.title || product.name}
          </Card.Title>

          {/* Vehicle Info */}
          <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
            <div> {vehicleInfo?.year}  
              {product.brand}  
              {vehicleInfo?.mileage ? `${vehicleInfo.mileage} km` : "Chưa có"}</div>
          </div>

          {/* Price */}
          <div style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#e74c3c",
            marginBottom: "10px"
          }}>
            {product.price}
          </div>

          {/* Location */}
          <div style={{ fontSize: "12px", color: "#999" }}>
            <i className="bi bi-geo-alt"></i> {listingInfo?.sellerAddress}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: "flex",
          gap: "8px",
          marginTop: "15px"
        }}>
          <Button variant="primary" size="sm" style={{ flex: 1 }}>
            <i className="bi bi-eye"></i> Xem chi tiết
          </Button>
          <Button variant="light" size="sm">
            <i className="bi bi-heart"></i>
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;