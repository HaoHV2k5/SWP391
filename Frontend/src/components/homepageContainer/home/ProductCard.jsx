import { Button, Card } from "react-bootstrap";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import wishlistService from "../../../services/wishlistService";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { vehicleInfo, SellerInfo } = product;
  const navigate = useNavigate();
  const [state, setState] = useState({
    savedProducts: [],
    loading: false,
    initialized: false
  });

  // Subscribe to wishlistService state changes
  useEffect(() => {
    const initialState = wishlistService.getCurrentState();
    setState(initialState);

    const unsubscribe = wishlistService.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  const saved = wishlistService.isSaved(product.id);

  const handleCardClick = (e) => {
    // Ngăn chặn event khi click vào heart button
    if (e.target.closest("button")) return;
    navigate(`/product/${product.id}`);
  };

  return (
    <Card
      style={{
        height: "100%",
        cursor: "pointer",
        position: "relative",
      }}
      onClick={handleCardClick}
    >
      <div style={{ position: "relative" }}>
        {/* Approved Badge - Hiển thị khi có approvedLabel */}
        {product.approvedLabel && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              zIndex: 10,
              background: "#f0fdf4",
              color: "#16a34a",
              padding: "6px 10px",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: "600",
              border: "1px solid #bbf7d0",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
            title="Đã được kiểm duyệt"
          >
            <i className="bi bi-patch-check-fill" style={{ fontSize: "13px", color: "#16a34a" }}></i>
            <span style={{ color: "#16a34a" }}>Đã kiểm duyệt</span>
          </div>
        )}

        <Card.Img
          variant="top"
          src={
            product.imageUrls?.[0] ||
            product.image ||
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=="
          }
          style={{ height: "200px", objectFit: "cover" }}
          onError={(e) => {
            e.currentTarget.src =
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
          }}
        />
      </div>

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
            <span>{product.price || "Liên hệ"}</span>
            <Button
              variant={saved ? "danger" : "light"}
              size="sm"
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const wasSaved = wishlistService.isSaved(product.id);
                  
                  if (wasSaved) {
                    // Nếu đã lưu rồi thì bỏ lưu
                    await wishlistService.remove(product.id);
                    toast.success("Đã bỏ lưu tin đăng!");
                  } else {
                    // Nếu chưa lưu thì lưu và hiển thị thông báo
                    try {
                      await wishlistService.add(product);
                      toast.success("Tin đã được lưu vào danh sách theo dõi");
                    } catch (addError) {
                      console.error("Error adding to wishlist:", addError);
                      toast.error("Có lỗi xảy ra khi lưu tin đăng");
                    }
                  }
                } catch (error) {
                  console.error("Error toggling wishlist:", error);
                  toast.error("Có lỗi xảy ra khi lưu tin đăng");
                }
              }}
              style={{ padding: "4px 8px" }}
              title={saved ? "Bỏ lưu" : "Lưu tin"}
            >
              <i className={saved ? "bi bi-heart-fill" : "bi bi-heart"}></i>
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
