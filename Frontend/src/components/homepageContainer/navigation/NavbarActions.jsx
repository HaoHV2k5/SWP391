import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { Heart } from "lucide-react";
import SavedPopup from "../home/SavedPopup";

const NavbarActions = () => {
  const [showSavedPopup, setShowSavedPopup] = useState(false);
  const [savedProductsCount, setSavedProductsCount] = useState(0);

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

  // Listen for saved products count changes from SavedPopup
  useEffect(() => {
    const handleSavedProductsChange = (event) => {
      setSavedProductsCount(event.detail.count);
    };
    
    window.addEventListener('savedProductsChange', handleSavedProductsChange);
    return () => window.removeEventListener('savedProductsChange', handleSavedProductsChange);
  }, []);

  return (
    <>
      <div className="d-flex align-items-center gap-3 position-relative">
        {/* Wishlist */}
        <div className="position-relative">
          <Button
            variant="link"
            className="text-decoration-none text-dark btn-heart"
            onClick={handleToggleSaved}
          >
            <Heart size={20} />
          </Button>

          {showSavedPopup && (
            <div 
              className="saved-popup position-absolute mt-2" 
              style={{ 
                top: "100%", 
                right: "0",
                zIndex: 1050
              }}
            >
              <SavedPopup />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NavbarActions;
