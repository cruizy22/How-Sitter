// src/pages/PropertyDetailPage.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, PropertyDetail } from '../services/api';
import { useAuth } from './AuthContext';

export const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProperty();
      checkIfSaved();
    } else {
      setError('Property ID is required');
      setLoading(false);
    }
  }, [id]);

  const fetchProperty = async () => {
    if (!id) {
      setError('Property ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getPropertyDetail(id);
      
      // Create a properly typed property object with defaults
      const propertyData: PropertyDetail = {
        ...data,
        // Ensure all fields have proper defaults
        security_deposit: data.security_deposit || 0,
        min_stay_days: data.min_stay_days || 30,
        max_stay_days: data.max_stay_days || 365,
        square_feet: data.square_feet || 0,
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        availability_start: data.availability_start || '',
        availability_end: data.availability_end || '',
        // Arrays should never be undefined
        amenities: data.amenities || [],
        images: data.images || [],
        similarProperties: data.similarProperties || [],
        // Reviews with defaults
        homeowner_reviews: data.homeowner_reviews || { 
          total_reviews: 0, 
          avg_rating: 5.0 
        },
        // Optional fields with defaults
        homeowner_bio: data.homeowner_bio || '',
        homeowner_country: (data as any).homeowner_country || data.country || 'Unknown',
        // Timestamps
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };
      
      setProperty(propertyData);
    } catch (err: any) {
      console.error('Error fetching property:', err);
      setError(err?.message || 'Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    if (!user || !id) return;
    
    try {
      const saved = await api.getSavedProperties();
      const savedProperties = saved.data || [];
      setIsSaved(savedProperties.some((p: any) => p.id === id));
    } catch (error) {
      console.error('Failed to check saved status:', error);
    }
  };

  const handleSaveProperty = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!id) return;
    
    try {
      if (isSaved) {
        await api.unsaveProperty(id);
        setIsSaved(false);
      } else {
        await api.saveProperty(id);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Failed to save property:', error);
      alert('Failed to save property. Please try again.');
    }
  };

  const handleBookProperty = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'sitter') {
      alert('Only sitters can book properties. Please register as a sitter.');
      return;
    }

    if (!startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }

    if (!id) {
      alert('Invalid property ID');
      return;
    }

    try {
      setBookingLoading(true);
      await api.createArrangement({
        propertyId: id,
        startDate,
        endDate,
        message: message || undefined
      });
      
      alert('Booking request sent successfully!');
      navigate('/bookings');
    } catch (err: any) {
      alert(err?.message || 'Failed to send booking request');
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateEstimatedTotal = () => {
    if (!startDate || !endDate || !property?.price_per_month) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = diffDays / 30;
    
    return Math.ceil(diffMonths * property.price_per_month);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The property you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/properties')}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-semibold"
          >
            Browse Properties
          </button>
        </div>
      </div>
    );
  }

  const getPrimaryImage = () => {
    if (!property.images || property.images.length === 0) {
      return null;
    }
    const primary = property.images.find(img => img.is_primary);
    return primary?.image_url || property.images[0]?.image_url || null;
  };

  const primaryImage = getPrimaryImage();

  // Get homeowner country safely
  const homeownerCountry = (property as any).homeowner_country || property.country || 'Unknown';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Property Images */}
      <div className="relative h-96 md:h-[500px]">
        {primaryImage ? (
          <img
            src={primaryImage}
            className="w-full h-full object-cover"
            alt={property.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x500?text=Property+Image';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <i className="fas fa-home text-gray-400 text-6xl"></i>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <button
            onClick={handleSaveProperty}
            className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            aria-label={isSaved ? 'Remove from saved' : 'Save property'}
          >
            <i className={`fas fa-heart text-xl ${isSaved ? 'text-red-500' : 'text-gray-400'}`}></i>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Property Info */}
            <div className="lg:w-2/3">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    <span>{property.location}, {property.city}, {property.country}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">${property.price_per_month}</div>
                  <div className="text-gray-600">per month</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                  <div className="text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                  <div className="text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{property.type}</div>
                  <div className="text-gray-600 capitalize">Property Type</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{property.min_stay_days || 30}</div>
                  <div className="text-gray-600">Min Stay (days)</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-3">
                    {property.amenities.map((amenity: string, index: number) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Homeowner Info */}
              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About the Homeowner</h2>
                <div className="flex items-center gap-4">
                  {property.homeowner_avatar ? (
                    <img
                      src={property.homeowner_avatar}
                      className="w-16 h-16 rounded-full object-cover"
                      alt={property.homeowner_name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=User';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <i className="fas fa-user text-primary text-2xl"></i>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{property.homeowner_name}</h3>
                    <p className="text-gray-600">{homeownerCountry}</p>
                    {property.homeowner_bio && (
                      <p className="text-gray-700 mt-2">{property.homeowner_bio}</p>
                    )}
                    <div className="flex items-center mt-2">
                      <div className="flex items-center text-yellow-400 mr-2">
                        <i className="fas fa-star"></i>
                        <span className="ml-1 font-bold text-gray-900">
                          {property.homeowner_reviews?.avg_rating?.toFixed(1) || '5.0'}
                        </span>
                      </div>
                      <span className="text-gray-600">
                        ({property.homeowner_reviews?.total_reviews || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:w-1/3">
              <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Book This Property</h2>
                
                {property.status !== 'available' ? (
                  <div className="mb-6">
                    <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 font-medium">
                        {property.status === 'occupied' ? 'Currently Occupied' : 
                         property.status === 'maintenance' ? 'Under Maintenance' : 'Not Available'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Date Selection */}
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date *
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={startDate || new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message to Homeowner (Optional)
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Introduce yourself and explain why you'd be a great house sitter..."
                      />
                    </div>

                    {/* Price Summary */}
                    {startDate && endDate && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Monthly rate</span>
                          <span className="font-medium">${property.price_per_month}</span>
                        </div>
                        {property.security_deposit && property.security_deposit > 0 && (
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Security deposit</span>
                            <span className="font-medium">${property.security_deposit}</span>
                          </div>
                        )}
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className="font-bold text-gray-900">Estimated total</span>
                            <span className="text-xl font-bold text-primary">
                              ${calculateEstimatedTotal()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Book Button */}
                    <button
                      onClick={handleBookProperty}
                      disabled={bookingLoading || !startDate || !endDate}
                      className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {bookingLoading ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending Request...
                        </span>
                      ) : (
                        'Request to Book'
                      )}
                    </button>

                    <p className="text-center text-gray-500 text-sm mt-4">
                      You won't be charged until the homeowner confirms your booking
                    </p>
                  </>
                )}

                {/* Contact Info */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">Need help?</h3>
                  <div className="space-y-2">
                    <a
                      href="https://wa.me/6588888888"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <i className="fab fa-whatsapp text-green-500 mr-2 text-lg"></i>
                      WhatsApp Support
                    </a>
                    <div className="flex items-center text-gray-600">
                      <i className="fas fa-phone text-gray-400 mr-2"></i>
                      +65 8888 8888
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {property.similarProperties && property.similarProperties.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {property.similarProperties.map((similar) => (
                <div
                  key={similar.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/properties/${similar.id}`)}
                >
                  <div className="h-48 bg-gray-100">
                    {similar.primary_image ? (
                      <img
                        src={similar.primary_image}
                        className="w-full h-full object-cover"
                        alt={similar.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Property';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="fas fa-home text-gray-400 text-3xl"></i>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{similar.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{similar.location}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-lg font-bold text-primary">${similar.price_per_month}</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {similar.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};