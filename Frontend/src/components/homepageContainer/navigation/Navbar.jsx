import { Link } from "react-router-dom";
import { useState } from "react";
import SearchBar from './SearchBar';
import CategoryDropdown from './CategoryDropdown';
import StoreLocationModal from './StoreLocationModal';
import NavbarActions from './NavbarActions';
import TopBar from './TopBar';
import '../styles/TopInfo.css';
import LoginButton from "../../member/LoginButton";
import UserDropdown from "../../member/UserDropdown";
import GuestDropdown from "../../member/GuestDropdown";

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
          {/* Top Row: Logo + Category + Actions + User */}
          <div className="navbar-top">
            {/* Left: Logo + Category */}
            <div className="navbar-left">
              <Link to="/" className="navbar-logo">
                <img src={logoImage} alt="ElectricStore Logo" className="navbar-logo-img" />
                <span className="navbar-logo-text">ElectricStore</span>
              </Link>
              <CategoryDropdown />
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

          {/* Search Bar */}
          <div className="navbar-search-container">
            <SearchBar />
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
