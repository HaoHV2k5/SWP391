import { useState, useEffect } from "react";

const FilterBar = ({ onFilterChange }) => {
    const [activeFilters, setActiveFilters] = useState({
        condition: null,
        priceRange: null,
        brand: null,
        vehicleType: null
    });
    const [showPriceDropdown, setShowPriceDropdown] = useState(false);
    const [showBrandDropdown, setShowBrandDropdown] = useState(false);

    const priceOptions = [
        { label: 'Dưới 10 triệu', value: 'under10m' },
        { label: 'Dưới 20 triệu', value: 'under20m' },
        { label: '20-50 triệu', value: '20m-50m' },
        { label: 'Trên 50 triệu', value: 'over50m' }
    ];

    const brandOptions = [
        { label: 'VinFast', value: 'vinfast' },
        { label: 'Tesla', value: 'tesla' },
        { label: 'Honda', value: 'honda' },
        { label: 'Yamaha', value: 'yamaha' },
        { label: 'Piaggio', value: 'piaggio' }
    ];

    const simpleOptions = [
        { type: 'condition', label: 'Hàng mới', value: 'new' },
        { type: 'vehicleType', label: 'Xe điện', value: 'xe-dien' },
        { type: 'vehicleType', label: 'Xe hơi điện', value: 'xe-hoi-dien' },
        { type: 'vehicleType', label: 'Pin', value: 'pin' }
    ];

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
            onFilterChange(cleanFilters);
        } else {
            // Nếu filter chưa active thì set nó
            const newFilters = { ...activeFilters, [type]: value };
            setActiveFilters(newFilters);

            // Gọi onFilterChange với danh sách filters
            onFilterChange(newFilters);
        }

        setShowPriceDropdown(false);
        setShowBrandDropdown(false);
    };

    const resetAll = () => {
        setActiveFilters({
            condition: null,
            priceRange: null,
            brand: null,
            vehicleType: null
        });
        setShowPriceDropdown(false);
        setShowBrandDropdown(false);
        onFilterChange({});
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
        <div style={{ 
          padding: '15px', 
          background: '#fff', 
          borderBottom: '1px solid #eee',
        }}>
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              flexWrap: 'wrap', 
              alignItems: 'center', 
              justifyContent: 'flex-start',
              minWidth: 'fit-content'
            }}>
                {/* Reset button */}
                <button
                    onClick={resetAll}
                    style={{
                        padding: '8px 16px',
                        background: '#2BB673',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer'
                    }}
                >
                    Bộ lọc
                </button>

                {/* Price dropdown */}
                <div style={{ position: 'relative' }} data-dropdown>
                    <button
                        onClick={() => {
                            setShowPriceDropdown(!showPriceDropdown);
                            setShowBrandDropdown(false);
                        }}
                        style={{
                            padding: '8px 16px',
                            background: activeFilters.priceRange ? '#2BB673' : '#f5f5f5',
                            color: activeFilters.priceRange ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Giá tiền ▼
                    </button>

                    {showPriceDropdown && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '0',
                            background: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            zIndex: 1000,
                            minWidth: '150px'
                        }}>
                            {priceOptions.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleFilterClick('priceRange', option.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        textAlign: 'left'
                                    }}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Brand dropdown */}
                <div style={{ position: 'relative' }} data-dropdown>
                    <button
                        onClick={() => {
                            setShowBrandDropdown(!showBrandDropdown);
                            setShowPriceDropdown(false);
                        }}
                        style={{
                            padding: '8px 16px',
                            background: activeFilters.brand ? '#2BB673' : '#f5f5f5',
                            color: activeFilters.brand ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Hãng xe ▼
                    </button>

                    {showBrandDropdown && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '0',
                            background: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            zIndex: 1000,
                            minWidth: '120px'
                        }}>
                            {brandOptions.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleFilterClick('brand', option.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        textAlign: 'left'
                                    }}
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
                            style={{
                                padding: '8px 16px',
                                background: isActive ? '#2BB673' : '#f5f5f5',
                                color: isActive ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
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
