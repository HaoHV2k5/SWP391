// Filter options data for FilterBar component
// File: src/data/filterOptions.js

export const priceOptions = [
    { label: 'Dưới 10 triệu', value: 'under10m' },
    { label: '10-20 triệu', value: '10m-20m' },
    { label: '20-30 triệu', value: '20m-30m' },
    { label: '30-50 triệu', value: '30m-50m' },
    { label: '50-100 triệu', value: '50m-100m' },
    { label: '100-500 triệu', value: '100m-500m' },
    { label: '500 triệu - 1 tỷ', value: '500m-1b' },
    { label: 'Trên 1 tỷ', value: 'over1b' }
];

export const brandOptions = [
    { label: 'VinFast', value: 'VinFast' },
    { label: 'Tesla', value: 'Tesla' },
    { label: 'Honda', value: 'Honda' },
    { label: 'Yamaha', value: 'Yamaha' },
    { label: 'Piaggio', value: 'Piaggio' }
];

export const simpleOptions = [
    { type: 'vehicleType', label: 'Xe điện', value: 'xe-dien' },
    { type: 'vehicleType', label: 'Xe hơi điện', value: 'xe-hoi-dien' },
    { type: 'vehicleType', label: 'Pin', value: 'pin' }
];
