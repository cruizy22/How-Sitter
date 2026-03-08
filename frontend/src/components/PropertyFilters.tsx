import React, { useState } from 'react';

interface Filters {
  city: string;
  country: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  type: string;
  minStayDays: number;
}

interface PropertyFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  const propertyTypes = [
    { value: '', label: 'All Types' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'villa', label: 'Villa' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
  ];

  const durationOptions = [
    { value: 30, label: '1 month minimum' },
    { value: 60, label: '2-4 months' },
    { value: 90, label: '3-6 months' },
    { value: 180, label: '6-11 months' },
    { value: 365, label: '1 year or more' },
  ];

  const handleChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      city: '',
      country: '',
      minPrice: undefined,
      maxPrice: undefined,
      bedrooms: undefined,
      type: '',
      minStayDays: 30,
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border-2 border-green-200 shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <i className="fas fa-filter text-green-600 mr-2"></i>
          Filter Properties
        </h3>
        <div className="flex items-center justify-between">
          <button
            onClick={clearFilters}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            <i className="fas fa-redo mr-1"></i>
            Clear all filters
          </button>
          <span className="text-xs text-gray-500 bg-green-50 px-2 py-1 rounded">
            House Sitting Only
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Minimum Stay Duration */}
        <div>
          <label className="Block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <i className="fas fa-calendar-alt text-green-500 mr-2"></i>
            Minimum Stay Duration
          </label>
          <select
            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            value={localFilters.minStayDays}
            onChange={(e) => handleChange('minStayDays', parseInt(e.target.value))}
          >
            {durationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            How Sitter requires 1 month minimum stays
          </p>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            placeholder="City"
            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            value={localFilters.city}
            onChange={(e) => handleChange('city', e.target.value)}
          />
          <input
            type="text"
            placeholder="Country"
            className="w-full mt-2 px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            value={localFilters.country}
            onChange={(e) => handleChange('country', e.target.value)}
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="Block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <i className="fas fa-dollar-sign text-green-500 mr-2"></i>
            Monthly Price Range ($)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              className="w-1/2 px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              value={localFilters.minPrice || ''}
              onChange={(e) => handleChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <input
              type="number"
              placeholder="Max"
              className="w-1/2 px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              value={localFilters.maxPrice || ''}
              onChange={(e) => handleChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Type
          </label>
          <select
            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            value={localFilters.type}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            {propertyTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bedrooms
          </label>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => handleChange('bedrooms', localFilters.bedrooms === num ? undefined : num)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  localFilters.bedrooms === num
                    ? 'border-green-600 bg-green-600 text-white shadow-md'
                    : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                {num}+
              </button>
            ))}
          </div>
        </div>

        {/* Amenities (Collapsible) */}
        <div>
          <details className="group">
            <summary className="flex justify-between items-center cursor-pointer list-none">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <i className="fas fa-star text-yellow-500 mr-2"></i>
                Amenities
              </span>
              <i className="fas fa-chevron-down group-open:rotate-180 transition-transform text-gray-400"></i>
            </summary>
            <div className="mt-3 space-y-2">
              {[
                { label: 'WiFi', value: 'wifi', icon: 'fa-wifi' },
                { label: 'Parking', value: 'parking', icon: 'fa-parking' },
                { label: 'Pool', value: 'pool', icon: 'fa-swimming-pool' },
                { label: 'Garden', value: 'garden', icon: 'fa-tree' },
                { label: 'Air Conditioning', value: 'ac', icon: 'fa-snowflake' },
                { label: 'Gym', value: 'gym', icon: 'fa-dumbbell' },
              ].map((amenity) => (
                <label key={amenity.value} className="flex items-center p-2 hover:bg-green-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <i className={`fas ${amenity.icon} text-green-500 ml-2 mr-3`}></i>
                  <span className="text-sm text-gray-600">{amenity.label}</span>
                </label>
              ))}
            </div>
          </details>
        </div>

        {/* Verified Properties Only */}
        <div>
          <label className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700">Verified Homeowners Only</span>
              <p className="text-xs text-gray-500">Show properties with verified homeowners</p>
            </div>
          </label>
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={applyFilters}
        className="w-full mt-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        <i className="fas fa-search mr-2"></i>
        Apply Filters
      </button>

      {/* How Sitter Notice */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <i className="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
          <div>
            <p className="text-sm font-medium text-blue-800">How Sitter Notice</p>
            <p className="text-xs text-blue-700 mt-1">
              All properties require 1 month minimum stays. First transaction must use PayPal.
              Subsequent arrangements can use cash or other methods.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};