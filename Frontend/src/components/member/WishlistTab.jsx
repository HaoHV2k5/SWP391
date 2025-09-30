import { XCircle } from "lucide-react";

const WishlistTab = ({ wishlist, formatCurrency }) => {
  return (
    <div className="member-card" style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ color: "#333", margin: 0 }}>Danh sách yêu thích</h3>
        <p style={{ color: "#666", margin: 0 }}>
          {wishlist.length} sản phẩm
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {wishlist.map((item) => (
          <div
            key={item.id}
            style={{
              background: "#f8f9fa",
              borderRadius: "12px",
              border: "1px solid #e9ecef",
              padding: "1.5rem",
              transition: "all 0.3s ease",
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                borderRadius: "10px",
                marginBottom: "1rem",
              }}
            />
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>
              {item.name}
            </h4>
            <p style={{ margin: "0 0 1rem 0", fontWeight: "600", color: "#00A86B" }}>
              {formatCurrency(item.price)}
            </p>
            <p style={{ margin: "0 0 1rem 0", color: "#666", fontSize: "0.9rem" }}>
              Đã thêm: {item.addedDate}
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="member-btn-primary"
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                }}
              >
                Mua ngay
              </button>
              <button
                className="member-btn"
                style={{
                  padding: "0.75rem",
                  borderRadius: "8px",
                }}
              >
                <XCircle size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistTab;
