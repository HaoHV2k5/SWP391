
import { Link } from "react-router-dom";
import { User, LogOut, Search, ShoppingCart, PhoneCall } from "lucide-react";
import logoImage from "../assets/images/logo_removeBg.png";

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar fpt-navbar" style={{ borderBottom: "3px solid #2196f3", background: "#1f1f1f" }}>
      <div className="nav-container fpt-nav-container" style={{ gap: "1rem", display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center" }}>
        <Link to="/" className="logo fpt-logo" style={{ display: "flex", alignItems: "center" }}>
          <img
            src={logoImage}
            alt="Logo"
            className="inline-block mr-3"
            style={{ width: "56px", height: "56px", objectFit: "contain", borderRadius: "10px", background: "#fff" }}
          />
        </Link>

        <div className="fpt-search" style={{ flex: 1, display: "flex", alignItems: "center", maxWidth: 680 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              type="text"
              placeholder="Tìm sản phẩm, danh mục, thương hiệu..."
              style={{
                width: "100%",
                padding: "0.75rem 2.75rem 0.75rem 1rem",
                borderRadius: 10,
                border: "1.5px solid #2196f3",
                background: "#ffffff",
                color: "#0e1b2b",
                outline: "none",
              }}
            />
            <Search size={18} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
          </div>
        </div>

        <ul className="nav-links fpt-nav-links" style={{ justifyContent: "space-evenly", minWidth: 420 }}>
          <li><Link to="/">Trang chủ</Link></li>
          <li><Link to="/products">Sản phẩm</Link></li>
          <li><Link to="/about">Giới thiệu</Link></li>
          <li><Link to="/contact">Liên hệ</Link></li>
          <li>
            <Link to="/cart" title="Giỏ hàng">
              <ShoppingCart className="inline-block" size={20} />
            </Link>
          </li>
          <li>
            <a href="tel:18006601" title="Gọi mua hàng" style={{ display: "flex", alignItems: "center" }}>
              <PhoneCall className="inline-block mr-1" size={18} /> 1800 6601
            </a>
          </li>
          {user ? (
            <>
              {user.role === "admin" && (
                <li>
                  <Link to="/admin">
                    <User className="inline-block mr-1" size={16} /> Admin
                  </Link>
                </li>
              )}
              <li>
                <button onClick={onLogout} className="btn btn-secondary fpt-btn-logout">
                  <LogOut className="inline-block mr-1" size={16} /> Đăng xuất
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className="btn btn-primary fpt-btn-login">Đăng nhập</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
