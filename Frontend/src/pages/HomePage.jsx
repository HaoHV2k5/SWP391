import { useState } from "react";
import { Star, Heart, ShoppingCart, Phone, Truck, Shield, RotateCcw } from "lucide-react";
import FilterBar from "../components/FilterBar";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Hero banners data
  const heroBanners = [
    {
      id: 1,
      title: "VINFAST KLARA S",
      subtitle: "Xe điện đã qua sử dụng",
      image: "https://via.placeholder.com/300x200/0066CC/ffffff?text=VinFast+Klara",
      bgColor: "#2BB673"
    },
    {
      id: 2,
      title: "HONDA PCX ELECTRIC",
      subtitle: "Mở bán quà khủng",
      image: "https://via.placeholder.com/300x200/FF0000/ffffff?text=Honda+PCX",
      bgColor: "#2BB673"
    },
    {
      id: 3,
      title: "PIN LITHIUM-ION",
      subtitle: "Chất lượng cao",
      image: "https://via.placeholder.com/300x200/00AA00/ffffff?text=Pin+Li-ion",
      bgColor: "#2BB673"
    },
    {
      id: 4,
      title: "YAMAHA E01",
      subtitle: "Ưu đãi đăng ký sớm",
      image: "https://via.placeholder.com/300x200/0000FF/ffffff?text=Yamaha+E01",
      bgColor: "#2BB673"
    }
  ];

  // Products data
  const products = [
    {
      id: 1,
      name: "VinFast Klara S 2023 - Đã sử dụng 1 năm",
      originalPrice: "25.000.000đ",
      salePrice: "18.500.000đ",
      discount: "26%",
      rating: 4.8,
      image: "https://files01.danhgiaxe.com/E5ymWrMde4anYgID6PhKW8Gdw6g=/fit-in/1280x0/20230912/klara-xanh-154835.jpg",
      installment: "Trả góp 0%",
      isNew: false,
      type: "Xe điện"
    },
    {
      id: 2,
      name: "Pin Lithium-ion 48V 20Ah - Mới 95%",
      originalPrice: "4.500.000đ",
      salePrice: "3.200.000đ",
      discount: "29%",
      rating: 4.9,
      image: "https://bizweb.dktcdn.net/thumb/grande/100/433/676/products/pin-xe-may-dien-3-fe7c9482-c1df-4f57-8ac2-e0f227fca542.jpg?v=1719329369707",
      installment: "Trả góp 0%",
      isNew: false,
      type: "Pin"
    },
    {
      id: 3,
      name: "Honda PCX Electric 2022 - Đã sử dụng 2 năm",
      originalPrice: "35.000.000đ",
      salePrice: "28.000.000đ",
      discount: "20%",
      rating: 4.7,
      image: "https://www.checkraka.com/uploaded/logo/f7/f78a308ee33cc49223ef59e78aade972.webp",
      installment: "Trả góp 0%",
      isNew: false,
      type: "Xe điện"
    },
    {
      id: 4,
      name: "Pin sắt phosphate 60V 30Ah - Mới 90%",
      originalPrice: "5.800.000đ",
      salePrice: "4.200.000đ",
      discount: "28%",
      rating: 4.8,
      image: "https://pinnhapkhau.com/wp-content/uploads/2025/04/pin.jpg",
      installment: "Trả góp 0%",
      isNew: true,
      type: "Pin"
    },
    {
      id: 5,
      name: "Yamaha E01 2023 - Đã sử dụng 6 tháng",
      originalPrice: "42.000.000đ",
      salePrice: "35.000.000đ",
      discount: "17%",
      rating: 4.9,
      image: "https://vn.e-scooter.co/i/ya/ma/yamaha-e01/full/yamaha-e01-front-left-angle-view.webp",
      installment: "Trả góp 0%",
      isNew: false,
      type: "Xe điện"
    },
    {
      id: 6,
      name: "Pin Lithium-ion 72V 40Ah - Mới 85%",
      originalPrice: "7.200.000đ",
      salePrice: "5.500.000đ",
      discount: "24%",
      rating: 4.6,
      image: "https://vn.wellscooter.com/uploads/202236355/72v-40ah-lithium-ion-battery-black-iron-shell24027713161.jpg",
      installment: "Trả góp 0%",
      isNew: false,
      type: "Pin"
    },
    {
      id: 7,
      name: "VinFast VF8 2023 - Xe điện SUV đã qua sử dụng",
      originalPrice: "890.000.000đ",
      salePrice: "750.000.000đ",
      discount: "16%",
      rating: 4.7,
      image: "https://banggiavinfast.vn/wp-content/uploads/2022/08/Vinfast-vf8-2023-mau-do.jpg",
      installment: "Trả góp 0%",
      isNew: false,
      type: "Xe hơi điện"
    },
    {
      id: 8,
      name: "Tesla Model 3 2022 - Sedan điện đã qua sử dụng",
      originalPrice: "1.200.000.000đ",
      salePrice: "980.000.000đ",
      discount: "18%",
      rating: 4.9,
      image: "https://mkt-vehicleimages-prd.autotradercdn.ca/photos/chrome/Expanded/White/2022TSC030022/2022TSC03002201.jpg",
      installment: "Trả góp 0%",
      isNew: false,
      type: "Xe hơi điện"
    },
    {
      id: 9,
      name: "VinFast VF9 2023 - Xe điện 7 chỗ đã qua sử dụng",
      originalPrice: "1.100.000.000đ",
      salePrice: "920.000.000đ",
      discount: "16%",
      rating: 4.6,
      image: "https://vinfastgialam.com/wp-content/uploads/2022/06/VF9-IMAGE-2-1024x1024-1.jpg",
      installment: "Trả góp 0%",
      isNew: true,
      type: "Xe hơi điện"
    }
  ];

  // Hàm xử lý thay đổi bộ lọc
  const handleFilterChange = (filters) => {
    let filtered = [...products];

    // Lọc theo thương hiệu
    if (filters.brand) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    // Lọc theo khoảng giá
    if (filters.priceRange) {
      filtered = filtered.filter(product => {
        const price = parseInt(product.salePrice.replace(/[^\d]/g, ''));
        switch (filters.priceRange) {
          case 'under10m': return price < 10000000;
          case '10m-20m': return price >= 10000000 && price < 20000000;
          case '20m-30m': return price >= 20000000 && price < 30000000;
          case '30m-50m': return price >= 30000000 && price < 50000000;
          case '50m-100m': return price >= 50000000 && price < 100000000;
          case '100m-500m': return price >= 100000000 && price < 500000000;
          case '500m-1b': return price >= 500000000 && price < 1000000000;
          case 'over1b': return price >= 1000000000;
          default: return true;
        }
      });
    }

    // Lọc theo tình trạng
    if (filters.condition) {
      if (filters.condition === 'new') {
        filtered = filtered.filter(product => product.isNew);
      }
    }

    // Lọc theo loại xe
    if (filters.vehicleType) {
      filtered = filtered.filter(product => {
        switch (filters.vehicleType) {
          case 'xe-dien': return product.type === "Xe điện";
          case 'xe-hoi-dien': return product.type === "Xe hơi điện";
          case 'pin': return product.type === "Pin";
          default: return true;
        }
      });
    }

    // Lọc theo loại pin
    if (filters.batteryType) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(filters.batteryType.toLowerCase())
      );
    }

    // Lọc theo dung lượng pin
    if (filters.batteryCapacity) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(filters.batteryCapacity.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  // Sử dụng filteredProducts nếu có, ngược lại dùng products
  const displayProducts = filteredProducts.length > 0 ? filteredProducts : products;

  return (
    <div style={{ width: "100%", overflowX: "hidden", background: "#f5f5f5" }}>
      {/* Hero Banners Section */}
      <section style={{ padding: "20px 0", background: "#fff" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
            gap: "15px",
            marginBottom: "20px"
          }}>
            {heroBanners.map((banner) => (
              <div
                key={banner.id}
                style={{
                  background: banner.bgColor,
                  borderRadius: "8px",
                  padding: "20px",
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "transform 0.3s ease"
                }}
                onMouseEnter={(e) => e.target.style.transform = "scale(1.02)"}
                onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
              >
                <div style={{ position: "relative", zIndex: 2 }}>
                  <h3 style={{ 
                    fontSize: "18px", 
                    fontWeight: "bold", 
                    marginBottom: "5px",
                    lineHeight: "1.2"
                  }}>
                    {banner.title}
                  </h3>
                  <p style={{ 
                    fontSize: "14px", 
                    opacity: 0.9,
                    margin: 0
                  }}>
                    {banner.subtitle}
                  </p>
                </div>
                <div style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  opacity: 0.3,
                  fontSize: "60px"
                }}>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Event Banner */}
      <section style={{ padding: "15px 0", background: "#2BB673", color: "white" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          <h2 style={{ 
            fontSize: "24px", 
            fontWeight: "bold", 
            margin: 0,
            textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
          }}>
            Ngày hội Xe điện 2025 - Săn deal ngay!
          </h2>
        </div>
      </section>

      {/* Filter Bar Section */}
      <FilterBar onFilterChange={handleFilterChange} />

      {/* Products Section */}
      <section style={{ padding: "30px 0", background: "#fff" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <h2 style={{ 
            fontSize: "24px", 
            fontWeight: "bold", 
            marginBottom: "20px",
            color: "#333"
          }}>
            Xe điện & Pin nổi bật
            {filteredProducts.length > 0 && (
              <span style={{ 
                fontSize: "16px", 
                fontWeight: "normal", 
                color: "#666",
                marginLeft: "10px"
              }}>
                ({filteredProducts.length} sản phẩm)
              </span>
            )}
          </h2>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: "25px",
            padding: "20px 0"
          }}>
            {displayProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "12px",
                  padding: "20px",
                  position: "relative",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  minHeight: "450px",
                  display: "flex",
                  flexDirection: "column"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-5px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }}
              >
                {/* Discount Badge */}
                <div style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  background: "#00A86B",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
                  -{product.discount}
                </div>

                {/* New Badge */}
                {product.isNew && (
                  <div style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "#28a745",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}>
                    MỚI
                  </div>
                )}

                {/* Type Badge */}
                <div style={{
                  position: "absolute",
                  top: "10px",
                  right: product.isNew ? "60px" : "10px",
                  background: product.type === "Pin" ? "#00AA00" : 
                              product.type === "Xe hơi điện" ? "#8B4513" : "#0066CC",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
                  {product.type}
                </div>

                {/* Product Image */}
                <div style={{ 
                  textAlign: "center", 
                  marginBottom: "20px",
                  height: "220px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  overflow: "hidden"
                }}>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    style={{ 
                      maxWidth: "100%", 
                      maxHeight: "100%",
                      objectFit: "contain",
                      transition: "transform 0.3s ease"
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div style={{
                    display: "none",
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#e9ecef",
                    color: "#6c757d",
                    fontSize: "14px"
                  }}>
                    Hình ảnh không khả dụng
                  </div>
                </div>

                {/* Product Name */}
                <h3 style={{ 
                  fontSize: "16px", 
                  fontWeight: "600",
                  marginBottom: "12px",
                  color: "#333",
                  lineHeight: "1.4",
                  height: "44px",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  flex: "0 0 auto"
                }}>
                  {product.name}
                </h3>

                {/* Rating */}
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "6px",
                  marginBottom: "12px",
                  flex: "0 0 auto"
                }}>
                  <div style={{ display: "flex", gap: "2px" }}>
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < Math.floor(product.rating) ? "#ffc107" : "none"}
                        color={i < Math.floor(product.rating) ? "#ffc107" : "#ddd"}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: "13px", color: "#666", fontWeight: "500" }}>
                    ({product.rating})
                  </span>
                </div>

                {/* Price */}
                <div style={{ marginBottom: "12px", flex: "0 0 auto" }}>
                  <div style={{ 
                    fontSize: "18px", 
                    fontWeight: "bold", 
                    color: "#00A86B",
                    marginBottom: "4px"
                  }}>
                    {product.salePrice}
                  </div>
                  <div style={{ 
                    fontSize: "13px", 
                    color: "#999",
                    textDecoration: "line-through"
                  }}>
                    {product.originalPrice}
                  </div>
                </div>

                {/* Installment */}
                <div style={{ 
                  fontSize: "13px", 
                  color: "#28a745",
                  fontWeight: "500",
                  marginBottom: "20px",
                  flex: "0 0 auto"
                }}>
                  {product.installment}
                </div>

                {/* Action Buttons */}
                <div style={{ 
                  display: "flex", 
                  gap: "12px",
                  alignItems: "center",
                  marginTop: "auto",
                  flex: "0 0 auto"
                }}>
                  <button style={{
                    flex: 1,
                    background: "#00A86B",
                    color: "white",
                    border: "none",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 8px rgba(0, 168, 107, 0.2)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#007A4B";
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = "0 4px 12px rgba(0, 168, 107, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#00A86B";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 2px 8px rgba(0, 168, 107, 0.2)";
                  }}>
                    <ShoppingCart size={16} />
                    Mua ngay
                  </button>
                  <button style={{
                    background: "none",
                    border: "2px solid #e0e0e0",
                    padding: "12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = "#00A86B";
                    e.target.style.backgroundColor = "#f0f9f0";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.backgroundColor = "transparent";
                  }}>
                    <Heart size={16} color="#666" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section style={{ padding: "30px 0", background: "#f8f9fa" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "20px"
          }}>
            {[
              { icon: <Truck size={24} color="#2E7D32" />, title: "Giao hàng nhanh", desc: "Miễn phí cho đơn từ 500k" },
              { icon: <Shield size={24} color="#2E7D32" />, title: "Bảo hành xe điện", desc: "Hỗ trợ kỹ thuật 24/7" },
              { icon: <RotateCcw size={24} color="#2E7D32" />, title: "Thu cũ đổi mới", desc: "Giá cao, thủ tục nhanh" },
              { icon: <Phone size={24} color="#2E7D32" />, title: "Tư vấn xe điện", desc: "Hotline 1800 2097" }
            ].map((service, index) => (
              <div key={index} style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "8px",
                textAlign: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>
                <div style={{ marginBottom: "10px" }}>
                  {service.icon}
                </div>
                <h3 style={{ 
                  fontSize: "16px", 
                  fontWeight: "600", 
                  marginBottom: "5px",
                  color: "#333"
                }}>
                  {service.title}
                </h3>
                <p style={{ 
                  fontSize: "14px", 
                  color: "#666",
                  margin: 0
                }}>
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
