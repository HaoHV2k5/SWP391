import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Youtube, Instagram, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer style={{ 
      background: "#2c2c2c", 
      color: "#fff", 
      padding: "40px 0 20px 0",
      marginTop: "50px"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        {/* Main Footer Content */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "30px",
          marginBottom: "30px"
        }}>
          {/* Company Info */}
          <div>
            <h3 style={{ 
              fontSize: "18px", 
              fontWeight: "bold", 
              marginBottom: "15px",
              color: "#00A86B"
            }}>
              ElectricStore - Xe điện, pin, phụ kiện chính hãng
            </h3>
            <p style={{ 
              fontSize: "14px", 
              lineHeight: "1.6", 
              marginBottom: "15px",
              color: "#ccc"
            }}>
              Công ty TNHH Thương Mại và Dịch Vụ Xe Điện ĐIỆN LỰC - GPĐKKD: 0316172372 cấp tại Sở KH & ĐT TP. HCM.
            </p>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              marginBottom: "10px",
              fontSize: "14px"
            }}>
              <MapPin size={16} color="#00A86B" />
              <span>350-352 Võ Văn Kiệt, Phường Cô Giang, Quận 1, TP. HCM</span>
            </div>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              fontSize: "14px"
            }}>
              <Phone size={16} color="#00A86B" />
              <span>028.7108.9666</span>
            </div>
          </div>

          {/* Product Categories */}
          <div>
            <h4 style={{ 
              fontSize: "16px", 
              fontWeight: "bold", 
              marginBottom: "15px",
              color: "#fff"
            }}>
              Sản phẩm
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                "VinFast Klara S", "VinFast Theon", "VinFast Feliz", "Honda PCX Electric", "Honda SH Electric",
                "Yamaha E01", "Yamaha EMF", "Piaggio Vespa Elettrica", "Pin Lithium-ion", "Pin sắt phosphate",
                "Pin 48V", "Pin 60V", "Pin 72V", "Sạc xe điện", "Phụ kiện xe điện", "Mũ bảo hiểm", "Áo mưa", "Găng tay",
                "Bảo hiểm xe điện", "Đăng ký xe điện", "Bảo dưỡng xe điện", "Sửa chữa xe điện", "Thu cũ đổi mới"
              ].map((item, index) => (
                <Link 
                  key={index}
                  to="#" 
                  style={{ 
                    color: "#ccc", 
                    textDecoration: "none", 
                    fontSize: "13px",
                    padding: "2px 0",
                    transition: "color 0.3s"
                  }}
                  onMouseEnter={(e) => e.target.style.color = "#2E7D32"}
                  onMouseLeave={(e) => e.target.style.color = "#ccc"}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h4 style={{ 
              fontSize: "16px", 
              fontWeight: "bold", 
              marginBottom: "15px",
              color: "#fff"
            }}>
              Chính sách mua hàng và bảo hành
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                "Mua xe điện và thanh toán Online",
                "Mua xe điện trả góp Online",
                "Mua xe điện trả góp bằng thẻ tín dụng",
                "Chính sách giao hàng xe điện",
                "Chính sách đổi trả xe điện",
                "Tra điểm thành viên",
                "Xem ưu đãi thành viên",
                "Tra thông tin bảo hành xe điện",
                "Tra cứu hoá đơn điện tử",
                "Thông tin hoá đơn mua xe điện",
                "Trung tâm bảo hành xe điện",
                "Quy định về việc bảo dưỡng xe điện",
                "Chính sách kiểm tra xe điện",
                "VAT Refund"
              ].map((item, index) => (
                <Link 
                  key={index}
                  to="#" 
                  style={{ 
                    color: "#ccc", 
                    textDecoration: "none", 
                    fontSize: "13px",
                    padding: "2px 0",
                    transition: "color 0.3s"
                  }}
                  onMouseEnter={(e) => e.target.style.color = "#2E7D32"}
                  onMouseLeave={(e) => e.target.style.color = "#ccc"}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Other Services */}
          <div>
            <h4 style={{ 
              fontSize: "16px", 
              fontWeight: "bold", 
              marginBottom: "15px",
              color: "#fff"
            }}>
              Dịch vụ và thông tin khác
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                "Khách hàng doanh nghiệp (B2B)",
                "Ưu đãi thanh toán xe điện",
                "Quy chế hoạt động",
                "Chính sách bảo mật thông tin cá nhân",
                "Chính sách Bảo hành xe điện",
                "Liên hệ hợp tác kinh doanh",
                "Tuyển dụng",
                "Dịch vụ bảo hành mở rộng xe điện"
              ].map((item, index) => (
                <Link 
                  key={index}
                  to="#" 
                  style={{ 
                    color: "#ccc", 
                    textDecoration: "none", 
                    fontSize: "13px",
                    padding: "2px 0",
                    transition: "color 0.3s"
                  }}
                  onMouseEnter={(e) => e.target.style.color = "#2E7D32"}
                  onMouseLeave={(e) => e.target.style.color = "#ccc"}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div style={{ 
          borderTop: "1px solid #444", 
          paddingTop: "20px",
          marginBottom: "20px"
        }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "20px"
          }}>
            <div style={{ textAlign: "center" }}>
              <h5 style={{ 
                fontSize: "14px", 
                fontWeight: "bold", 
                marginBottom: "10px",
                color: "#00A86B"
              }}>
                Mua hàng
              </h5>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                gap: "5px",
                fontSize: "16px",
                fontWeight: "bold"
              }}>
                <Phone size={16} />
                <span>1800.2097</span>
              </div>
              <p style={{ fontSize: "12px", color: "#ccc", margin: "5px 0 0 0" }}>
                (7h30 - 22h00)
              </p>
            </div>
            
            <div style={{ textAlign: "center" }}>
              <h5 style={{ 
                fontSize: "14px", 
                fontWeight: "bold", 
                marginBottom: "10px",
                color: "#00A86B"
              }}>
                Bảo hành
              </h5>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                gap: "5px",
                fontSize: "16px",
                fontWeight: "bold"
              }}>
                <Phone size={16} />
                <span>1800.2097</span>
              </div>
              <p style={{ fontSize: "12px", color: "#ccc", margin: "5px 0 0 0" }}>
                (7h30 - 22h00)
              </p>
            </div>
            
            <div style={{ textAlign: "center" }}>
              <h5 style={{ 
                fontSize: "14px", 
                fontWeight: "bold", 
                marginBottom: "10px",
                color: "#00A86B"
              }}>
                Khiếu nại
              </h5>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                gap: "5px",
                fontSize: "16px",
                fontWeight: "bold"
              }}>
                <Phone size={16} />
                <span>1800.2063</span>
              </div>
              <p style={{ fontSize: "12px", color: "#ccc", margin: "5px 0 0 0" }}>
                (8h00 - 21h30)
              </p>
            </div>
            
            <div style={{ textAlign: "center" }}>
              <h5 style={{ 
                fontSize: "14px", 
                fontWeight: "bold", 
                marginBottom: "10px",
                color: "#00A86B"
              }}>
                Tìm cửa hàng gần nhất
              </h5>
              <button style={{
                background: "#2E7D32",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                fontSize: "12px",
                cursor: "pointer"
              }}>
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>

        {/* Social Media & App Download */}
        <div style={{ 
          borderTop: "1px solid #444", 
          paddingTop: "20px",
          marginBottom: "20px"
        }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: "30px",
            alignItems: "center"
          }}>
            <div>
              <h5 style={{ 
                fontSize: "14px", 
                fontWeight: "bold", 
                marginBottom: "10px",
                color: "#00A86B"
              }}>
                Mua sắm dễ dàng – Ưu đãi ngập tràn cùng app ElectricStore
              </h5>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ 
                  background: "#fff", 
                  padding: "5px", 
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px"
                }}>
                  <span style={{ fontSize: "12px" }}>📱</span>
                  <span style={{ fontSize: "12px", color: "#333" }}>QR tải app</span>
                </div>
                <button style={{
                  background: "#000",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  cursor: "pointer"
                }}>
                  Tải app từ Google Play
                </button>
                <button style={{
                  background: "#000",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  cursor: "pointer"
                }}>
                  Tải app từ App Store
                </button>
              </div>
            </div>
            
            <div>
              <h5 style={{ 
                fontSize: "14px", 
                fontWeight: "bold", 
                marginBottom: "10px",
                color: "#00A86B"
              }}>
                Kết nối với ElectricStore
              </h5>
              <div style={{ display: "flex", gap: "15px" }}>
                <a href="#" style={{ color: "#ccc", transition: "color 0.3s" }}>
                  <Facebook size={20} />
                </a>
                <a href="#" style={{ color: "#ccc", transition: "color 0.3s" }}>
                  <Youtube size={20} />
                </a>
                <a href="#" style={{ color: "#ccc", transition: "color 0.3s" }}>
                  <Instagram size={20} />
                </a>
                <a href="#" style={{ color: "#ccc", transition: "color 0.3s" }}>
                  <MessageCircle size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div style={{ 
          borderTop: "1px solid #444", 
          paddingTop: "20px",
          marginBottom: "20px"
        }}>
          <h5 style={{ 
            fontSize: "14px", 
            fontWeight: "bold", 
            marginBottom: "10px",
            color: "#2E7D32"
          }}>
            Phương thức thanh toán
          </h5>
          <div style={{ 
            display: "flex", 
            gap: "10px", 
            flexWrap: "wrap",
            alignItems: "center"
          }}>
            {[
              "💳 Thẻ tín dụng", "🏦 Chuyển khoản", "💰 Tiền mặt", 
              "📱 Ví điện tử", "🏪 Trả góp", "💎 Thành viên"
            ].map((method, index) => (
              <span 
                key={index}
                style={{ 
                  background: "#444", 
                  padding: "5px 10px", 
                  borderRadius: "4px",
                  fontSize: "12px"
                }}
              >
                {method}
              </span>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div style={{ 
          borderTop: "1px solid #444", 
          paddingTop: "20px",
          textAlign: "center"
        }}>
          <p style={{ 
            fontSize: "12px", 
            color: "#999", 
            margin: 0,
            lineHeight: "1.6"
          }}>
            © 2024 ElectricStore. Tất cả quyền được bảo lưu.<br/>
            Chuyên bán xe điện và pin đã qua sử dụng
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
