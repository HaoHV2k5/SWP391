import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { priceOptions, brandOptions, simpleOptions } from '../data/filterOptions';
import './homepageContainer/styles/HomePage.css';

const FilterBar = ({ onFilterChange }) => {
    const [activeFilters, setActiveFilters] = useState({
        priceRange: null,
        brand: null,
        vehicleType: null
    });
    const [showPriceDropdown, setShowPriceDropdown] = useState(false);
    const [showBrandDropdown, setShowBrandDropdown] = useState(false);

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

        setShowPriceDropdown(false);
        setShowBrandDropdown(false);
    };

    const resetAll = () => {
        setActiveFilters({
            priceRange: null,
            brand: null,
            vehicleType: null
        });
        setShowPriceDropdown(false);
        setShowBrandDropdown(false);
        if (typeof onFilterChange === "function") {
            onFilterChange({});
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Chỉ đóng dropdown nếu click bên ngoài dropdown
            if (event.target.closest('[data-dropdown]') === null) {
                if (showPriceDropdown || showBrandDropdown) {
                    setShowPriceDropdown(false);
                    setShowBrandDropdown(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showPriceDropdown, showBrandDropdown]);

    return (
        <div className="filter-bar-container">
            <div className="filter-bar-content">
                {/* Reset button */}
                <button
                    onClick={resetAll}
                    className="filter-button"
                >
                    Bộ lọc
                </button>

                {/* Price dropdown */}
                <div className="filter-dropdown-container" data-dropdown>
                    <button
                        onClick={() => {
                            setShowPriceDropdown(!showPriceDropdown);
                            setShowBrandDropdown(false);
                        }}
                        className={`filter-button ${!activeFilters.priceRange ? 'filter-button-inactive' : ''}`}
                    >
                        Giá tiền
                        <ChevronDown size={16} className="ms-2" />
                    </button>

                    {showPriceDropdown && (
                        <div className="filter-dropdown-menu">
                            {priceOptions.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleFilterClick('priceRange', option.value)}
                                    className="filter-dropdown-item"
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Brand dropdown */}
                <div className="filter-dropdown-container" data-dropdown>
                    <button
                        onClick={() => {
                            setShowBrandDropdown(!showBrandDropdown);
                            setShowPriceDropdown(false);
                        }}
                        className={`filter-button ${!activeFilters.brand ? 'filter-button-inactive' : ''}`}
                    >
                        Hãng xe
                        <ChevronDown size={16} className="ms-2" />
                    </button>

                    {showBrandDropdown && (
                        <div className="filter-dropdown-menu brand">
                            {brandOptions.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleFilterClick('brand', option.value)}
                                    className="filter-dropdown-item"
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Simple filter buttons */}
                {simpleOptions.map((option, index) => {
                    const isActive = activeFilters[option.type] === option.value;

                    return (
                        <button
                            key={index}
                            onClick={() => handleFilterClick(option.type, option.value)}
                            className={`filter-button ${!isActive ? 'filter-button-inactive' : ''}`}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default FilterBar;
