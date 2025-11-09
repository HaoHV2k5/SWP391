import { Link } from "react-router-dom";
import SearchBar from './SearchBar';
import CategoryDropdown from './CategoryDropdown';
import NavbarActions from './NavbarActions';
import TopBar from './TopBar';
import '../styles/TopInfo.css';
import '../styles/HomePage.css';
import LoginButton from "../../member/LoginButton";
import UserDropdown from "../../member/UserDropdown";
import GuestDropdown from "../../member/GuestDropdown";
import WalletNavbar from "../../member/WalletNavbar";

const logoImage = '/logo_removeBg.png';

const Navbar = ({ user, onLogout }) => {

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
              {user && <WalletNavbar user={user} />}
              <Link
                to={user ? "/post-ad" : "/login"}
                className="navbar-post-ad-button"
                onClick={!user ? () => {
                  localStorage.setItem('redirectToPostAd', 'true');
                } : undefined}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Đăng tin
              </Link>
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
    </>
  );
};

export default Navbar;
