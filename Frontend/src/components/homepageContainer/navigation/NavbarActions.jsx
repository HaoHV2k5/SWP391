import { useState, useEffect } from "react";
import { Button, Badge } from "react-bootstrap";
import { MapPin, Bell, Heart } from "lucide-react";
import StoreLocationModal from "./StoreLocationModal";
import SavedPopup from "../layout/SavedPopup";
import { useSavedProducts } from "../contexts/SavedProductsContext";

const NavbarActions = () => {
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showSavedPopup, setShowSavedPopup] = useState(false);
  const { savedProducts } = useSavedProducts();

  // Toggle popup khi click trái tim
  const handleToggleSaved = () => {
    setShowSavedPopup((prev) => !prev);
  };

  // Ẩn popup khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".saved-popup") && !e.target.closest(".btn-heart")) {
        setShowSavedPopup(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <div className="d-flex align-items-center gap-3 position-relative">
        {/* Cửa hàng gần bạn */}
        <Button
          variant="link"
          className="text-decoration-none text-dark d-flex align-items-center"
          onClick={() => setShowStoreModal(true)}
        >
          <MapPin size={18} className="me-1" />
          <span className="d-none d-md-inline">Cửa hàng gần bạn</span>
        </Button>

        {/* Thông báo */}
        <Button
          variant="link"
          className="text-decoration-none text-dark position-relative"
        >
          <Bell size={18} />
          <Badge
            bg="danger"
            className="position-absolute top-0 start-100 translate-middle rounded-pill"
            style={{ fontSize: "10px" }}
          >
            0
          </Badge>
        </Button>

        {/* Wishlist */}
        <div className="position-relative">
          <Button
            variant="link"
            className="text-decoration-none text-dark position-relative btn-heart"
            onClick={handleToggleSaved}
          >
            <Heart size={20} />
            <Badge
              bg="danger"
              className="position-absolute top-0 start-100 translate-middle rounded-pill"
              style={{ fontSize: "10px" }}
            >
              {savedProducts.length}
            </Badge>
          </Button>

          {showSavedPopup && (
            <div className="saved-popup position-absolute mt-2" style={{ top: "100%", left: "50%", transform: "translateX(-50%)" }}>
              <SavedPopup />
            </div>
          )}
        </div>
      </div>

      {/* Modal cửa hàng gần bạn */}
      <StoreLocationModal
        show={showStoreModal}
        onHide={() => setShowStoreModal(false)}
      />
    </>
  );
};

export default NavbarActions;
