import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { ChevronDown } from 'lucide-react';

const FilterDropdown = ({ 
  title, 
  options, 
  selectedValue, 
  onSelect, 
  placeholder = "Chọn..." 
}) => {
  return (
    <Dropdown className="me-2 mb-2">
      <Dropdown.Toggle 
        variant="outline-secondary" 
        size="sm"
        className="d-flex align-items-center"
      >
        {selectedValue || placeholder}
        <ChevronDown size={14} className="ms-1" />
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item 
          onClick={() => onSelect('')}
          className={!selectedValue ? 'active' : ''}
        >
          Tất cả
        </Dropdown.Item>
        {options.map((option) => (
          <Dropdown.Item
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={selectedValue === option.value ? 'active' : ''}
          >
            {option.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default FilterDropdown;