import React from 'react';
import { Link } from 'react-router-dom';
import { Property } from '../services/api';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available Now';
      case 'occupied': return 'Currently Occupied';
      case 'maintenance': return 'Under Maintenance';
      default: return 'Unavailable';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        {property.primary_image ? (
          <img 
            src={property.primary_image} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            alt={property.title}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <i className="fas fa-home text-gray-400 text-5xl"></i>
          </div>
        )}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(property.status)}`}>
          {getStatusText(property.status)}
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg">
          <span className="text-lg font-bold text-gray-900">${property.price_per_month}</span>
          <span className="text-gray-600 text-sm ml-1">/month</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{property.title}</h3>
          <div className="flex items-center text-gray-600">
            <i className="fas fa-map-marker-alt text-sm mr-2"></i>
            <span className="text-sm">{property.location}, {property.city}, {property.country}</span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 mb-4">
          <div className="flex items-center mr-4">
            <i className="fas fa-bed mr-2"></i>
            <span>{property.bedrooms} beds</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-bath mr-2"></i>
            <span>{property.bathrooms} baths</span>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 text-sm line-clamp-2">{property.description}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {(property.amenities || []).slice(0, 3).map((amenity, index) => (
            <span 
              key={index} 
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
            >
              {amenity}
            </span>
          ))}
          {(property.amenities || []).length > 3 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              +{(property.amenities || []).length - 3} more
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
              <i className="fas fa-user text-primary text-xs"></i>
            </div>
            <span className="text-sm text-gray-700">{property.homeowner_name}</span>
          </div>
          <Link
            to={`/properties/${property.id}`}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};