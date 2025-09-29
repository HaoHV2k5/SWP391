import React from 'react';
import { Button } from 'react-bootstrap';

const FilterButton = ({ 
  label, 
  isActive, 
  onClick, 
  variant = "outline-secondary",
  size = "sm"
}) => {
  return (
    <Button
      variant={isActive ? "primary" : variant}
      size={size}
      onClick={onClick}
      className={`me-2 mb-2 ${isActive ? 'active' : ''}`}
    >
      {label}
    </Button>
  );
};

export default FilterButton;