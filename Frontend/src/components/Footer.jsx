import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Youtube, Instagram, MessageCircle, QrCode, ArrowUp } from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{ 
      background: "#2c2c2c", 
      color: "#fff", 
      padding: "30px 0 15px 0",
      marginTop: "50px"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        {/* Main Footer Content */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "25px",
          marginBottom: "25px"
        }}>
          {/* Column 1: Support Hotline & Newsletter */}
          <div>
            <h4 style={{ 
              fontSize: "15px", 
              fontWeight: "bold", 
              marginBottom: "12px",
              color: "#fff"
            }}>
              Tổng đài hỗ trợ miễn phí
            </h4>
            <div style={{ marginBottom: "15px" }}>
              <p style={{ fontSize: "13px", marginBottom: "4px", color: "#ccc" }}>
                Mua hàng - bảo hành <strong style={{ color: "#00A86B" }}>1800.2097</strong> (7h30 - 22h00)
              </p>
              <p style={{ fontSize: "13px", marginBottom: "4px", color: "#ccc" }}>
                Khiếu nại <strong style={{ color: "#00A86B" }}>1800.2063</strong> (8h00 - 21h30)
              </p>
            </div>

            <h5 style={{ 
              fontSize: "13px", 
              fontWeight: "bold", 
              marginBottom: "8px",
              color: "#fff"
            }}>
              Phương thức thanh toán
            </h5>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(5, 1fr)", 
              gap: "6px",
              marginBottom: "15px"
            }}>
              {[
                "Apple Pay", "VNPay", "Momo", "OnePay", "mPOS",
                "Kredivo", "ZaloPay", "AlePay", "Fundiin", "Pay Later"
              ].map((method, index) => (
                <div 
                  key={index}
                  style={{ 
                    background: "#444", 
                    padding: "6px 3px", 
                    borderRadius: "3px",
                    fontSize: "9px",
                    textAlign: "center",
                    color: "#ccc"
                  }}
                >
                  {method}
                </div>
              ))}
            </div>

          </div>

          {/* Column 2: Information & Policies */}
          <div>
            <h4 style={{ 
              fontSize: "15px", 
              fontWeight: "bold", 
              marginBottom: "12px",
              color: "#fff"
            }}>
              Thông tin và chính sách
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                "Mua hàng và thanh toán Online",
                "Mua hàng trả góp Online",
                "Mua hàng trả góp bằng thẻ tín dụng",
                "Chính sách giao hàng",
                "Chính sách đổi trả",
                "Tra điểm Smember",
                "Xem ưu đãi Smember",
                "Tra thông tin bảo hành",
                "Tra cứu hoá đơn điện tử",
                "Thông tin hoá đơn mua hàng",
                "Trung tâm bảo hành chính hãng",
                "Quy định về việc sao lưu dữ liệu",
                "Chính sách khui hộp sản phẩm Apple",
                "VAT Refund"
              ].map((item, index) => (
                <Link 
                  key={index}
                  to="#" 
                  style={{ 
                    color: "#ccc", 
                    textDecoration: "none", 
                    fontSize: "12px",
                    padding: "1px 0",
                    transition: "color 0.3s"
                  }}
                  onMouseEnter={(e) => e.target.style.color = "#00A86B"}
                  onMouseLeave={(e) => e.target.style.color = "#ccc"}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Other Services & App Download */}
          <div>
            <h4 style={{ 
              fontSize: "16px", 
              fontWeight: "bold", 
              marginBottom: "15px",
              color: "#fff"
            }}>
              Dịch vụ và thông tin khác
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
              {[
                "Khách hàng doanh nghiệp (B2B)",
                "Ưu đãi thanh toán",
                "Quy chế hoạt động",
                "Chính sách bảo mật thông tin cá nhân",
                "Chính sách Bảo hành",
                "Liên hệ hợp tác kinh doanh",
                "Tuyển dụng",
                "Dịch vụ bảo hành mở rộng"
              ].map((item, index) => (
                <Link 
                  key={index}
                  to="#" 
                  style={{ 
                    color: "#ccc", 
                    textDecoration: "none", 
                    fontSize: "12px",
                    padding: "1px 0",
                    transition: "color 0.3s"
                  }}
                  onMouseEnter={(e) => e.target.style.color = "#00A86B"}
                  onMouseLeave={(e) => e.target.style.color = "#ccc"}
                >
                  {item}
                </Link>
              ))}
            </div>

            <h5 style={{ 
              fontSize: "14px", 
              fontWeight: "bold", 
              marginBottom: "10px",
              color: "#fff"
            }}>
              Mua sắm dễ dàng – Ưu đãi ngập tràn cùng app ElectricStore
            </h5>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{ 
                background: "#fff", 
                padding: "10px", 
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "60px",
                height: "60px"
              }}>
                <QrCode size={40} color="#333" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <button style={{
                  background: "#000",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}>
                  TẢI NỘI DUNG TRÊN Google Play
                </button>
                <button style={{
                  background: "#000",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}>
                  Tải về trên App Store
                </button>
              </div>
            </div>
          </div>

          {/* Column 4: Social Media & Member Websites */}
          <div>
            <h4 style={{ 
              fontSize: "16px", 
              fontWeight: "bold", 
              marginBottom: "15px",
              color: "#fff"
            }}>
              Kết nối với ElectricStore
            </h4>
            <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
              <a href="#" style={{ color: "#ccc", transition: "color 0.3s" }}>
                <Youtube size={24} />
              </a>
              <a href="#" style={{ color: "#ccc", transition: "color 0.3s" }}>
                <Facebook size={24} />
              </a>
              <a href="#" style={{ color: "#ccc", transition: "color 0.3s" }}>
                <Instagram size={24} />
              </a>
              <a href="#" style={{ color: "#ccc", transition: "color 0.3s" }}>
                <MessageCircle size={24} />
              </a>
            </div>

            <h5 style={{ 
              fontSize: "14px", 
              fontWeight: "bold", 
              marginBottom: "10px",
              color: "#fff"
            }}>
              Website thành viên
            </h5>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link to="#" style={{ 
                color: "#ccc", 
                textDecoration: "none", 
                fontSize: "13px",
                padding: "2px 0",
                transition: "color 0.3s"
              }}
              onMouseEnter={(e) => e.target.style.color = "#00A86B"}
              onMouseLeave={(e) => e.target.style.color = "#ccc"}>
                Hệ thống bảo hành và chăm sóc Xe điện - Pin
              </Link>
              <Link to="#" style={{ 
                color: "#ccc", 
                textDecoration: "none", 
                fontSize: "13px",
                padding: "2px 0",
                transition: "color 0.3s"
              }}
              onMouseEnter={(e) => e.target.style.color = "#00A86B"}
              onMouseLeave={(e) => e.target.style.color = "#ccc"}>
                Trung tâm bảo hành uỷ quyền VinFast
              </Link>
              <Link to="#" style={{ 
                color: "#ccc", 
                textDecoration: "none", 
                fontSize: "13px",
                padding: "2px 0",
                transition: "color 0.3s"
              }}
              onMouseEnter={(e) => e.target.style.color = "#00A86B"}
              onMouseLeave={(e) => e.target.style.color = "#ccc"}>
                Kênh thông tin giải trí công nghệ cho giới trẻ
              </Link>
              <Link to="#" style={{ 
                color: "#ccc", 
                textDecoration: "none", 
                fontSize: "13px",
                padding: "2px 0",
                transition: "color 0.3s"
              }}
              onMouseEnter={(e) => e.target.style.color = "#00A86B"}
              onMouseLeave={(e) => e.target.style.color = "#ccc"}>
                Trang thông tin công nghệ mới nhất
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ 
          borderTop: "1px solid #444", 
          paddingTop: "15px",
          textAlign: "center",
          position: "relative"
        }}>
          <p style={{ 
            fontSize: "11px", 
            color: "#999", 
            margin: 0,
            lineHeight: "1.5"
          }}>
            © 2024 ElectricStore. Tất cả quyền được bảo lưu. | Chuyên bán xe điện và pin đã qua sử dụng
          </p>
          
          {/* Back to Top Button */}
          <button
            onClick={scrollToTop}
            style={{
              position: "absolute",
              bottom: "5px",
              right: "0",
              background: "#000",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "4px",
              fontSize: "11px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "background 0.3s"
            }}
            onMouseEnter={(e) => e.target.style.background = "#333"}
            onMouseLeave={(e) => e.target.style.background = "#000"}
          >
            Lên đầu
            <ArrowUp size={12} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
