import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [minStay, setMinStay] = useState(30);
  const [propertyType, setPropertyType] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('location', location);
    if (minStay > 30) params.set('minStay', minStay.toString());
    if (propertyType) params.set('type', propertyType);
    navigate(`/properties?${params.toString()}`);
  };

  const propertyTypes = [
    { value: '', label: 'All Types' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'villa', label: 'Villa' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
  ];

  const durationOptions = [
    { value: 30, label: '1 Month' },
    { value: 60, label: '2-3 Months' },
    { value: 90, label: '3-6 Months' },
    { value: 180, label: '6+ Months' },
  ];

  return (
    <div className="w-full">
      {/* Main Search Form */}
      <form onSubmit={handleSearch} className="w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-3 flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1">
            <div className="flex items-center px-4 py-3">
              <i className="fas fa-search text-green-600 mr-3"></i>
              <input
                type="text"
                placeholder="Search house sitting opportunities..."
                className="w-full focus:outline-none text-gray-700 placeholder-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Location Input */}
          <div className="flex-1 border-l border-gray-200">
            <div className="flex items-center px-4 py-3">
              <i className="fas fa-map-marker-alt text-green-600 mr-3"></i>
              <input
                type="text"
                placeholder="Any location worldwide"
                className="w-full focus:outline-none text-gray-700 placeholder-gray-500"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          
          {/* Property Type Select */}
          <div className="flex-1 border-l border-gray-200">
            <div className="flex items-center px-4 py-3">
              <i className="fas fa-home text-green-600 mr-3"></i>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full focus:outline-none text-gray-700 bg-transparent"
              >
                {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Minimum Stay Select */}
          <div className="flex-1 border-l border-gray-200">
            <div className="flex items-center px-4 py-3">
              <i className="fas fa-calendar-alt text-green-600 mr-3"></i>
              <select
                value={minStay}
                onChange={(e) => setMinStay(parseInt(e.target.value))}
                className="w-full focus:outline-none text-gray-700 bg-transparent"
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Search Button */}
          <button
            type="submit"
            className="bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            <i className="fas fa-search mr-2"></i>
            Find House Sitting
          </button>
        </div>
        
        {/* How Sitter Notice */}
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <i className="fas fa-shield-alt text-green-600"></i>
            <span>Trusted Community</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-calendar-check text-green-600"></i>
            <span>1 Month Minimum Stay</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fab fa-paypal text-blue-600"></i>
            <span>PayPal Protection</span>
          </div>
        </div>
        
        {/* Quick filters */}
        <div className="flex flex-wrap gap-3 mt-6 justify-center">
          <button 
            type="button" 
            onClick={() => navigate('/properties?type=villa')}
            className="px-4 py-2.5 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 rounded-full text-sm font-medium text-green-700 transition-all flex items-center gap-2"
          >
            <i className="fas fa-swimming-pool"></i>
            Villas with Pool
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/properties?type=apartment&location=urban')}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-full text-sm font-medium text-blue-700 transition-all flex items-center gap-2"
          >
            <i className="fas fa-building"></i>
            Urban Apartments
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/properties?amenities=garden&type=house')}
            className="px-4 py-2.5 bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 border border-yellow-200 rounded-full text-sm font-medium text-yellow-700 transition-all flex items-center gap-2"
          >
            <i className="fas fa-tree"></i>
            Houses with Garden
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/sitters')}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 rounded-full text-sm font-medium text-purple-700 transition-all flex items-center gap-2"
          >
            <i className="fas fa-user-check"></i>
            View Verified Sitters
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/properties?verified=true&discovery=true')}
            className="px-4 py-2.5 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border border-red-200 rounded-full text-sm font-medium text-red-700 transition-all flex items-center gap-2"
          >
            <i className="fas fa-star"></i>
            Premium Properties
          </button>
        </div>
      </form>

      {/* Advanced Search Toggle */}
      <div className="mt-6 text-center">
        <button className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center justify-center gap-2 mx-auto">
          <i className="fas fa-sliders-h"></i>
          Advanced Search Options
          <i className="fas fa-chevron-down text-xs"></i>
        </button>
      </div>

      {/* Stats Banner */}
      <div className="mt-8 bg-gradient-to-r from-green-600 to-yellow-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold">500+</div>
            <div className="text-sm opacity-90">Trusted Sitters</div>
          </div>
          <div>
            <div className="text-2xl font-bold">4.8★</div>
            <div className="text-sm opacity-90">Avg. Rating</div>
          </div>
          <div>
            <div className="text-2xl font-bold">50+</div>
            <div className="text-sm opacity-90">Countries</div>
          </div>
          <div>
            <div className="text-2xl font-bold">100%</div>
            <div className="text-sm opacity-90">Verified Listings</div>
          </div>
        </div>
      </div>
    </div>
  );
};