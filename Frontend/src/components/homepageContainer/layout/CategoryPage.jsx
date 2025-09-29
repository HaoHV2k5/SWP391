import React from 'react'
import { useParams } from 'react-router-dom'
import { products } from '../../../data/productsdata';
import { ShoppingCart } from 'lucide-react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const CategoryPage = () => {
  const { type } = useParams();

  // Lấy sản phẩm theo category
  const categoryProducts = products.filter(p => p.type === type);

  const formatType = (str) => {
    const mapping = {
      "electric-scooter": "Xe máy điện",
      "electric-car": "Xe hơi điện", 
      "battery-charger": "Ắc quy",
      "accessories": "Phụ kiện",
      "service": "Dịch vụ",
    }
    return mapping[str] || str;
  }

  return (
    <div className="container py-4">
      <h2>Danh mục: {formatType(type)}</h2>
      <p>Tìm thấy {categoryProducts.length} sản phẩm</p>
      
      {/* Danh sách sản phẩm */}
      <Row className='g-4'>
        {categoryProducts.length > 0 ? (
          categoryProducts.map((product) => (
            <Col key={product.id} xs={12} md={6} lg={4}>
              <Card className="h-100 d-flex flex-column">
                <Card.Img 
                  variant="top"
                  src={product.image}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="h6">{product.name}</Card.Title>
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
            </Col>
          ))
        ) : (
          <p>Không có sản phẩm trong mục này!</p>
        )}
      </Row>
    </div>
  )
}

export default CategoryPage