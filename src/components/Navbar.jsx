import { Link } from "react-router-dom";
import { Battery, Car, User, LogOut } from "lucide-react";

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <Battery className="inline-block mr-2" size={24} />
          ElectricTrade
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
