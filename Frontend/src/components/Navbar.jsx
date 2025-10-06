import { Link } from "react-router-dom";
import { User, LogOut, Search, ShoppingCart, PhoneCall, Menu, MapPin } from "lucide-react";
import { useState } from "react";
import { categoryData } from '../data/homepageData';
import SearchBar from './homepageContainer/navigation/SearchBar';
import CategoryDropdown from './homepageContainer/navigation/CategoryDropdown';
import StoreLocationModal from './homepageContainer/navigation/StoreLocationModal';
import UserActions from './homepageContainer/navigation/UserActions';
import NavbarActions from './homepageContainer/navigation/NavbarActions';
import TopBar from './TopBar';
import './homepageContainer/styles/TopInfo.css';

const logoImage = '/logo_removeBg.png';

const Navbar = ({ user, onLogout }) => {
  const [showLocationModal, setShowLocationModal] = useState(false);


  return (
    <>
      {/* Top Announcement Bar */}
      <TopBar />

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
          <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", marginRight: "20px" }}>
            <img src={logoImage} alt="ElectricStore Logo" style={{ height: "40px", marginRight: "10px" }} />
            <span style={{ fontSize: "22px", fontWeight: "bold", color: "#00A86B" }}>ElectricStore</span>
          </Link>

          {/* Category Menu */}
          <CategoryDropdown />

          {/* Search Bar */}
          <SearchBar />

          {/* Right Section - Icons and User Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <NavbarActions />
            <UserActions />
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