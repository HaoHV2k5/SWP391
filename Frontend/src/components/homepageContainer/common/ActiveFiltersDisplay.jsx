import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import { X } from 'lucide-react';

const ActiveFiltersDisplay = ({ activeFiltersCount, onResetFilters }) => {
  if (activeFiltersCount === 0) {
    return null;
  }

  return (
    <div className="d-flex align-items-center gap-2 mb-3">
      <span className="text-muted">Bộ lọc đang áp dụng:</span>
      <Badge bg="primary" className="d-flex align-items-center gap-1">
        {activeFiltersCount} bộ lọc
        <Button
          variant="link"
          size="sm"
          className="p-0 text-white"
          onClick={onResetFilters}
          style={{ textDecoration: 'none' }}
        >
          <X size={12} />
        </Button>
      </Badge>
    </div>
  );
};

export default ActiveFiltersDisplay;