import React, { useState } from 'react';

interface Filters {
  city: string;
  country: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  type: string;
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
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-primary hover:underline"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-6">
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            placeholder="City"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={localFilters.city}
            onChange={(e) => handleChange('city', e.target.value)}
          />
          <input
            type="text"
            placeholder="Country"
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={localFilters.country}
            onChange={(e) => handleChange('country', e.target.value)}
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range ($/month)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={localFilters.minPrice || ''}
              onChange={(e) => handleChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <input
              type="number"
              placeholder="Max"
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                className={`px-4 py-2 rounded-lg border ${
                  localFilters.bedrooms === num
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 hover:border-gray-400'
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
              <span className="text-sm font-medium text-gray-700">Amenities</span>
              <i className="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
            </summary>
            <div className="mt-3 space-y-2">
              {['wifi', 'parking', 'pool', 'garden', 'ac', 'gym'].map((amenity) => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-600 capitalize">{amenity}</span>
                </label>
              ))}
            </div>
          </details>
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={applyFilters}
        className="w-full mt-8 bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-semibold transition-colors"
      >
        Apply Filters
      </button>
    </div>
  );
};