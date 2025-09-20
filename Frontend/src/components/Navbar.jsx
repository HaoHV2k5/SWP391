import { Link } from "react-router-dom";
import { User, LogOut, Search, ShoppingCart, PhoneCall, Menu, Bell, Heart, MapPin } from "lucide-react";
import { useState, useEffect } from "react";

// Logo path - Đường dẫn đến logo trong public folder
const logoImage = '/logo_removeBg.png';

// Component Navbar - Thanh điều hướng chính của website ElectricStore
const Navbar = ({ user, onLogout }) => {
  // State quản lý hiển thị modal tìm cửa hàng gần nhất
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // State quản lý hiển thị dropdown menu danh mục sản phẩm
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Effect để đóng dropdown menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Kiểm tra nếu click ra ngoài dropdown menu thì đóng nó
      if (showCategoryDropdown && !event.target.closest('.category-dropdown')) {
        setShowCategoryDropdown(false);
      }
    };

    // Thêm event listener khi component mount
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup event listener khi component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryDropdown]);

  return (
    <>
      {/* Top Banner - Banner quảng cáo ở đầu trang */}
      <div style={{ 
        background: "#f8f9fa", 
        padding: "8px 0", 
        fontSize: "14px", 
        textAlign: "center",
        borderBottom: "1px solid #e9ecef"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          {/* Nội dung banner quảng cáo về dịch vụ */}
          Xe điện & Pin <strong>Chính hãng - Đã qua sử dụng</strong> <strong>Giao nhanh - Miễn phí</strong> cho đơn 500k <strong>Thu cũ</strong> giá cao - <strong>Đổi mới</strong> tiết kiệm
        </div>
      </div>

      {/* Main Navbar - Thanh điều hướng chính */}
      <nav style={{ 
        background: "#fff", 
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        borderBottom: "1px solid #e0e0e0"
      }}>
        <div style={{ 
          maxWidth: "1400px", 
          margin: "0 auto", 
          padding: "0 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "70px",
          gap: "30px"
        }}>
          {/* Logo - Logo và tên công ty */}
          <Link to="/" style={{ 
            display: "flex", 
            alignItems: "center", 
            textDecoration: "none",
            minWidth: "200px",
            height: "60px"
          }}>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "12px",
              overflow: "hidden",
              marginRight: "12px",
              backgroundColor: "#f8f9fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0, 168, 107, 0.15)"
            }}>
              <img
                src={logoImage}
                alt="ElectricStore Logo"
                style={{ 
                  width: "100%",
                  height: "100%", 
                  objectFit: "contain",
                  objectPosition: "center"
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
                backgroundColor: "#00A86B",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "20px",
                fontWeight: "bold"
              }}>
                E
              </div>
            </div>
            <span style={{ 
              fontSize: "24px", 
              fontWeight: "bold", 
              color: "#00A86B",
              fontFamily: "Arial, sans-serif",
              letterSpacing: "-0.5px"
            }}>
              ElectricStore
            </span>
          </Link>

          {/* Search Bar - Thanh tìm kiếm sản phẩm */}
          <div style={{ 
            flex: 1, 
            maxWidth: "600px", 
            position: "relative"
          }}>
            <input
              type="text"
              placeholder="Tìm kiếm xe điện, pin, thương hiệu..."
              style={{
                width: "100%",
                padding: "14px 50px 14px 20px",
                border: "2px solid #e0e0e0",
                borderRadius: "30px",
                fontSize: "15px",
                outline: "none",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#00A86B";
                e.target.style.boxShadow = "0 4px 12px rgba(0, 168, 107, 0.2)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
                e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
              }}
            />
            <Search 
              size={22} 
              style={{ 
                position: "absolute", 
                right: "18px", 
                top: "50%", 
                transform: "translateY(-50%)", 
                color: "#00A86B",
                cursor: "pointer",
                transition: "color 0.3s ease"
              }} 
            />
          </div>

          {/* Right Side Actions - Các nút hành động bên phải */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "20px",
            minWidth: "400px",
            justifyContent: "flex-end"
          }}>
            {/* Store Locator - Nút tìm cửa hàng gần nhất */}
            <div 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px",
                fontSize: "14px",
                color: "#333",
                cursor: "pointer",
                padding: "8px 12px",
                borderRadius: "8px",
                transition: "all 0.3s ease"
              }}
              onClick={() => setShowLocationModal(true)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#f0f9f0";
                e.target.style.color = "#00A86B";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#333";
              }}
            >
              <MapPin size={18} color="#00A86B" />
              <span>Cửa hàng gần bạn</span>
            </div>

            {/* Order Tracking - Nút tra cứu đơn hàng */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              fontSize: "14px",
              color: "#333",
              cursor: "pointer",
              padding: "8px 12px",
              borderRadius: "8px",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f0f9f0";
              e.target.style.color = "#00A86B";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#333";
            }}>
              <span>📦</span>
              <span>Tra cứu đơn hàng</span>
            </div>

            {/* Notifications - Nút thông báo */}
            <div style={{ 
              position: "relative",
              padding: "8px",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f0f9f0";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}>
              <Bell size={22} style={{ color: "#333" }} />
              <span style={{
                position: "absolute",
                top: "2px",
                right: "2px",
                background: "#00A86B",
                color: "white",
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                fontSize: "11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold"
              }}>
                0
              </span>
            </div>

            {/* Cart - Giỏ hàng */}
            <div style={{ 
              position: "relative",
              padding: "8px",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f0f9f0";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}>
              <ShoppingCart size={22} style={{ color: "#333" }} />
              <span style={{
                position: "absolute",
                top: "2px",
                right: "2px",
                background: "#00A86B",
                color: "white",
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                fontSize: "11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold"
              }}>
                0
              </span>
            </div>

            {/* Category Menu - Menu danh mục sản phẩm */}
            <div 
              className="category-dropdown"
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px",
                color: "#333",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                position: "relative",
                padding: "10px 16px",
                borderRadius: "8px",
                transition: "all 0.3s ease",
                backgroundColor: "#f0f9f0",
                border: "1px solid #e8f5e8"
              }}
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#e8f5e8";
                e.target.style.borderColor = "#00A86B";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#f0f9f0";
                e.target.style.borderColor = "#e8f5e8";
              }}
            >
              <Menu size={18} />
              <span>Danh mục</span>
              <span style={{
                fontSize: "10px",
                transform: showCategoryDropdown ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease"
              }}>
                ▼
              </span>
              
              {/* Category Dropdown Menu - Menu dropdown hiển thị danh mục sản phẩm */}
              {showCategoryDropdown && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                  zIndex: 1001,
                  minWidth: "800px",
                  maxHeight: "500px",
                  overflowY: "auto"
                }}>
                  <div style={{ padding: "25px" }}>
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                      gap: "25px" 
                    }}>
                      {/* Xe điện - Danh mục xe điện */}
                      <div>
                        <h4 style={{ 
                          fontSize: "16px", 
                          fontWeight: "bold", 
                          color: "#00A86B", 
                          marginBottom: "15px",
                          paddingBottom: "8px",
                          borderBottom: "2px solid #00A86B",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          🛵 Xe điện
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {[
                            { name: "VinFast Klara S", price: "18.5M VNĐ", status: "Đã sử dụng" },
                            { name: "VinFast Theon", price: "25M VNĐ", status: "Mới" },
                            { name: "VinFast Feliz", price: "12M VNĐ", status: "Đã sử dụng" },
                            { name: "Honda PCX Electric", price: "28M VNĐ", status: "Đã sử dụng" },
                            { name: "Honda SH Electric", price: "35M VNĐ", status: "Mới" },
                            { name: "Yamaha E01", price: "35M VNĐ", status: "Đã sử dụng" },
                            { name: "Yamaha EMF", price: "22M VNĐ", status: "Đã sử dụng" },
                            { name: "Piaggio Vespa Elettrica", price: "45M VNĐ", status: "Mới" }
                          ].map((item, index) => (
                            <Link 
                              key={index}
                              to="#" 
                              style={{ 
                                color: "#333", 
                                textDecoration: "none", 
                                fontSize: "13px",
                                padding: "8px 12px",
                                borderRadius: "6px",
                                transition: "all 0.3s",
                                display: "block",
                                border: "1px solid #f0f0f0"
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.color = "#00A86B";
                                e.target.style.backgroundColor = "#f8f9fa";
                                e.target.style.borderColor = "#00A86B";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.color = "#333";
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.borderColor = "#f0f0f0";
                              }}
                            >
                              <div style={{ fontWeight: "500", marginBottom: "2px" }}>{item.name}</div>
                              <div style={{ fontSize: "12px", color: "#666" }}>
                                {item.price} • {item.status}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Pin & Sạc */}
                      <div>
                        <h4 style={{ 
                          fontSize: "16px", 
                          fontWeight: "bold", 
                          color: "#00A86B", 
                          marginBottom: "15px",
                          paddingBottom: "8px",
                          borderBottom: "2px solid #00A86B",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          🔋 Pin & Sạc
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {[
                            { name: "Pin Lithium-ion 48V 20Ah", price: "3.2M VNĐ", status: "Mới 95%" },
                            { name: "Pin Lithium-ion 60V 30Ah", price: "4.2M VNĐ", status: "Mới 90%" },
                            { name: "Pin Lithium-ion 72V 40Ah", price: "5.5M VNĐ", status: "Mới 85%" },
                            { name: "Pin sắt phosphate 48V", price: "2.8M VNĐ", status: "Mới 90%" },
                            { name: "Sạc xe điện nhanh", price: "1.5M VNĐ", status: "Mới" },
                            { name: "Sạc xe điện chậm", price: "800K VNĐ", status: "Mới" },
                            { name: "Bộ sạc di động", price: "2.2M VNĐ", status: "Mới" },
                            { name: "Cáp sạc USB-C", price: "150K VNĐ", status: "Mới" }
                          ].map((item, index) => (
                            <Link 
                              key={index}
                              to="#" 
                              style={{ 
                                color: "#333", 
                                textDecoration: "none", 
                                fontSize: "13px",
                                padding: "8px 12px",
                                borderRadius: "6px",
                                transition: "all 0.3s",
                                display: "block",
                                border: "1px solid #f0f0f0"
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.color = "#00A86B";
                                e.target.style.backgroundColor = "#f8f9fa";
                                e.target.style.borderColor = "#00A86B";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.color = "#333";
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.borderColor = "#f0f0f0";
                              }}
                            >
                              <div style={{ fontWeight: "500", marginBottom: "2px" }}>{item.name}</div>
                              <div style={{ fontSize: "12px", color: "#666" }}>
                                {item.price} • {item.status}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Phụ kiện */}
                      <div>
                        <h4 style={{ 
                          fontSize: "16px", 
                          fontWeight: "bold", 
                          color: "#00A86B", 
                          marginBottom: "15px",
                          paddingBottom: "8px",
                          borderBottom: "2px solid #00A86B",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          🛡️ Phụ kiện & Bảo vệ
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {[
                            { name: "Mũ bảo hiểm xe điện", price: "200K VNĐ", status: "Mới" },
                            { name: "Áo mưa xe điện", price: "150K VNĐ", status: "Mới" },
                            { name: "Găng tay lái xe", price: "80K VNĐ", status: "Mới" },
                            { name: "Kính bảo hộ", price: "120K VNĐ", status: "Mới" },
                            { name: "Khóa xe điện", price: "300K VNĐ", status: "Mới" },
                            { name: "Bao đựng đồ", price: "180K VNĐ", status: "Mới" },
                            { name: "Gương chiếu hậu", price: "100K VNĐ", status: "Mới" },
                            { name: "Đèn LED xe điện", price: "250K VNĐ", status: "Mới" }
                          ].map((item, index) => (
                            <Link 
                              key={index}
                              to="#" 
                              style={{ 
                                color: "#333", 
                                textDecoration: "none", 
                                fontSize: "13px",
                                padding: "8px 12px",
                                borderRadius: "6px",
                                transition: "all 0.3s",
                                display: "block",
                                border: "1px solid #f0f0f0"
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.color = "#00A86B";
                                e.target.style.backgroundColor = "#f8f9fa";
                                e.target.style.borderColor = "#00A86B";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.color = "#333";
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.borderColor = "#f0f0f0";
                              }}
                            >
                              <div style={{ fontWeight: "500", marginBottom: "2px" }}>{item.name}</div>
                              <div style={{ fontSize: "12px", color: "#666" }}>
                                {item.price} • {item.status}
                              </div>
                            </Link>
                          ))}
          </div>
        </div>

                      {/* Dịch vụ */}
                      <div>
                        <h4 style={{ 
                          fontSize: "16px", 
                          fontWeight: "bold", 
                          color: "#00A86B", 
                          marginBottom: "15px",
                          paddingBottom: "8px",
                          borderBottom: "2px solid #00A86B",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          🔧 Dịch vụ
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {[
                            { name: "Bảo hiểm xe điện", price: "500K/năm", status: "Dịch vụ" },
                            { name: "Đăng ký xe điện", price: "200K", status: "Dịch vụ" },
                            { name: "Bảo dưỡng định kỳ", price: "300K", status: "Dịch vụ" },
                            { name: "Sửa chữa xe điện", price: "Liên hệ", status: "Dịch vụ" },
                            { name: "Thu cũ đổi mới", price: "Giá cao", status: "Dịch vụ" },
                            { name: "Tư vấn kỹ thuật", price: "Miễn phí", status: "Dịch vụ" },
                            { name: "Giao hàng tận nơi", price: "Miễn phí", status: "Dịch vụ" },
                            { name: "Bảo hành mở rộng", price: "1M/năm", status: "Dịch vụ" }
                          ].map((item, index) => (
                            <Link 
                              key={index}
                              to="#" 
                              style={{ 
                                color: "#333", 
                                textDecoration: "none", 
                                fontSize: "13px",
                                padding: "8px 12px",
                                borderRadius: "6px",
                                transition: "all 0.3s",
                                display: "block",
                                border: "1px solid #f0f0f0"
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.color = "#00A86B";
                                e.target.style.backgroundColor = "#f8f9fa";
                                e.target.style.borderColor = "#00A86B";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.color = "#333";
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.borderColor = "#f0f0f0";
                              }}
                            >
                              <div style={{ fontWeight: "500", marginBottom: "2px" }}>{item.name}</div>
                              <div style={{ fontSize: "12px", color: "#666" }}>
                                {item.price} • {item.status}
                              </div>
            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Actions - Các hành động của người dùng */}
          {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Admin Link - Link dành cho admin */}
              {user.role === "admin" && (
                  <Link to="/admin" style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "6px",
                    textDecoration: "none",
                    color: "#333",
                    fontSize: "14px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    transition: "all 0.3s ease",
                    backgroundColor: "#f0f9f0",
                    border: "1px solid #e8f5e8"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#e8f5e8";
                    e.target.style.borderColor = "#00A86B";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#f0f9f0";
                    e.target.style.borderColor = "#e8f5e8";
                  }}>
                    <User size={16} />
                    <span>Admin</span>
                  </Link>
                )}
                {/* Logout Button - Nút đăng xuất */}
                <button 
                  onClick={onLogout} 
                  style={{
                    background: "none",
                    border: "1px solid #00A86B",
                    color: "#00A86B",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#00A86B";
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "#00A86B";
                  }}
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Login Button - Nút đăng nhập */}
                <Link to="/login" style={{
                  background: "#00A86B",
                  color: "white",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 8px rgba(0, 168, 107, 0.2)",
                  border: "none",
                  display: "inline-block",
                  minWidth: "100px",
                  textAlign: "center"
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#007A4B";
                  e.target.style.boxShadow = "0 4px 12px rgba(0, 168, 107, 0.3)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#00A86B";
                  e.target.style.boxShadow = "0 2px 8px rgba(0, 168, 107, 0.2)";
                  e.target.style.transform = "translateY(0)";
                }}>
                  Đăng nhập
                </Link>
                {/* Register Button - Nút đăng ký */}
                <Link to="/register" style={{
                  background: "#00A86B",
                  color: "white",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 8px rgba(0, 168, 107, 0.2)",
                  border: "none",
                  display: "inline-block",
                  minWidth: "100px",
                  textAlign: "center"
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#007A4B";
                  e.target.style.boxShadow = "0 4px 12px rgba(0, 168, 107, 0.3)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#00A86B";
                  e.target.style.boxShadow = "0 2px 8px rgba(0, 168, 107, 0.2)";
                  e.target.style.transform = "translateY(0)";
                }}>
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
      </div>
    </nav>



      {/* Location Modal - Modal tìm cửa hàng gần nhất */}
      {showLocationModal && (
        <div 
          onClick={() => setShowLocationModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "10px",
              maxWidth: "500px",
              width: "90%",
              position: "relative"
            }}
          >
            {/* Close Button - Nút đóng modal */}
            <button 
              onClick={() => setShowLocationModal(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "20px",
                background: "linear-gradient(135deg, #ff6b6b, #ee5a52)",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                boxShadow: "0 2px 8px rgba(255, 107, 107, 0.3)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "linear-gradient(135deg, #ff5252, #d32f2f)";
                e.target.style.transform = "scale(1.1)";
                e.target.style.boxShadow = "0 4px 12px rgba(255, 107, 107, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "linear-gradient(135deg, #ff6b6b, #ee5a52)";
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "0 2px 8px rgba(255, 107, 107, 0.3)";
              }}
            >
              ×
            </button>
            {/* Modal Title - Tiêu đề modal */}
            <h3 style={{ marginBottom: "20px", color: "#00A86B" }}>
              Tìm cửa hàng gần bạn
            </h3>
            <div style={{ marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="Nhập địa chỉ của bạn..."
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #2E7D32",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ marginBottom: "10px", color: "#333" }}>Cửa hàng gần nhất:</h4>
              <div style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                background: "#f9f9f9"
              }}>
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                  ElectricStore - Quận 1
                </div>
                <div style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>
                  📍 123 Nguyễn Huệ, Quận 1, TP.HCM
                </div>
                <div style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>
                  📞 028.1234.5678
                </div>
                <div style={{ fontSize: "14px", color: "#2E7D32", fontWeight: "bold" }}>
                  🕒 8:00 - 22:00 (Hàng ngày)
                </div>
              </div>
            </div>
            <button style={{
              background: "#00A86B",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "14px",
              cursor: "pointer",
              width: "100%"
            }}>
              Xem trên bản đồ
            </button>
          </div>
        </div>
      )}

    </>
  );
};

export default Navbar;