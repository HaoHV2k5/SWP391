import BaseFilterBar from './BaseFilterBar';

const FilterBar = ({ onFilterChange }) => {
    return (
        <BaseFilterBar 
            onFilterChange={onFilterChange}
            filterTypes={['priceRange', 'brand', 'vehicleType', 'year']}
            showVehicleType={true}
        />
    );
};

export default FilterBar;
