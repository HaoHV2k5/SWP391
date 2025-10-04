import { Link } from "react-router-dom";
import { User, LogOut, Search, ShoppingCart, PhoneCall, Menu, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { categoryData } from '../data/homepagedata';
import MemberDropdown from "./MemberDropdown";

const logoImage = '/logo_removeBg.png';

const Navbar = ({ user, onLogout }) => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCategoryDropdown && !event.target.closest('.category-dropdown')) {
        setShowCategoryDropdown(false);
      }
      if (showUserDropdown && !event.target.closest('.user-dropdown')) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryDropdown, showUserDropdown]);

  return (
    <>
      {/* Top Announcement Bar */}
      <div style={{
        background: "#f8f9fa",
        padding: "8px 0",
        fontSize: "13px",
        color: "#6c757d",
        textAlign: "center",
        borderBottom: "1px solid #e9ecef"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          Xe điện & Pin <strong>Chính hãng - Đã qua sử dụng</strong> <strong>Giao nhanh - Miễn phí</strong> cho đơn 500k <strong>Thu cũ</strong> giá cao - <strong>Đổi mới</strong> tiết kiệm
        </div>
      </div>

      {/* Main Navbar */}
      <nav style={{
        background: "white",
        padding: "15px 0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        borderBottom: "1px solid #e0e0e0"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img src={logoImage} alt="ElectricStore Logo" style={{ height: "40px", marginRight: "10px" }} />
            <span style={{ fontSize: "22px", fontWeight: "bold", color: "#00A86B" }}>ElectricStore</span>
          </Link>

          {/* Search Bar */}
          <div style={{
            flexGrow: 1,
            maxWidth: "500px",
            margin: "0 20px",
            position: "relative"
          }}>
            <input
              type="text"
              placeholder="Tìm kiếm xe điện, pin, phụ kiện..."
              style={{
                width: "100%",
                padding: "10px 15px 10px 40px",
                borderRadius: "25px",
                border: "1px solid #e0e0e0",
                fontSize: "14px",
                outline: "none",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
              }}
            />
            <Search size={18} color="#666" style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)" }} />
          </div>

          {/* Right Section - Icons and User Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Location */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#333",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "color 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.color = "#00A86B"}
              onMouseLeave={(e) => e.target.style.color = "#333"}
              onClick={() => setShowLocationModal(true)}
            >
              <MapPin size={18} color="#00A86B" />
              <span>Cửa hàng</span>
            </div>

            {/* Order Lookup */}
            <Link to="/orders" style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#333",
              fontSize: "14px",
              fontWeight: "500",
              textDecoration: "none",
              transition: "color 0.3s ease"
            }}
              onMouseEnter={(e) => e.target.style.color = "#00A86B"}
              onMouseLeave={(e) => e.target.style.color = "#333"}
            >
              <PhoneCall size={18} color="#00A86B" />
              <span>Đơn hàng</span>
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" style={{ position: "relative", color: "#333", textDecoration: "none" }}>
              <ShoppingCart size={22} />
              <span style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                background: "#FF0000",
                color: "white",
                borderRadius: "50%",
                padding: "2px 6px",
                fontSize: "10px",
                fontWeight: "bold"
              }}>
                0
              </span>
            </Link>

            {/* Category Menu */}
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

              {/* Category Dropdown Menu */}
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
                  minWidth: "250px",
                  maxHeight: "500px",
                  overflowY: "auto"
                }}>
                  <div style={{ padding: "20px" }}>
                    <div style={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "15px" 
                    }}>
                      {Object.entries(categoryData).map(([key, category]) => (
                        <Link
                          key={key}
                          to={`/products/${key}`}
                          style={{
                            color: "#333",
                            textDecoration: "none",
                            fontSize: "16px",
                            fontWeight: "500",
                            padding: "12px 16px",
                            borderRadius: "8px",
                            transition: "all 0.3s",
                            border: "1px solid #f0f0f0",
                            backgroundColor: "transparent"
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
                          {category.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile/Login/Register */}
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Admin Link */}
                {user.role === "admin" && (
                  <Link to="/admin" style={{
                    color: "#00A86B",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: "500",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    transition: "all 0.3s"
                  }}>
                    Admin
                  </Link>
                )}
                <div 
                  className="user-dropdown"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#333",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    position: "relative",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    transition: "all 0.3s ease",
                    backgroundColor: showUserDropdown ? "#f0f9f0" : "transparent"
                  }}
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  onMouseEnter={(e) => {
                    if (!showUserDropdown) {
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showUserDropdown) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #00A86B 0%, #2BB673 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}>
                    {(user.fullName || user.fullname || user.user?.fullname || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <span>{user.fullName || user.fullname || user.user?.fullname || user.email}</span>
                  <span style={{
                    fontSize: "10px",
                    transform: showUserDropdown ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease"
                  }}>
                    ▼
                  </span>

                  {/* User Dropdown Menu */}
                  {showUserDropdown && (
                    <div style={{
                      position: "absolute",
                      top: "100%",
                      right: "0",
                      background: "white",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                      zIndex: 1001,
                      minWidth: "200px",
                      padding: "8px 0",
                      marginTop: "8px"
                    }}>
                      <Link to="/account" style={{
                        display: "block",
                        padding: "10px 15px",
                        color: "#333",
                        textDecoration: "none",
                        fontSize: "14px",
                        transition: "background-color 0.2s"
                      }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                      >
                        Tài khoản
                      </Link>
                      
                      <Link to="/my-posts" style={{
                        display: "block",
                        padding: "10px 15px",
                        color: "#333",
                        textDecoration: "none",
                        fontSize: "14px",
                        transition: "background-color 0.2s"
                      }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                      >
                        Tin đăng của tôi
                      </Link>

                      <Link to="/saved-posts" style={{
                        display: "block",
                        padding: "10px 15px",
                        color: "#333",
                        textDecoration: "none",
                        fontSize: "14px",
                        transition: "background-color 0.2s"
                      }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                      >
                        Tin đã lưu
                      </Link>

                      <Link to="/orders" style={{
                        display: "block",
                        padding: "10px 15px",
                        color: "#333",
                        textDecoration: "none",
                        fontSize: "14px",
                        transition: "background-color 0.2s"
                      }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                      >
                        Đơn hàng
                      </Link>

                      <Link to="/view-history" style={{
                        display: "block",
                        padding: "10px 15px",
                        color: "#333",
                        textDecoration: "none",
                        fontSize: "14px",
                        transition: "background-color 0.2s"
                      }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                      >
                        Lịch sử xem tin
                      </Link>

                      <div style={{ height: "1px", background: "#e0e0e0", margin: "8px 0" }}></div>

                      <Link to="/post-ad" style={{
                        display: "block",
                        padding: "10px 15px",
                        color: "#00A86B",
                        textDecoration: "none",
                        fontSize: "14px",
                        fontWeight: "600",
                        transition: "background-color 0.2s"
                      }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#f0f9f0"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                      >
                        Đăng tin ngay
                      </Link>

                      <div style={{ height: "1px", background: "#e0e0e0", margin: "8px 0" }}></div>
                      
                      <div
                        onClick={() => {
                          setShowUserDropdown(false);
                          onLogout();
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 15px",
                          color: "#dc3545",
                          fontSize: "14px",
                          cursor: "pointer",
                          transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#fef2f2"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                      >
                        <LogOut size={16} />
                        Đăng xuất
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  className="user-dropdown"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    color: "#333",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    position: "relative",
                    padding: "8px 16px",
                    borderRadius: "25px",
                    transition: "all 0.3s ease",
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0"
                  }}
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  <div style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "transparent",
                    border: "2px solid black",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "black",
                    fontSize: "16px",
                    fontWeight: "normal"
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <span style={{
                    fontSize: "12px",
                    color: "black",
                    transform: showUserDropdown ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease"
                  }}>
                    ▼
                  </span>

                  {/* User Dropdown Menu for non-logged in users */}
                  {showUserDropdown && (
                    <div style={{
                      position: "absolute",
                      top: "100%",
                      right: "0",
                      background: "white",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                      zIndex: 1001,
                      minWidth: "250px",
                      padding: "8px 0",
                      marginTop: "8px"
                    }}>
                      <Link to="/account" style={{
                        display: "block",
                        padding: "10px 15px",
                        color: "#333",
                        textDecoration: "none",
                        fontSize: "14px",
                        transition: "background-color 0.2s"
                      }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                      >
                        Tài khoản
                      </Link>
                      
                      <Link to="/my-posts" style={{
                        display: "block",
                        padding: "10px 15px",
                        color: "#333",
                        textDecoration: "none",
                        fontSize: "14px",
                        transition: "background-color 0.2s"
                      }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                      >
                        Tin đăng của tôi
                      </Link>

                      <Link to="/saved-posts" style={{
                        display: "block",
                        padding: "10px 15px",
                        color: "#333",
                        textDecoration: "none",
                        fontSize: "14px",
                        transition: "background-color 0.2s"
                      }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                      >
                        Tin đã lưu
                      </Link>

                      <Link to="/orders" style={{
                        display: "block",
                        padding: "10px 15px",
                        color: "#333",
                        textDecoration: "none",
                        fontSize: "14px",
                        transition: "background-color 0.2s"
                      }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                      >
                        Đơn hàng
                      </Link>

                      <Link to="/view-history" style={{
                        display: "block",
                        padding: "10px 15px",
                        color: "#333",
                        textDecoration: "none",
                        fontSize: "14px",
                        transition: "background-color 0.2s"
                      }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                      >
                        Lịch sử xem tin
                      </Link>

                      <div style={{ height: "1px", background: "#e0e0e0", margin: "8px 0" }}></div>

                      <Link to="/post-ad" style={{
                        display: "block",
                        padding: "10px 15px",
                        color: "#00A86B",
                        textDecoration: "none",
                        fontSize: "14px",
                        fontWeight: "600",
                        transition: "background-color 0.2s"
                      }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#f0f9f0"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                      >
                        Đăng tin ngay
                      </Link>

                      <div style={{ height: "1px", background: "#e0e0e0", margin: "8px 0" }}></div>
                      
                      {/* Login/Register buttons on same row */}
                      <div style={{
                        display: "flex",
                        padding: "0 15px 10px 15px",
                        gap: "8px"
                      }}>
                        <Link to="/login" style={{
                          flex: 1,
                          padding: "8px 12px",
                          color: "#00A86B",
                          textDecoration: "none",
                          fontSize: "13px",
                          fontWeight: "500",
                          textAlign: "center",
                          border: "1px solid #00A86B",
                          borderRadius: "6px",
                          transition: "all 0.2s"
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
                          Đăng nhập
                        </Link>
                        
                        <Link to="/register" style={{
                          flex: 1,
                          padding: "8px 12px",
                          background: "#00A86B",
                          color: "white",
                          textDecoration: "none",
                          fontSize: "13px",
                          fontWeight: "600",
                          textAlign: "center",
                          borderRadius: "6px",
                          transition: "all 0.2s"
                        }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#007A4B";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#00A86B";
                  }}
                >
                  Đăng ký
                </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Location Modal */}
      {showLocationModal && (
        <div style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1002
        }}
          onClick={() => setShowLocationModal(false)}
        >
          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
            maxWidth: "500px",
            width: "90%",
            position: "relative"
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px", color: "#333" }}>
              Tìm cửa hàng gần bạn
            </h3>
            <input
              type="text"
              placeholder="Nhập địa chỉ hoặc vị trí của bạn..."
              style={{
                width: "100%",
                padding: "12px 15px",
                marginBottom: "20px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none"
              }}
            />
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