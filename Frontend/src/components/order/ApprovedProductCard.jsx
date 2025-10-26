import { Card } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";

const ApprovedProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  // Format giá tiền theo định dạng Việt Nam
  const formatPrice = (price) => {
    if (!price) return "0 ₫";
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(numPrice);
  };

  // Lấy URL hình ảnh từ các trường có thể có
  const getImageUrl = () => {
    // Thử các trường có thể chứa hình ảnh (ưu tiên imageUrls từ backend)
    const imageFields = [
      product.imageUrls?.[0], // Backend trả về imageUrls array
      product.image,
      product.imageUrl,
      product.images?.[0],
      product.productImages?.[0],
      product.attachments?.[0],
      product.media?.[0],
      product.vehicleInfo?.imageUrls?.[0],
      product.vehicleInfo?.image,
      product.vehicleInfo?.imageUrl,
      product.vehicleInfo?.images?.[0],
      product.vehicleInfo?.productImages?.[0],
      product.vehicleInfo?.attachments?.[0],
      product.vehicleInfo?.media?.[0]
    ];

    for (const field of imageFields) {
      if (field && typeof field === 'string' && field.trim() !== '') {
        return field;
      }
    }

    // Trả về placeholder nếu không có hình ảnh
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
  };

  return (
    <Card
      style={{
        height: "100%",
        cursor: "pointer",
      }}
      onClick={handleCardClick}
    >
      <Card.Img
        variant="top"
        src={getImageUrl()}
        style={{ height: "200px", objectFit: "cover" }}
        onError={(e) => {
          e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
        }}
      />

      <Card.Body
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          {/* Title */}
          <Card.Title
            style={{
              fontSize: "16px",
              marginBottom: "4px",
              fontWeight: "500",
              lineHeight: "1.4",
              color: "#333",
            }}
          >
            {product.title ||
              product.vehicleInfo?.title ||
              product.name ||
              "Không có tiêu đề"}
          </Card.Title>

          {/* Description */}
          <div
            style={{
              fontSize: "14px",
              color: "#666",
              marginBottom: "8px",
              lineHeight: "1.3",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.description ||
              product.vehicleInfo?.description ||
              "Không có mô tả"}
          </div>

          {/* Vehicle Info */}
          <div
            style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}
          >
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span>{product.year || product.yearManufactured}</span>
              <span>{product.brand}</span>
            </div>
          </div>

          {/* Price - Format đúng cách */}
          <div
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#e74c3c",
              marginBottom: "10px",
            }}
          >
            {formatPrice(product.price)}
          </div>

          {/* Location */}
          <div style={{ fontSize: "12px", color: "#999" }}>
            <i className="bi bi-geo-alt"></i> {product.SellerInfo?.sellerAddress || "Không có địa chỉ"}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ApprovedProductCard;
