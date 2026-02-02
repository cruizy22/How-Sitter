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
    minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
    experience: searchParams.get('experience') ? parseInt(searchParams.get('experience')!) : undefined,
    languages: searchParams.get('languages')?.split(',') || [],
    verified: searchParams.get('verified') === 'true',
    available: searchParams.get('available') === 'true',
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
        ...filters,
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
  };

  const handleViewSitter = (sitterId: string) => {
    navigate(`/sitters/${sitterId}`);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Find Trusted House Sitters</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse our verified community of professional house sitters ready to care for your property
          </p>
        </div>

        {/* Stats Banner */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{total}+</div>
                <div className="text-gray-600">Verified Sitters</div>
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
                <div className="text-3xl font-bold text-gray-900">98%</div>
                <div className="text-gray-600">Response Rate</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Filter Sitters</h3>
              
              <div className="space-y-6">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City or country"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    value={filters.location}
                    onChange={(e) => handleFilterChange({ ...filters, location: e.target.value })}
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <div className="flex items-center space-x-2">
                    {[4.0, 4.5, 5.0].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleFilterChange({ ...filters, minRating: filters.minRating === rating ? undefined : rating })}
                        className={`px-4 py-2 rounded-lg border ${
                          filters.minRating === rating
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {rating}+
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (years)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 3, 5, 10].map((years) => (
                      <button
                        key={years}
                        onClick={() => handleFilterChange({ ...filters, experience: filters.experience === years ? undefined : years })}
                        className={`px-4 py-2 rounded-lg border ${
                          filters.experience === years
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {years}+ years
                      </button>
                    ))}
                  </div>
                </div>

                {/* Verification */}
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.verified}
                      onChange={(e) => handleFilterChange({ ...filters, verified: e.target.checked })}
                      className="rounded border-gray-300 text-primary focus:ring-primary h-5 w-5"
                    />
                    <span className="ml-2 text-gray-700">Verified sitters only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.available}
                      onChange={(e) => handleFilterChange({ ...filters, available: e.target.checked })}
                      className="rounded border-gray-300 text-primary focus:ring-primary h-5 w-5"
                    />
                    <span className="ml-2 text-gray-700">Currently available</span>
                  </label>
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => handleFilterChange({
                    location: '',
                    minRating: undefined,
                    experience: undefined,
                    languages: [],
                    verified: false,
                    available: false,
                  })}
                  className="w-full mt-6 text-primary hover:text-primary-hover font-medium py-2"
                >
                  Reset all filters
                </button>
              </div>
            </div>
          </div>

          {/* Sitters Grid */}
          <div className="lg:w-3/4">
            {/* Results Info */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <p className="text-gray-600">
                  Showing {sitters.length} of {total} sitters
                </p>
                <p className="text-sm text-gray-500">Swipe to view more sitters</p>
              </div>
              <select 
                className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={limit}
                onChange={(e) => {/* Handle items per page */}}
              >
                <option value="12">12 per page</option>
                <option value="24">24 per page</option>
                <option value="48">48 per page</option>
              </select>
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
                      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                      onClick={() => handleViewSitter(sitter.id)}
                    >
                      {/* Image */}
                      <div className="relative h-56 overflow-hidden">
                        {sitter.avatar_url ? (
                          <img
                            src={sitter.avatar_url}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            alt={sitter.name}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <span className="text-white text-4xl font-bold">{sitter.name.charAt(0)}</span>
                          </div>
                        )}
                        {sitter.is_available && (
                          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            Available
                          </div>
                        )}
                        {sitter.is_verified && (
                          <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            Verified
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                            {sitter.name}
                          </h3>
                          <div className="flex items-center">
                            <i className="fas fa-star text-yellow-400 mr-1"></i>
                            <span className="font-bold text-gray-900">{sitter.rating?.toFixed(1) || '5.0'}</span>
                          </div>
                        </div>

                        <div className="flex items-center text-gray-600 mb-4">
                          <i className="fas fa-map-marker-alt text-sm mr-2"></i>
                          <span className="text-sm line-clamp-1">{sitter.country || sitter.location}</span>
                        </div>

                        {/* Bio Preview */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 italic">
                          "{sitter.bio || 'Experienced house sitter ready to care for your property'}"
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary">{sitter.total_sits || 0}</div>
                            <div className="text-xs text-gray-600">Sits</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary">{sitter.experience_years || 0}</div>
                            <div className="text-xs text-gray-600">Years</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary">{sitter.response_rate || 95}%</div>
                            <div className="text-xs text-gray-600">Response</div>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(sitter.credentials || sitter.skills || []).slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* View Button */}
                        <button className="w-full mt-4 py-2.5 bg-gray-100 hover:bg-primary hover:text-white text-gray-700 rounded-lg font-medium transition-all duration-300 group-hover:bg-primary group-hover:text-white">
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
                        className="px-4 py-2.5 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
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
                            className={`px-4 py-2.5 border rounded-xl transition-colors ${
                              page === pageNum
                                ? 'border-primary bg-primary text-white'
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
                        className="px-4 py-2.5 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-user-search text-gray-400 text-3xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No sitters found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Try adjusting your search filters or check back later for new sitter profiles.
                </p>
                <button
                  onClick={() => handleFilterChange({
                    location: '',
                    minRating: undefined,
                    experience: undefined,
                    languages: [],
                    verified: false,
                    available: false,
                  })}
                  className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-primary/10 via-white to-secondary/10 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Can't find the perfect sitter?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our waitlist and get notified when sitters matching your criteria become available.
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <button className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-semibold">
                Join Waitlist
              </button>
            </div>
            <p className="text-gray-500 text-sm mt-3">
              We'll notify you when matching sitters are available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};