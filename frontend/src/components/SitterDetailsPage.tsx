import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, SitterDetail } from '../services/api';
import { useAuth } from './AuthContext';

export const SitterDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [sitter, setSitter] = useState<SitterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'availability'>('overview');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSitter();
      checkIfFavorite();
    }
  }, [id]);

  const fetchSitter = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSitterDetail(id!);
      setSitter(data);
    } catch (err: any) {
      console.error('Error fetching sitter:', err);
      setError(err?.message || 'Failed to load sitter details');
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    if (!user || !id) return;
    try {
      const saved = await api.getFavoriteSitters();
      setIsFavorite(saved.data?.some((s: any) => s.id === id) || false);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const handleContact = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      setBookingLoading(true);
      // Since we don't have an arrangementId yet, we'll create a direct message
      // In a real app, you might want to create an arrangement first or use a different endpoint
      await api.sendMessage({
        arrangementId: `temp_${Date.now()}_${sitter?.id}`, // Temporary arrangement ID
        receiverId: sitter?.id || '', // Sitter's user ID
        message: message.trim()
      });
      alert('Message sent successfully!');
      setMessage('');
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert(err?.message || 'Failed to send message. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await api.removeFavoriteSitter(id!);
        setIsFavorite(false);
      } else {
        await api.addFavoriteSitter(id!);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Failed to update favorite:', error);
      alert('Failed to update favorite. Please try again.');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sitter details...</p>
        </div>
      </div>
    );
  }

  if (error || !sitter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <i className="fas fa-user-slash text-red-500 text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Sitter Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The sitter you are looking for does not exist or has been removed.'}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/sitters')}
              className="w-full bg-primary hover:bg-primary-hover text-white px-6 py-3.5 rounded-lg font-semibold transition-all hover:shadow-lg"
            >
              Browse Sitters
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3.5 rounded-lg font-semibold transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate star rating display
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <i 
            key={i}
            className={`fas fa-star ${
              i < fullStars 
                ? 'text-yellow-400' 
                : i === fullStars && hasHalfStar 
                  ? 'fas fa-star-half-alt text-yellow-400'
                  : 'text-gray-300'
            }`}
          ></i>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-white shadow-2xl">
                {sitter.avatar_url ? (
                  <img
                    src={sitter.avatar_url}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    alt={sitter.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sitter.name)}&background=009639&color=fff&size=256`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-5xl md:text-6xl font-bold">
                    {sitter.name.charAt(0)}
                  </div>
                )}
              </div>
              {sitter.is_available && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                  Available Now
                </div>
              )}
              {sitter.is_online && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  Online
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{sitter.name}</h1>
                    {sitter.is_verified && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        <i className="fas fa-shield-check mr-1"></i> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center text-gray-600 gap-3 mb-4">
                    <div className="flex items-center">
                      <i className="fas fa-map-marker-alt mr-2 text-primary"></i>
                      <span>{sitter.location || sitter.country || 'Location not specified'}</span>
                    </div>
                    <span className="hidden md:inline">•</span>
                    <div className="flex items-center">
                      <i className="fas fa-briefcase mr-2 text-primary"></i>
                      <span>{sitter.experience_years || 0} years experience</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleFavoriteToggle}
                  className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow self-start md:self-auto"
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <i className={`fas fa-heart text-2xl ${isFavorite ? 'text-red-500 animate-pulse' : 'text-gray-300'}`}></i>
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-6">
                <div className="flex items-center text-yellow-400 mr-3">
                  {renderStars(sitter.avg_rating || sitter.rating || 5)}
                </div>
                <span className="text-xl font-bold text-gray-900 mr-2">
                  {(sitter.avg_rating || sitter.rating || 5).toFixed(1)}
                </span>
                <span className="text-gray-600">({sitter.total_reviews || 0} reviews)</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {sitter.languages?.map((lang, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {lang}
                  </span>
                ))}
                {sitter.credentials?.slice(0, 3).map((cred, idx) => (
                  <span key={`cred-${idx}`} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {cred}
                  </span>
                ))}
                {sitter.credentials && sitter.credentials.length > 3 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    +{sitter.credentials.length - 3} more
                  </span>
                )}
              </div>

              {/* Bio */}
              <p className="text-gray-700 text-lg mb-8 italic leading-relaxed">
                "{sitter.bio || 'Experienced and reliable house sitter ready to care for your home.'}"
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="text-2xl font-bold text-primary text-center">{sitter.total_sits || sitter.completed_arrangements || 0}</div>
                  <div className="text-gray-600 text-sm text-center">Total Sits</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="text-2xl font-bold text-primary text-center">{sitter.experience_years || 0}</div>
                  <div className="text-gray-600 text-sm text-center">Years Experience</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="text-2xl font-bold text-primary text-center">{sitter.response_rate || 95}%</div>
                  <div className="text-gray-600 text-sm text-center">Response Rate</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="text-2xl font-bold text-primary text-center">{sitter.response_time || 2}h</div>
                  <div className="text-gray-600 text-sm text-center">Avg Response Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Details */}
          <div className="lg:w-2/3">
            {/* Tabs */}
            <div className="flex space-x-1 bg-white rounded-2xl p-1 border border-gray-200 mb-8 shadow-sm">
              {['overview', 'reviews', 'availability'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
              {/* Overview */}
              {activeTab === 'overview' && (
                <>
                  {/* Skills */}
                  {sitter.skills && sitter.skills.length > 0 && (
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <i className="fas fa-tools text-primary mr-3"></i>
                        Skills & Expertise
                      </h2>
                      <div className="flex flex-wrap gap-3">
                        {sitter.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-4 py-2 bg-primary/10 text-primary rounded-full font-medium hover:bg-primary hover:text-white transition-colors cursor-default"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <i className="fas fa-briefcase text-primary mr-3"></i>
                      Experience
                    </h2>
                    <div className="space-y-6">
                      {sitter.experience?.map((exp, idx) => (
                        <div key={idx} className="border-l-4 border-primary pl-6 py-2 hover:bg-gray-50 rounded-r-lg transition-colors">
                          <h3 className="text-lg font-semibold text-gray-900">{exp.title}</h3>
                          <p className="text-gray-600 mt-1">{exp.description}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            <i className="fas fa-clock mr-1"></i>
                            {exp.duration}
                          </p>
                        </div>
                      )) || (
                        <div className="text-center py-8">
                          <i className="fas fa-briefcase text-gray-300 text-4xl mb-4"></i>
                          <p className="text-gray-600">No specific experience listed.</p>
                          <p className="text-gray-500 text-sm mt-2">
                            {sitter.name} has {sitter.experience_years || 0} years of overall experience
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Credentials */}
                  {sitter.credentials && sitter.credentials.length > 0 && (
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <i className="fas fa-award text-primary mr-3"></i>
                        Credentials & Certifications
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sitter.credentials.map((cred, idx) => (
                          <div key={idx} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-primary/5 transition-colors">
                            <i className="fas fa-check-circle text-green-500 text-xl mr-3"></i>
                            <span className="font-medium text-gray-700">{cred}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Reviews */}
              {activeTab === 'reviews' && (
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <i className="fas fa-star text-primary mr-3"></i>
                    Reviews ({sitter.total_reviews || 0})
                  </h2>
                  {sitter.reviews && sitter.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {sitter.reviews.map((review, idx) => (
                        <div key={idx} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0 hover:bg-gray-50 rounded-lg p-4 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                <i className="fas fa-user text-primary"></i>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{review.reviewer_name}</h4>
                                <p className="text-sm text-gray-600">{review.location}</p>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">{formatDate(review.created_at)}</div>
                          </div>
                          <div className="flex items-center mb-3">
                            <div className="flex text-yellow-400 mr-2">
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={`fas fa-star ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                ></i>
                              ))}
                            </div>
                            <span className="text-gray-600 font-medium">{review.property_name}</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-star text-gray-300 text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        {sitter.name} hasn't received any reviews yet. Be the first to work with them!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Availability */}
              {activeTab === 'availability' && (
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <i className="fas fa-calendar-alt text-primary mr-3"></i>
                    Availability Calendar
                  </h2>
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <i className="fas fa-calendar-check text-primary text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {sitter.is_available ? 'Available Now' : 'Currently Unavailable'}
                    </h3>
                    <p className="text-gray-600 mb-2 max-w-md mx-auto">
                      {sitter.is_available 
                        ? `${sitter.name} is currently accepting new house sitting requests and is flexible with dates.`
                        : `${sitter.name} is not currently available for new arrangements.`
                      }
                    </p>
                    <p className="text-gray-500 text-sm">
                      Contact {sitter.name} to discuss specific dates and availability
                    </p>
                  </div>
                  
                  {/* Quick Availability Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-sm font-medium text-gray-600 mb-1">Response Time</div>
                      <div className="text-lg font-bold text-gray-900">{sitter.response_time || 2} hours</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-sm font-medium text-gray-600 mb-1">Response Rate</div>
                      <div className="text-lg font-bold text-gray-900">{sitter.response_rate || 95}%</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-sm font-medium text-gray-600 mb-1">Flexibility</div>
                      <div className="text-lg font-bold text-gray-900">High</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Contact Card */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact {sitter.name}</h2>
              
              {/* Date Selection */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className=".block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <i className="fas fa-calendar-alt mr-2 text-primary"></i>
                    Interested Dates (Optional)
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      {!startDate && (
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          Start date
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      {!endDate && (
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          End date
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className=".block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <i className="fas fa-comment-dots mr-2 text-primary"></i>
                  Your Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                  placeholder="Tell them about your property and what you're looking for in a house sitter..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Tip: Mention your property type, location, and dates
                </p>
              </div>

              {/* Contact Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleContact}
                  disabled={bookingLoading || !message.trim()}
                  className="w-full bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                >
                  {bookingLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>

                {/* WhatsApp Quick Contact */}
                <a
                  href={`https://wa.me/${sitter.phone_number || sitter.phone || '6588888888'}?text=Hi ${encodeURIComponent(sitter.name)}, I saw your profile on HouseSitter and would like to discuss a potential house sitting arrangement for my property.${startDate ? ` Dates: ${startDate} to ${endDate || 'flexible'}.` : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fab fa-whatsapp text-xl"></i>
                  WhatsApp Direct
                </a>
              </div>

              {/* Response Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Quick Response Guarantee</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <i className="fas fa-bolt text-primary mr-3 text-lg"></i>
                    <div>
                      <p className="font-medium">Usually responds within</p>
                      <p className="text-sm text-gray-500">{sitter.response_time || 2} hours</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <i className="fas fa-percentage text-primary mr-3 text-lg"></i>
                    <div>
                      <p className="font-medium">Response Rate</p>
                      <p className="text-sm text-gray-500">{sitter.response_rate || 95}% of messages</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <i className="fas fa-globe text-primary mr-3 text-lg"></i>
                    <div>
                      <p className="font-medium">Languages</p>
                      <p className="text-sm text-gray-500">{sitter.languages?.join(', ') || 'English'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-start">
                  <i className="fas fa-shield-alt text-blue-500 mt-1 mr-3"></i>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Secure Communication</p>
                    <p className="text-xs text-blue-600 mt-1">
                      All messages are protected by our platform's security measures
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Sitters */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Sitters You Might Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* These would be populated from API */}
            <div className="text-center p-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <i className="fas fa-user text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500">Find more sitters with similar experience</p>
              <button
                onClick={() => navigate('/sitters')}
                className="mt-4 text-primary hover:text-primary-hover font-medium"
              >
                Browse All Sitters →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};