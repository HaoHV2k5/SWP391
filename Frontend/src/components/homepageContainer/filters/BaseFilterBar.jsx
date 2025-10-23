import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { priceOptions, loadFilterOptions } from '../../../utils/filterUtils';
import '../styles/HomePage.css';

const BaseFilterBar = ({ 
  onFilterChange, 
  filterTypes = ['priceRange', 'brand', 'vehicleType', 'year'],
  showVehicleType = true 
}) => {
  const [activeFilters, setActiveFilters] = useState(
    filterTypes.reduce((acc, type) => {
      acc[type] = null;
      return acc;
    }, {})
  );
  
  const [showDropdowns, setShowDropdowns] = useState(
    filterTypes.reduce((acc, type) => {
      acc[type] = false;
      return acc;
    }, {})
  );
  
  const [brandOptions, setBrandOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleFilterClick = (type, value) => {
    const isCurrentlyActive = activeFilters[type] === value;

    if (isCurrentlyActive) {
      // Nếu filter đang active thì bỏ nó
      const newFilters = { ...activeFilters, [type]: null };
      setActiveFilters(newFilters);

      // Gọi onFilterChange với danh sách filters (loại bỏ null values)
      const cleanFilters = {};
      Object.keys(newFilters).forEach(key => {
        if (newFilters[key] !== null) {
          cleanFilters[key] = newFilters[key];
        }
      });
      if (typeof onFilterChange === "function") {
        onFilterChange(cleanFilters);
      }
    } else {
      // Nếu filter chưa active thì set nó
      const newFilters = { ...activeFilters, [type]: value };
      setActiveFilters(newFilters);

      // Gọi onFilterChange với danh sách filters
      if (typeof onFilterChange === "function") {
        onFilterChange(newFilters);
      }
    }

    // Đóng tất cả dropdowns
    setShowDropdowns(
      filterTypes.reduce((acc, type) => {
        acc[type] = false;
        return acc;
      }, {})
    );
  };

  const resetAll = () => {
    setActiveFilters(
      filterTypes.reduce((acc, type) => {
        acc[type] = null;
        return acc;
      }, {})
    );
    setShowDropdowns(
      filterTypes.reduce((acc, type) => {
        acc[type] = false;
        return acc;
      }, {})
    );
    if (typeof onFilterChange === "function") {
      onFilterChange({});
    }
  };

  // Load filter options từ Backend
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        const options = await loadFilterOptions();
        setBrandOptions(options.brands || []);
        setYearOptions(options.years || []);
      } catch (error) {
        console.error('Lỗi load filter options:', error);
        setBrandOptions([]);
        setYearOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('[data-dropdown]') === null) {
        setShowDropdowns(
          filterTypes.reduce((acc, type) => {
            acc[type] = false;
            return acc;
          }, {})
        );
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterTypes]);

  const toggleDropdown = (type) => {
    setShowDropdowns(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    
    // Đóng các dropdown khác
    filterTypes.forEach(otherType => {
      if (otherType !== type) {
        setShowDropdowns(prev => ({
          ...prev,
          [otherType]: false
        }));
      }
    });
  };

  const renderDropdown = (type, label, options, loadingText = "Đang tải...") => {
    return (
      <div className="filter-dropdown-container" data-dropdown>
        <button
          onClick={() => toggleDropdown(type)}
          className={`filter-button ${!activeFilters[type] ? 'filter-button-inactive' : ''}`}
        >
          {label}
          <ChevronDown size={16} className="ms-2" />
        </button>

        {showDropdowns[type] && (
          <div className="filter-dropdown-menu">
            {loading ? (
              <div className="filter-dropdown-item">{loadingText}</div>
            ) : (
              options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleFilterClick(type, option.value)}
                  className="filter-dropdown-item"
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="filter-bar-container">
      <div className="filter-bar-content">
        {/* Reset button */}
        <button onClick={resetAll} className="filter-button">
          Bộ lọc
        </button>

        {/* Price dropdown */}
        {filterTypes.includes('priceRange') && 
          renderDropdown('priceRange', 'Giá tiền', priceOptions)
        }

        {/* Brand dropdown */}
        {filterTypes.includes('brand') && brandOptions.length > 0 && 
          renderDropdown('brand', 'Hãng', brandOptions)
        }

        {/* Year dropdown */}
        {filterTypes.includes('year') && yearOptions.length > 0 && 
          renderDropdown('year', 'Năm sản xuất', yearOptions)
        }

        {/* Vehicle type buttons */}
        {showVehicleType && filterTypes.includes('vehicleType') && (
          <>
            <button
              onClick={() => handleFilterClick('vehicleType', 'electric_scooter')}
              className={`filter-button ${activeFilters.vehicleType !== 'electric_scooter' ? 'filter-button-inactive' : ''}`}
            >
              Xe máy điện
            </button>
            <button
              onClick={() => handleFilterClick('vehicleType', 'battery')}
              className={`filter-button ${activeFilters.vehicleType !== 'battery' ? 'filter-button-inactive' : ''}`}
            >
              Pin
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BaseFilterBar;
