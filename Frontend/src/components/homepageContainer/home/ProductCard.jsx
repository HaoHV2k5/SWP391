import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { ShoppingCart } from 'lucide-react';

const ProductCard = ({ product }) => {
  return (
    <Card>
      <Card.Img
        variant="top"
        src={product.image}
        style={{ height: "200px", objectFit: "cover" }}
      />
      <Card.Body>
        <Card.Text className="h6">
          {product.name}
        </Card.Text>
        <Card.Text className="flex-grow-1">
          Giá gốc: {product.originalPrice} <br />
          Giá khuyến mãi: {product.salePrice}
        </Card.Text>
        <Button variant="primary" className="w-100 mt-auto">
          <ShoppingCart size={16} className="me-2" />
          Mua ngay
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;