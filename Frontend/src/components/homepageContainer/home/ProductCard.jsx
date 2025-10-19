import { Button, Card } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useSavedProducts } from "../contexts/SavedProductsContext";

const ProductCard = ({ product }) => {
  const { vehicleInfo, SellerInfo } = product;
  const { toggle, isSaved } = useSavedProducts();
  const saved = isSaved(product.id);

  return (
    <Card
      style={{
        height: "100%",
        cursor: "pointer",
      }}
    >
      <Card.Img
        variant="top"
        src={
          product.image ||
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=="
        }
        style={{ height: "200px", objectFit: "cover" }}
        onError={(e) => {
          e.currentTarget.src =
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
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
              vehicleInfo?.title ||
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
              vehicleInfo?.description ||
              "Không có mô tả"}
          </div>

          {/* Vehicle Info */}
          <div
            style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}
          >
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span>{product.year}</span>
              <span>{product.brand}</span>
            </div>
          </div>

          {/* Price */}
          <div
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#e74c3c",
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{product.price}</span>
            <Button
              variant={saved ? "danger" : "light"}
              size="sm"
              onClick={() => toggle(product)}
              style={{ padding: "4px 8px" }}
            >
              <i className={saved ? "bi bi-heart-fill" : "bi bi-heart"}></i>
            </Button>
          </div>

          {/* Location */}
          <div style={{ fontSize: "12px", color: "#999" }}>
            <i className="bi bi-geo-alt"></i> {SellerInfo?.sellerAddress}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
