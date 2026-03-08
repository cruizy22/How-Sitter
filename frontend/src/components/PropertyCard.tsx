import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Property } from '../services/api';
import { getPropertyFallbackImage, createDataUrlPlaceholder } from '../utils/imageUtils';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [fallbackUrl, setFallbackUrl] = useState<string>('');

  useEffect(() => {
    // Create a data URL fallback immediately (no network request)
    const fallback = createDataUrlPlaceholder(
      property.title.substring(0, 20) || 'How Sitter',
      '009639',
      'ffffff'
    );
    setFallbackUrl(fallback);

    // Determine the best image URL to use
    if (property.primary_image) {
      setImageUrl(property.primary_image);
    } else if (property.images && Array.isArray(property.images) && property.images.length > 0) {
      const firstImage = property.images[0];
      if (typeof firstImage === 'string') {
        setImageUrl(firstImage);
      } else if (firstImage && typeof firstImage === 'object' && firstImage.image_url) {
        setImageUrl(firstImage.image_url);
      } else {
        setImageUrl('');
      }
    } else {
      setImageUrl('');
    }
  }, [property]);

  const handleImageError = () => {
    setImageError(true);
    console.log('Image failed to load, using fallback:', property.title);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border border-green-200';
      case 'occupied': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available for House Sitting';
      case 'occupied': return 'Currently Occupied';
      case 'maintenance': return 'Under Maintenance';
      default: return 'Unavailable';
    }
  };

  const getMinStayDisplay = () => {
    const minDays = property.min_stay_days || 30;
    if (minDays === 30) return '1 month minimum';
    if (minDays <= 120) return `${Math.ceil(minDays/30)}-${Math.ceil(minDays/30)+2} months`;
    return `${Math.ceil(minDays/30)}+ months`;
  };

  return (
    <div className="group bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-green-100 to-blue-100">
        {!imageError && imageUrl ? (
          <img 
            src={imageUrl}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            alt={property.title}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {fallbackUrl ? (
              <img 
                src={fallbackUrl}
                className="w-full h-full object-cover"
                alt={property.title}
              />
            ) : (
              <>
                <i className="fas fa-home text-green-400 text-5xl mb-2"></i>
                <p className="text-green-600 font-medium text-center px-4">How Sitter Property</p>
                <p className="text-gray-500 text-xs mt-2 text-center px-4">{property.location}</p>
              </>
            )}
          </div>
        )}
        
        {/* Status Badge */}
        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(property.status)} shadow-sm`}>
          {getStatusText(property.status)}
        </div>
        
        {/* Minimum Stay Badge */}
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
          <i className="fas fa-calendar-alt mr-1"></i>
          {getMinStayDisplay()}
        </div>
        
        {/* Price Tag */}
        <div className="absolute bottom-4 left-4 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg shadow-xl">
          <div className="text-lg font-bold">${property.price_per_month}</div>
          <div className="text-xs opacity-90">per month</div>
        </div>
        
        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${property.homeowner_whatsapp || '6588888888'}?text=Hi, I'm interested in your property "${property.title}" on How Sitter`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white p-2.5 rounded-full shadow-lg transform hover:scale-110 transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <i className="fab fa-whatsapp text-lg"></i>
        </a>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-green-600 transition-colors">{property.title}</h3>
          <div className="flex items-center text-gray-600">
            <i className="fas fa-map-marker-alt text-sm mr-2 text-green-500"></i>
            <span className="text-sm">{property.location}, {property.city}, {property.country}</span>
          </div>
        </div>
        
        {/* Property Details */}
        <div className="flex items-center text-gray-600 mb-4">
          <div className="flex items-center mr-6">
            <i className="fas fa-bed mr-2 text-green-500"></i>
            <span className="text-sm font-medium">{property.bedrooms} beds</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-bath mr-2 text-green-500"></i>
            <span className="text-sm font-medium">{property.bathrooms} baths</span>
          </div>
          {property.square_feet && (
            <div className="ml-auto">
              <span className="text-sm text-gray-500">{property.square_feet.toLocaleString()} sqft</span>
            </div>
          )}
        </div>
        
        {/* Description */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm line-clamp-2">{property.description}</p>
        </div>
        
        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200 hover:bg-green-100 hover:text-green-700 hover:border-green-300 transition-colors"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Homeowner & Action */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <i className="fas fa-user text-green-600"></i>
            </div>
            <div>
              <div className="text-xs text-gray-500">Listed by</div>
              <div className="text-sm font-medium text-gray-900">
                {property.homeowner_name || 'Homeowner (Lister)'}
              </div>
            </div>
          </div>
          <Link
            to={`/properties/${property.id}`}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg"
          >
            View Details
          </Link>
        </div>
        
        {/* Payment Note */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <i className="fas fa-info-circle mr-2 text-blue-500"></i>
            <span>First transaction: PayPal required (50% minimum)</span>
          </div>
        </div>
        
        {/* Verification Badge */}
        {property.homeowner_verified && (
          <div className="mt-3">
            <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              <i className="fas fa-shield-check mr-1"></i>
              Verified Homeowner
            </div>
          </div>
        )}
      </div>
    </div>
  );
};