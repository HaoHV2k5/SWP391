import { Link } from "react-router-dom";
import { User, LogOut, Search, ShoppingCart, PhoneCall, Menu, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { categoryData } from '../data/homepageData';
import SearchBar from './homepageContainer/navigation/SearchBar';
import CategoryDropdown from './homepageContainer/navigation/CategoryDropdown';
import StoreLocationModal from './homepageContainer/navigation/StoreLocationModal';
import NavbarActions from './homepageContainer/navigation/NavbarActions';
import TopBar from './TopBar';
import './homepageContainer/styles/TopInfo.css';
import LoginButton from "./member/LoginButton";
import UserDropdown from "./member/UserDropdown";
import GuestDropdown from "./member/GuestDropdown";

const logoImage = '/logo_removeBg.png';

const Navbar = ({ user, onLogout }) => {
  const [showLocationModal, setShowLocationModal] = useState(false);

  return (
    <>
      {/* Top Announcement Bar */}
      <TopBar />

      {/* Main Navbar */}
      <nav className="main-navbar">
        <div className="navbar-inner">
          {/* Left: Logo + Category */}
          <div className="navbar-left">
            <Link to="/" className="navbar-logo">
              <img src={logoImage} alt="ElectricStore Logo" className="navbar-logo-img" />
              <span className="navbar-logo-text">ElectricStore</span>
            </Link>
            <CategoryDropdown />
          </div>

          {/* Center: Search (flexible) */}
          <div className="navbar-center">
            <SearchBar />
          </div>

          {/* Right: Actions + User */}
          <div className="navbar-right">
            <NavbarActions />
            {/* Member Components - Chỉ thêm chức năng member */}
            {!user && <LoginButton />}
            {user ? (
              <UserDropdown user={user} onLogout={onLogout} />
            ) : (
              <GuestDropdown />
            )}
          </div>
        </div>
      </nav>

      {/* Location Modal */}
      <StoreLocationModal
        show={showLocationModal}
        onHide={() => setShowLocationModal(false)}
      />

    </>
  );
};

export default Navbar;