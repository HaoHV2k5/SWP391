import React from 'react'
import { useParams } from 'react-router-dom'
import { vehicleListings } from '../../../data/productsData';
import { ShoppingCart } from 'lucide-react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import FilterBar from '../../FilterBar';
import useProductFilter from '../../../hooks/useProductFilter';

const CategoryPage = () => {
  const { type } = useParams();

  // Lấy tất cả tin đăng xe điện đang hoạt động
  const activeListings = vehicleListings.filter(listing => listing.isActive);

  const {
    filteredProducts,
    handleFiltersChange,
  } = useProductFilter(activeListings);

  // Lấy sản phẩm theo category
  const categoryProducts = filteredProducts.filter(p => p.type === type);

  const formatType = (str) => {
    const mapping = {
      "electric-scooter": "Xe máy điện",
      "electric-car": "Xe hơi điện",
      "electric-bicycle": "Xe đạp điện",
      "battery-charger": "Ắc quy",
      "accessories": "Phụ kiện",
      "service": "Dịch vụ",
    }
    return mapping[str] || str;
  }

  return (
    <div className="container py-4">

      <FilterBar onFilterChange={handleFiltersChange} />

      <h2>Danh mục: {formatType(type)}</h2>

      <p>Tìm thấy {categoryProducts.length} sản phẩm</p>


      {/* Danh sách sản phẩm */}
      <Row className='g-4'>
        {categoryProducts.map((product) => (
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
                  {product.description} <br />
                  <div style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#e74c3c",
                    marginBottom: "10px"
                  }}>
                    {product.price}
                  </div>
                </Card.Text>
                <Button variant="primary" className="w-100 mt-auto">
                  <ShoppingCart size={16} className="me-2" />
                  Mua ngay
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default CategoryPage