import React from 'react';
import { Button, Card } from 'react-bootstrap';
import "bootstrap-icons/font/bootstrap-icons.css";
import { useSavedProducts } from '../contexts/SavedProductsContext';

const ProductCard = ({ product }) => {
  const { vehicleInfo, SellerInfo } = product;
  const { toggle, isSaved } = useSavedProducts();
  const saved = isSaved(product.id);

  return (
    <Card style={{
      height: "100%",
      cursor: "pointer"
    }}>

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
            marginBottom: "8px",
          }}>
            {vehicleInfo?.description || vehicleInfo?.title || product.name}
          </Card.Title>

          {/* Vehicle Info */}
          <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span>{product.year}</span>
              <span>{product.brand}</span>
              <span>{product.mileage ? `${product.mileage}km` : "Chưa có"}</span>
            </div>
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
            <i className="bi bi-geo-alt"></i> {SellerInfo?.sellerAddress}
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
          <Button variant={saved ? "danger" : "light"} size="sm" onClick={() => toggle(product)}>
            <i className={saved ? "bi bi-heart-fill" : "bi bi-heart"}></i>
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;