import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('location', location);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col md:flex-row gap-2">
        <div className="flex-1">
          <div className="flex items-center px-4 py-3">
            <i className="fas fa-search text-gray-400 mr-3"></i>
            <input
              type="text"
              placeholder="Search properties or sitters..."
              className="w-full focus:outline-none text-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 border-l border-gray-200">
          <div className="flex items-center px-4 py-3">
            <i className="fas fa-map-marker-alt text-gray-400 mr-3"></i>
            <input
              type="text"
              placeholder="Any location worldwide"
              className="w-full focus:outline-none text-gray-700"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-xl font-semibold transition-colors whitespace-nowrap"
        >
          Search
        </button>
      </div>
      
      {/* Quick filters */}
      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        <button 
          type="button" 
          onClick={() => navigate('/properties?type=villa')}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
        >
          Villas
        </button>
        <button 
          type="button" 
          onClick={() => navigate('/properties?type=apartment')}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
        >
          Apartments
        </button>
        <button 
          type="button" 
          onClick={() => navigate('/properties?amenities=pool')}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
        >
          Pool
        </button>
        <button 
          type="button" 
          onClick={() => navigate('/properties?amenities=garden')}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
        >
          Garden
        </button>
        <button 
          type="button" 
          onClick={() => navigate('/sitters')}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
        >
          View Sitters
        </button>
      </div>
    </form>
  );
};