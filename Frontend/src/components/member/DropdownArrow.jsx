import React from 'react';

const DropdownArrow = ({ isOpen, size = "12px" }) => {
  return (
    <span style={{
      fontSize: size,
      color: "black",
      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.3s ease"
    }}>
      ▼
    </span>
  );
};

export default DropdownArrow;
