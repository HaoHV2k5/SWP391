import { useState } from "react";
import { Car, Zap, Shield, Star, ArrowRight, Battery } from "lucide-react";
import logoImage from "../assets/images/z7010476232855_5640f4cbb91e0087128c1d8b7fc29d33.jpg";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const features = [
    {
      icon: <Battery size={48} className="text-blue-500" />,

      title: "Pin xe điện chất lượng cao",
      description:
        "Các loại pin lithium-ion, pin sắt phosphate với hiệu suất cao và độ bền lâu dài",
    },
    {
      icon: <Car size={48} className="text-green-500" />,
      title: "Xe điện đã qua sử dụng",
      description:
        "Xe điện đã qua sử dụng được kiểm định kỹ lưỡng, đảm bảo chất lượng",
    },
    {
      icon: <Shield size={48} className="text-purple-500" />,
      title: "Bảo hành uy tín",
      description: "Chế độ bảo hành minh bạch, hỗ trợ kỹ thuật 24/7",
    },
    {
      icon: <Zap size={48} className="text-yellow-500" />,
      title: "Giao dịch nhanh chóng",
      description:
        "Quy trình giao dịch đơn giản, thanh toán an toàn và nhanh chóng",
    },
  ];

  const products = [
    {
      id: 1,
      name: "Pin Lithium-ion 48V 20Ah",
      price: "2,500,000 VNĐ",
      image: "🔋",
      condition: "Mới 95%",
      type: "Pin",
    },
    {
      id: 2,
      name: "Xe điện VinFast Klara S",
      price: "15,000,000 VNĐ",
      image: "🛵",
      condition: "Đã sử dụng 1 năm",
      type: "Xe điện",
    },
    {
      id: 3,
      name: "Pin sắt phosphate 60V 30Ah",
      price: "3,200,000 VNĐ",
      image: "🔋",
      condition: "Mới 90%",
      type: "Pin",
    },
    {
      id: 4,
      name: "Xe điện Honda PCX Electric",
      price: "25,000,000 VNĐ",
      image: "🛵",
      condition: "Đã sử dụng 6 tháng",
      type: "Xe điện",
    },
  ];

  return (
    <div className="homepage" style={{ width: "100%", overflowX: "hidden" }}>
      {/* Hero Section */}
      <section
        className="hero fpt-hero"
        style={{
          background:
            "radial-gradient(1200px 420px at 30% -10%, rgba(33,150,243,.35), rgba(0,0,0,0))," +
            "radial-gradient(900px 380px at 90% -20%, rgba(2,132,199,.30), rgba(0,0,0,0))," +
            "linear-gradient(180deg, rgba(11,18,32,1) 0%, rgba(10,17,30,1) 100%)",
          color: "#fff",
          padding: "3.4rem 0",
        }}
      >
        <div
          className="container"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.25rem" }}
        >
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontSize: "3rem",
                marginBottom: ".5rem",
                fontWeight: 900,
                letterSpacing: ".3px",
              }}
            >
              Nền tảng giao dịch pin và xe điện
            </h1>
            <p style={{ fontSize: "1.1rem", marginBottom: "1.25rem", opacity: 0.9, color: "#e5e5e5" }}>
              Kết nối người mua và bán pin, xe điện đã qua sử dụng — an toàn, tiện lợi
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: ".75rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              placeholder="Tìm kiếm pin, xe điện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "0.9rem 1rem",
                borderRadius: "10px",
                border: "2px solid #2196f3",
                background: "#ffffff",
                color: "#0e1b2b",
                fontSize: "1rem",
                minWidth: "300px",
                flex: "1",
                maxWidth: "520px",
                outline: "none",
              }}
            />
            <button className="btn btn-primary" style={{ padding: "0.9rem 1.25rem", fontWeight: 800 }}>
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "3rem 0", background: "#f5fbff" }}>
        <div
          className="container"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.25rem" }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              fontSize: "2.2rem",
              color: "#1565c0",
              fontWeight: 900,
            }}
          >
            Tại sao chọn chúng tôi?
          </h2>
          <div className="grid grid-2">
            {features.map((feature, index) => (
              <div key={index} className="card" style={{ textAlign: "center" }}>
                <div style={{ marginBottom: "1rem" }}>{feature.icon}</div>
                <h3
                  style={{
                    marginBottom: "0.75rem",
                    fontSize: "1.35rem",
                    color: "#0e1b2b",
                  }}
                >
                  {feature.title}
                </h3>
                <p style={{ color: "#4f6b8a", lineHeight: "1.6" }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section style={{ padding: "3rem 0", background: "#ffffff" }}>
        <div
          className="container"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.25rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
            }}
          >
            <h2 style={{ fontSize: "2.1rem", color: "#0e1b2b", fontWeight: 900 }}>
              Sản phẩm nổi bật
            </h2>
            <button className="btn btn-secondary">
              Xem tất cả <ArrowRight className="inline-block ml-1" size={16} />
            </button>
          </div>

          <div className="grid grid-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="card"
                style={{ cursor: "pointer", transition: "transform 0.2s" }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    textAlign: "center",
                    marginBottom: "1rem",
                  }}
                >
                  {product.image}
                </div>
                <h3
                  style={{
                    marginBottom: "0.5rem",
                    fontSize: "1.1rem",
                    color: "#0e1b2b",
                  }}
                >
                  {product.name}
                </h3>
                <p style={{ color: "#4f6b8a", marginBottom: "1rem" }}>
                  {product.condition}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      color: "#1976d2",
                    }}
                  >
                    {product.price}
                  </span>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "15px",
                      fontSize: "0.8rem",
                      backgroundColor: product.type === "Pin" ? "#1a1a1a" : "#171a14",
                      color: product.type === "Pin" ? "#64b5f6" : "#a5d6a7",
                    }}
                  >
                    {product.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: "3rem 0", background: "linear-gradient(180deg, #e3f2fd 0%, #bbdefb 100%)", color: "#0e1b2b" }}>
        <div
          className="container"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.25rem" }}
        >
          <div className="grid grid-3" style={{ textAlign: "center" }}>
            <div>
              <h3 style={{ fontSize: "3rem", marginBottom: "0.5rem", color: "#1565c0" }}>500+</h3>
              <p>"Sản phẩm đã bán"</p>
            </div>
            <div>
              <h3 style={{ fontSize: "3rem", marginBottom: "0.5rem", color: "#1565c0" }}>
                1000+
              </h3>
              <p>"Khách hàng tin tưởng"</p>
            </div>
            <div>
              <h3 style={{ fontSize: "3rem", marginBottom: "0.5rem", color: "#1565c0" }}>99%</h3>
              <p>"Đánh giá tích cực"</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
