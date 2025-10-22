import { useState, useRef, useEffect } from "react";
import { FaMotorcycle } from "react-icons/fa";
import { HiBattery100 } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

// Dữ liệu categories - mapping với CategoryPage
const categoryData = {
  "electric-scooter": {
    title: <><FaMotorcycle /> Xe máy điện</>
  },
  "battery": {
    title: <><HiBattery100 /> Pin/Ắc quy</>
  }
};

const CategoryDropdown = () => {
  // State quản lý dropdown
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Toggle dropdown
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div ref={dropdownRef} className="me-3 position-relative">
      {/* Button trigger dropdown */}
      <button
        className="btn btn-link text-dark text-decoration-none"
        onClick={handleToggle}
      >
        Danh mục
        <ChevronDown size={16} className="ms-2" />
      </button>

      {/* Dropdown menu - hiển thị khi isOpen = true */}
      {isOpen && (
        <div
          className="position-absolute bg-white border shadow-lg"
          style={{
            top: '100%',
            left: 0,
            minWidth: "200px",
            zIndex: 1050
          }}
        >
          {Object.entries(categoryData).map(([key, cat]) => (
            <Link
              key={key}
              to={`/products/${key}`}
              className="d-block text-decoration-none text-dark p-3"
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              onClick={() => setIsOpen(false)}
            >
              {cat.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;