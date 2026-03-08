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
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string>('30'); // Default 1 month
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (id) {
      fetchProperty();
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
      
      const propertyData: PropertyDetail = {
        ...data,
        security_deposit: data.security_deposit || 0,
        min_stay_days: data.min_stay_days || 30,
        max_stay_days: data.max_stay_days || 365,
        square_feet: data.square_feet || 0,
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        availability_start: data.availability_start || '',
        availability_end: data.availability_end || '',
        amenities: data.amenities || [],
        images: data.images || [],
        similarProperties: data.similarProperties || [],
        homeowner_reviews: data.homeowner_reviews || { 
          total_reviews: 0, 
          avg_rating: 5.0 
        },
        homeowner_bio: data.homeowner_bio || '',
        homeowner_country: (data as any).homeowner_country || data.country || 'Unknown',
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };
      
      setProperty(propertyData);
      
      // Set selected image to primary or first image
      if (propertyData.images && propertyData.images.length > 0) {
        const primary = propertyData.images.find(img => img.is_primary);
        setSelectedImage(primary?.image_url || propertyData.images[0].image_url);
      }
    } catch (err: any) {
      console.error('Error fetching property:', err);
      setError(err?.message || 'Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handleDurationSelect = (days: string) => {
    setSelectedDuration(days);
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + parseInt(days));
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(endDate.toISOString().split('T')[0]);
  };

  const handleBookProperty = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user is a sitter
    if (user.role !== 'sitter') {
      alert('Only house sitters can book properties. Please register as a sitter.');
      navigate('/register?sitter=true');
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

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < (property?.min_stay_days || 30)) {
      alert(`Minimum stay is ${property?.min_stay_days || 30} days (1 month). Please select a longer duration.`);
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
      
      alert('House sitting request sent successfully! The homeowner will review your request and contact you via WhatsApp.\n\nIMPORTANT: First transaction must use PayPal through our platform for at least 50% of the booking amount.');
      navigate('/bookings');
    } catch (err: any) {
      alert(err?.message || 'Failed to send house sitting request');
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

  const getDurationOptions = () => {
    const minDays = property?.min_stay_days || 30;
    const maxDays = property?.max_stay_days || 365;
    
    const options = [
      { days: 30, label: '1 month' },
      { days: 60, label: '2 months' },
      { days: 90, label: '3 months' },
      { days: 180, label: '6 months' },
      { days: 365, label: '1 year' }
    ];
    
    return options.filter(opt => opt.days >= minDays && opt.days <= maxDays);
  };

  const handleImageError = (imageUrl: string) => {
    setImageErrors(prev => ({ ...prev, [imageUrl]: true }));
    console.log('Image failed to load:', imageUrl);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
          <p className="text-sm text-gray-500">How Sitter - Trust-Based House Sitting</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <i className="fas fa-home text-red-500 text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Property Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The property you are looking for does not exist or has been removed.'}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/properties')}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Browse Properties
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3.5 rounded-lg font-semibold transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const homeownerCountry = (property as any).homeowner_country || property.country || 'Unknown';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50">
      {/* How Sitter Brand Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/properties')}
                className="flex items-center text-white hover:text-green-100"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Properties
              </button>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-2">
                <i className="fas fa-home text-green-600 text-sm"></i>
              </div>
              <span className="font-bold">How Sitter</span>
            </div>
          </div>
        </div>
      </div>

      {/* Property Images Gallery */}
      <div className="relative">
        {/* Main Image */}
        <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-green-100 to-blue-100">
          {selectedImage && !imageErrors[selectedImage] ? (
            <img
              src={selectedImage}
              className="w-full h-full object-cover"
              alt={property.title}
              onError={() => handleImageError(selectedImage)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <i className="fas fa-home text-green-400 text-6xl mb-4"></i>
              <p className="text-green-600 font-medium text-xl">How Sitter Property</p>
              <p className="text-gray-500 mt-2">{property.location}</p>
            </div>
          )}
          
          {/* Minimum Stay Badge */}
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            <i className="fas fa-calendar-alt mr-2"></i>
            {property.min_stay_days || 30} day minimum stay
          </div>
        </div>

        {/* Thumbnail Gallery */}
        {property.images && property.images.length > 1 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
            <div className="grid grid-cols-5 gap-2">
              {property.images.slice(0, 5).map((img, idx) => (
                <div
                  key={img.id || idx}
                  onClick={() => !imageErrors[img.image_url] && setSelectedImage(img.image_url)}
                  className={`relative h-20 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedImage === img.image_url 
                      ? 'ring-4 ring-green-600 scale-105 z-10' 
                      : 'hover:opacity-80 hover:scale-105'
                  }`}
                >
                  {!imageErrors[img.image_url] ? (
                    <img
                      src={img.image_url}
                      alt={`${property.title} - ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(img.image_url)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                      <i className="fas fa-home text-green-400"></i>
                    </div>
                  )}
                  {img.is_primary && (
                    <div className="absolute top-1 left-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
                      Primary
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8 border-2 border-green-200">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Property Info */}
            <div className="lg:w-2/3">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <i className="fas fa-map-marker-alt mr-2 text-green-500"></i>
                    <span>{property.location}, {property.city}, {property.country}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">${property.price_per_month}</div>
                  <div className="text-gray-600">per month</div>
                </div>
              </div>

              {/* How Sitter Notice */}
              <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <div className="flex items-start">
                  <i className="fas fa-exclamation-circle text-yellow-500 mt-1 mr-3"></i>
                  <div>
                    <p className="font-bold text-yellow-800">How Sitter House Sitting Notice</p>
                    <p className="text-yellow-700 text-sm mt-1">
                      This is a house sitting arrangement, not a traditional rental. Minimum stay is {property.min_stay_days || 30} days (1 month). 
                      First transaction must use PayPal through our platform for at least 50% of booking amount.
                    </p>
                  </div>
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                  <div className="text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                  <div className="text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-gray-900 capitalize">{property.type}</div>
                  <div className="text-gray-600">Property Type</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-gray-900">{property.min_stay_days || 30}</div>
                  <div className="text-gray-600">Min Stay (days)</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <i className="fas fa-align-left text-green-600 mr-2"></i>
                  Description
                </h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{property.description}</p>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <i className="fas fa-star text-yellow-500 mr-2"></i>
                    Amenities
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {property.amenities.map((amenity: string, index: number) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200 hover:bg-green-100 transition-colors"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Homeowner Info */}
              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <i className="fas fa-user text-green-600 mr-2"></i>
                  About the Homeowner (Lister)
                </h2>
                <div className="flex items-center gap-4">
                  {property.homeowner_avatar ? (
                    <img
                      src={property.homeowner_avatar}
                      className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
                      alt={property.homeowner_name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64/009639/ffffff?text=H';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <i className="fas fa-user text-white text-2xl"></i>
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
                    {/* WhatsApp Contact */}
                    <div className="mt-3">
                      <a
                        href={`https://wa.me/${property.homeowner_whatsapp || '6588888888'}?text=Hi ${encodeURIComponent(property.homeowner_name)}, I'm interested in your property "${property.title}" on How Sitter`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                      >
                        <i className="fab fa-whatsapp mr-2"></i>
                        Contact via WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:w-1/3">
              <div className="sticky top-24 bg-white border-2 border-green-200 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Request House Sitting</h2>
                
                {property.status !== 'available' ? (
                  <div className="mb-6">
                    <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 font-medium">
                        {property.status === 'occupied' ? 'Currently Occupied by House Sitter' : 
                         property.status === 'maintenance' ? 'Under Maintenance' : 'Not Available'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Duration Selection */}
                    <div className="mb-6">
                      <label className="Block text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <i className="fas fa-calendar-alt text-green-600 mr-2"></i>
                        Select Stay Duration
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {getDurationOptions().map((option) => (
                          <button
                            key={option.days}
                            onClick={() => handleDurationSelect(option.days.toString())}
                            className={`px-4 py-3 rounded-lg border-2 transition-all ${
                              selectedDuration === option.days.toString()
                                ? 'border-green-600 bg-green-600 text-white shadow-md'
                                : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                            }`}
                          >
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs opacity-90">
                              ${Math.ceil((option.days / 30) * property.price_per_month)}
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Minimum stay: {property.min_stay_days || 30} days
                      </p>
                    </div>

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
                          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
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
                          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div className="mb-6">
                      <label className="Block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <i className="fas fa-comment-dots text-green-600 mr-2"></i>
                        Message to Homeowner (Optional)
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        placeholder="Introduce yourself and explain why you'd be a great house sitter for this property..."
                      />
                    </div>

                    {/* Price Summary */}
                    {startDate && endDate && (
                      <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
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
                        <div className="border-t border-green-200 pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className="font-bold text-gray-900">Estimated total</span>
                            <span className="text-xl font-bold text-green-600">
                              ${calculateEstimatedTotal()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            First transaction: PayPal required (50% minimum)
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Book Button */}
                    <button
                      onClick={handleBookProperty}
                      disabled={bookingLoading || !startDate || !endDate}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3.5 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {bookingLoading ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending Request...
                        </span>
                      ) : (
                        'Request House Sitting'
                      )}
                    </button>

                    {/* Payment Notice */}
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start">
                        <i className="fas fa-exclamation-triangle text-yellow-500 mt-1 mr-2"></i>
                        <p className="text-yellow-700 text-sm">
                          <strong>Payment Policy:</strong> First transaction must use PayPal through our platform for at least 50% of booking amount.
                        </p>
                      </div>
                    </div>

                    <p className="text-center text-gray-500 text-sm mt-4">
                      You'll be contacted via WhatsApp if the homeowner accepts your request
                    </p>
                  </>
                )}

                {/* Contact Info */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <i className="fas fa-question-circle text-green-600 mr-2"></i>
                    Need help?
                  </h3>
                  <div className="space-y-2">
                    <a
                      href={`https://wa.me/${property.homeowner_whatsapp || '6588888888'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <i className="fab fa-whatsapp text-green-500 mr-2 text-lg"></i>
                      WhatsApp Homeowner Direct
                    </a>
                    <a
                      href="https://wa.me/6588888888"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <i className="fas fa-headset text-green-500 mr-2 text-lg"></i>
                      How Sitter Support
                    </a>
                    <div className="flex items-center text-gray-600">
                      <i className="fas fa-phone text-gray-400 mr-2"></i>
                      +65 8888 8888
                    </div>
                  </div>
                </div>

                {/* Legal Notice */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <i className="fas fa-gavel text-blue-500 mt-1 mr-2"></i>
                    <div>
                      <p className="text-sm font-bold text-blue-800">Legal Notice</p>
                      <p className="text-blue-700 text-xs mt-1">
                        All How Sitter arrangements include electronic 5-day notice to vacate.
                        Sitters act as fiduciaries and indemnify homeowners.
                      </p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <i className="fas fa-home text-green-600 mr-2"></i>
              Similar House Sitting Properties
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {property.similarProperties.map((similar) => (
                <div
                  key={similar.id}
                  className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer hover:border-green-300"
                  onClick={() => navigate(`/properties/${similar.id}`)}
                >
                  <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100">
                    {similar.primary_image ? (
                      <img
                        src={similar.primary_image}
                        className="w-full h-full object-cover"
                        alt={similar.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200/009639/ffffff?text=How+Sitter';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="fas fa-home text-green-400 text-3xl"></i>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{similar.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{similar.location}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-lg font-bold text-green-600">${similar.price_per_month}</span>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        {similar.min_stay_days || 30}+ days
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How Sitter CTA */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border-2 border-green-200 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-600 flex items-center justify-center">
            <i className="fas fa-home text-white text-2xl"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Interested in House Sitting?</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join How Sitter as a house sitter and access properties worldwide with 1 month minimum stays.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register?sitter=true')}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Become a Sitter
            </button>
            <a
              href="https://chat.whatsapp.com/how-sitter-global"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            >
              <i className="fab fa-whatsapp mr-2"></i>
              Join Global Network
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};