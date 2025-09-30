import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { categoryData } from '../../../data/homepagedata';

const CategoryDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown 
      show={isOpen} 
      onToggle={setIsOpen}
      className="me-3"
    >
      <Dropdown.Toggle 
        variant="link" 
        className="text-decoration-none text-dark d-flex align-items-center"
      >
        Danh mục
        <ChevronDown size={16} className="ms-1" />
      </Dropdown.Toggle>

      <Dropdown.Menu className="category-dropdown">
        {Object.entries(categoryData).map(([key, category]) => (
          <Dropdown.Item 
            key={key}
            as={Link}
            to={`/products/${key}`}
            className="category-item"
          >
            {category.title}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default CategoryDropdown;