import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { categoryData } from "../../../data/homepageData";
import { ChevronDown } from "lucide-react";

const CategoryDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeParent, setActiveParent] = useState(null);
  const dropdownRef = useRef(null);

  // Xử lý click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveParent(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Toggle dropdown khi click vào button
  const handleToggle = () => {
    setIsOpen(!isOpen);
    setActiveParent(null); // Reset activeParent mỗi khi toggle
  };

  // Reset activeParent khi hover ra ngoài menu
  const handleMenuLeave = () => {
    setActiveParent(null);
  };

  return (
    <div ref={dropdownRef} className="me-3 position-relative">
      {/* Button trigger */}
      <button 
        className="btn btn-link text-dark text-decoration-none"
        onClick={handleToggle}
      >
        Danh mục
        <ChevronDown size={16} className="ms-2" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="position-absolute bg-white border shadow-lg d-flex"
          style={{ 
            top: '100%', 
            left: 0, 
            minWidth: activeParent ? "400px" : "200px", 
            zIndex: 1050 
          }}
          onMouseLeave={handleMenuLeave}
        >
          {/* Cột bên trái: cha */}
          <div style={{ 
            width: activeParent ? "40%" : "100%", 
            borderRight: activeParent ? "1px solid #eee" : "none" 
          }}>
            {Object.entries(categoryData).map(([key, cat]) => (
              <div
                key={key}
                className={`p-2 ${activeParent === key ? "bg-light" : ""}`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setActiveParent(key)}
              >
                {cat.title}
              </div>
            ))}
          </div>

          {/* Cột bên phải: chỉ hiển thị khi hover vào cha */}
          {activeParent && categoryData[activeParent]?.children && (
            <div style={{ width: "60%" }}>
              <div className="p-2">
                {Object.entries(categoryData[activeParent].children).map(([childKey, child]) => (
                  <Link
                    key={childKey}
                    to={`/products/${childKey}`}
                    className="d-block text-decoration-none text-dark p-1"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    onClick={() => setIsOpen(false)} // Đóng dropdown khi click
                  >
                    {child.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
