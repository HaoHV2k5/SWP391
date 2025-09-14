import { Link } from "react-router-dom";
import { Car, User, LogOut } from "lucide-react";
import logoImage from "../assets/images/z7010476232855_5640f4cbb91e0087128c1d8b7fc29d33.jpg";

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link
          to="/"
          className="logo"
          style={{ display: "flex", alignItems: "center" }}
        >
          <img
            src={logoImage}
            alt="ElectricTrade Logo"
            className="inline-block mr-3"
            style={{
              width: "150px",
              height: "150px",
              objectFit: "contain",
              borderRadius: "50%",
              border: "8px solid #3b82f6",
              boxShadow: "0 8px 30px rgba(59, 130, 246, 0.4)",
            }}
          />
          <span
            style={{ fontSize: "1.5rem", fontWeight: "bold", color: "white" }}
          >
            ElectricTrade
          </span>
        </Link>

        <ul className="nav-links">
          <li>
            <Link to="/">Trang chủ</Link>
          </li>
          <li>
            <Link to="/products">Sản phẩm</Link>
          </li>
          <li>
            <Link to="/about">Giới thiệu</Link>
          </li>
          <li>
            <Link to="/contact">Liên hệ</Link>
          </li>

          {user ? (
            <>
              {user.role === "admin" && (
                <li>
                  <Link to="/admin">
                    <User className="inline-block mr-1" size={16} />
                    Admin
                  </Link>
                </li>
              )}
              <li>
                <button onClick={onLogout} className="btn btn-secondary">
                  <LogOut className="inline-block mr-1" size={16} />
                  Đăng xuất
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className="btn btn-primary">
                Đăng nhập
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
