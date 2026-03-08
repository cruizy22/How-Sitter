import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api, Sitter } from '../services/api';
import { useAuth } from './AuthContext';

export const SittersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 12;

  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    country: searchParams.get('country') || '',
    minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
    minExperience: searchParams.get('experience') ? parseInt(searchParams.get('experience')!) : undefined,
    languages: searchParams.get('languages')?.split(',') || [],
    available: searchParams.get('available') === 'true',
    search: searchParams.get('search') || '',
  });

  useEffect(() => {
    fetchSitters();
  }, [page, filters]);

  const fetchSitters = async () => {
    try {
      setLoading(true);
      const response = await api.getSitters({
        page,
        limit,
        location: filters.location || undefined,
        country: filters.country || undefined,
        minRating: filters.minRating,
        experience: filters.minExperience,
        languages: filters.languages.length > 0 ? filters.languages : undefined,
        available: filters.available,
        search: filters.search || undefined,
      });
      
      setSitters(response.data);
      setTotal(response.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch sitters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
    
    // Update URL params
    const params = new URLSearchParams();
    if (newFilters.location) params.set('location', newFilters.location);
    if (newFilters.country) params.set('country', newFilters.country);
    if (newFilters.minRating) params.set('minRating', newFilters.minRating.toString());
    if (newFilters.minExperience) params.set('experience', newFilters.minExperience.toString());
    if (newFilters.available) params.set('available', 'true');
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.languages.length > 0) params.set('languages', newFilters.languages.join(','));
    
    navigate(`/sitters?${params.toString()}`);
  };

  const handleViewSitter = (sitterId: string) => {
    navigate(`/sitters/${sitterId}`);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Find Trusted House Sitters</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse our community of experienced sitters ready to care for your home
          </p>
        </div>

        {/* Stats Banner */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-green-600/10 to-yellow-600/10 rounded-2xl p-8 border border-green-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{total}+</div>
                <div className="text-gray-600">Active Sitters</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">50+</div>
                <div className="text-gray-600">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">4.8★</div>
                <div className="text-gray-600">Avg Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">1000+</div>
                <div className="text-gray-600">Completed Sits</div>
              </div>
            </div>
            
            {/* How Sitter Notice */}
            <div className="mt-6 pt-6 border-t border-green-200">
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <i className="fas fa-calendar-check text-green-600"></i>
                  <span>1 Month Minimum Stay</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fab fa-whatsapp text-green-600"></i>
                  <span>Direct WhatsApp Contact</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-file-contract text-green-600"></i>
                  <span>Electronic Agreements</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl border-2 border-green-200 shadow-xl p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-yellow-600 flex items-center justify-center">
                  <i className="fas fa-filter text-white"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Filter Sitters</h3>
              </div>
              
              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-search text-green-600 mr-2"></i>
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Name, bio, location..."
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    value={filters.search}
                    onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-map-marker-alt text-green-600 mr-2"></i>
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="City name"
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    value={filters.location}
                    onChange={(e) => handleFilterChange({ ...filters, location: e.target.value })}
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-globe text-green-600 mr-2"></i>
                    Country
                  </label>
                  <input
                    type="text"
                    placeholder="Country name"
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    value={filters.country}
                    onChange={(e) => handleFilterChange({ ...filters, country: e.target.value })}
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-star text-yellow-500 mr-2"></i>
                    Minimum Rating
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[4.0, 4.5, 5.0].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleFilterChange({ ...filters, minRating: filters.minRating === rating ? undefined : rating })}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          filters.minRating === rating
                            ? 'border-green-600 bg-green-600 text-white shadow-md'
                            : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                        }`}
                      >
                        {rating}+ ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-briefcase text-green-600 mr-2"></i>
                    Experience (years)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 3, 5, 10].map((years) => (
                      <button
                        key={years}
                        onClick={() => handleFilterChange({ ...filters, minExperience: filters.minExperience === years ? undefined : years })}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          filters.minExperience === years
                            ? 'border-green-600 bg-green-600 text-white shadow-md'
                            : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                        }`}
                      >
                        {years}+ years
                      </button>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="flex items-center p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                    <input
                      type="checkbox"
                      checked={filters.available}
                      onChange={(e) => handleFilterChange({ ...filters, available: e.target.checked })}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 h-5 w-5"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-700">Currently available</span>
                      <p className="text-xs text-gray-500">Sitters accepting new arrangements</p>
                    </div>
                  </label>
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => handleFilterChange({
                    location: '',
                    country: '',
                    minRating: undefined,
                    minExperience: undefined,
                    languages: [],
                    available: false,
                    search: '',
                  })}
                  className="w-full mt-6 text-green-600 hover:text-green-700 font-medium py-2.5 border-2 border-green-200 rounded-xl hover:bg-green-50 transition-colors"
                >
                  <i className="fas fa-redo mr-2"></i>
                  Reset all filters
                </button>
              </div>

              {/* How Sitter Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl">
                  <div className="flex items-start">
                    <i className="fas fa-handshake text-green-600 mt-1 mr-3"></i>
                    <div>
                      <p className="text-sm font-bold text-green-800">Trust-Based Community</p>
                      <p className="text-xs text-green-700 mt-1">
                        Connect directly with sitters and discuss arrangements via WhatsApp
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sitters Grid */}
          <div className="lg:w-3/4">
            {/* Results Info */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-gray-600">
                  Showing <span className="font-bold text-green-600">{sitters.length}</span> of{' '}
                  <span className="font-bold text-green-600">{total}</span> sitters
                </p>
              </div>
            </div>

            {/* Sitters Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-64 rounded-2xl"></div>
                    <div className="h-4 bg-gray-200 rounded mt-4"></div>
                    <div className="h-4 bg-gray-200 rounded mt-2 w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : sitters.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sitters.map((sitter) => (
                    <div
                      key={sitter.id}
                      className="group bg-white rounded-2xl border-2 border-green-200 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                      onClick={() => handleViewSitter(sitter.id)}
                    >
                      {/* Image */}
                      <div className="relative h-56 overflow-hidden">
                        {sitter.avatar_url ? (
                          <img
                            src={sitter.avatar_url}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            alt={sitter.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sitter.name)}&background=009639&color=fff&size=256`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-green-600 to-yellow-600 flex items-center justify-center">
                            <span className="text-white text-4xl font-bold">{sitter.name.charAt(0)}</span>
                          </div>
                        )}
                        {sitter.is_available && (
                          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            Available
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
                            {sitter.name}
                          </h3>
                          <div className="flex items-center">
                            <i className="fas fa-star text-yellow-400 mr-1"></i>
                            <span className="font-bold text-gray-900">
                              {(sitter.rating || sitter.avg_rating || 0).toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center text-gray-600 mb-4">
                          <i className="fas fa-map-marker-alt text-sm mr-2 text-green-600"></i>
                          <span className="text-sm line-clamp-1">{sitter.country || sitter.location || 'Location not specified'}</span>
                        </div>

                        {/* Bio Preview */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 italic">
                          "{sitter.bio || 'Experienced house sitter ready to care for your property'}"
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{sitter.total_sits || sitter.completed_arrangements || 0}</div>
                            <div className="text-xs text-gray-600">House Sits</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{sitter.experience_years || 0}</div>
                            <div className="text-xs text-gray-600">Years</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{sitter.total_reviews || 0}</div>
                            <div className="text-xs text-gray-600">Reviews</div>
                          </div>
                        </div>

                        {/* Skills */}
                        {(sitter.skills || sitter.credentials) && (sitter.skills?.length > 0 || sitter.credentials?.length > 0) && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(sitter.skills || sitter.credentials || []).slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium border border-green-200"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* View Button */}
                        <button className="w-full mt-4 py-2.5 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-600 hover:to-yellow-600 hover:text-white text-gray-700 rounded-lg font-bold transition-all duration-300">
                          View Profile
                          <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2.5 border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-4 py-2.5 border-2 rounded-xl transition-colors ${
                              page === pageNum
                                ? 'border-green-600 bg-green-600 text-white'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2.5 border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-user-search text-green-600 text-3xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No sitters found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Try adjusting your search filters or check back later for new sitter profiles.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => handleFilterChange({
                      location: '',
                      country: '',
                      minRating: undefined,
                      minExperience: undefined,
                      languages: [],
                      available: false,
                      search: '',
                    })}
                    className="bg-gradient-to-r from-green-600 to-yellow-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-green-600/10 via-white to-yellow-600/10 rounded-2xl p-12 text-center border border-green-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to become a sitter?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our community of trusted house sitters and start accepting arrangements worldwide.
          </p>
          <div className="max-w-md mx-auto">
            <button
              onClick={() => navigate('/register?sitter=true')}
              className="bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <i className="fas fa-user-plus mr-2"></i>
              Join as Sitter
            </button>
          </div>
        </div>

        {/* How Sitter Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-green-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                <i className="fas fa-calendar-alt text-green-600"></i>
              </div>
              <h3 className="font-bold text-gray-900">1 Month Minimum</h3>
            </div>
            <p className="text-gray-600 text-sm">
              All house sitting arrangements require a minimum 30-day stay commitment
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-green-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                <i className="fab fa-whatsapp text-green-600"></i>
              </div>
              <h3 className="font-bold text-gray-900">WhatsApp Direct</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Connect directly with sitters via WhatsApp for real-time communication
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-green-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <i className="fas fa-file-contract text-blue-600"></i>
              </div>
              <h3 className="font-bold text-gray-900">Simple Agreements</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Easy electronic agreements with clear terms for both parties
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};