import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api, Property } from '../services/api';
import { PropertyCard } from './PropertyCard';
import { PropertyFilters } from './PropertyFilters';

export const PropertiesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 12;

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    country: searchParams.get('country') || '',
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    bedrooms: searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined,
    type: searchParams.get('type') || '',
    minStayDays: searchParams.get('minStayDays') ? parseInt(searchParams.get('minStayDays')!) : 30, // Default 1 month
  });

  useEffect(() => {
    fetchProperties();
  }, [page, filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await api.getProperties({
        page,
        limit,
        ...filters,
      });
      setProperties(response.data);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Find House Sitting Properties</h1>
            <p className="text-gray-600">
              Browse available properties worldwide for trust-based house sitting opportunities (1 month minimum stays)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <i className="fas fa-home text-white"></i>
            </div>
            <span className="text-2xl font-bold text-gray-900">How Sitter</span>
          </div>
        </div>

        {/* How Sitter Value Proposition */}
        <div className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                <i className="fas fa-calendar-check text-green-600 text-xl"></i>
              </div>
              <h4 className="font-bold text-gray-900">1 Month Minimum</h4>
              <p className="text-gray-600 text-sm">No short-term rentals, only house sitting</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-100 flex items-center justify-center">
                <i className="fab fa-whatsapp text-green-600 text-xl"></i>
              </div>
              <h4 className="font-bold text-gray-900">WhatsApp Direct</h4>
              <p className="text-gray-600 text-sm">Direct communication with homeowners</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                <i className="fas fa-file-contract text-blue-600 text-xl"></i>
              </div>
              <h4 className="font-bold text-gray-900">Electronic Agreements</h4>
              <p className="text-gray-600 text-sm">5-day notice to vacate included</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <PropertyFilters filters={filters} onFilterChange={handleFilterChange} />
            
            {/* Payment Information */}
            <div className="mt-6 bg-white rounded-2xl border-2 border-green-200 shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Information</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <i className="fab fa-paypal text-blue-500 text-xs"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">First Transaction</p>
                    <p className="text-xs text-gray-600">PayPal required (50% minimum)</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                    <i className="fas fa-money-bill-wave text-green-600 text-xs"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Subsequent Arrangements</p>
                    <p className="text-xs text-gray-600">Cash, Pix, Zelle accepted</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  <i className="fas fa-info-circle mr-1"></i>
                  How Sitter commission only on first PayPal transaction
                </p>
              </div>
            </div>

            {/* WhatsApp Support */}
            <div className="mt-6 text-center">
              <a
                href="https://wa.me/6588888888"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <i className="fab fa-whatsapp mr-2"></i>
                WhatsApp Property Questions
              </a>
              <p className="text-xs text-gray-500 mt-2">8AM–5PM daily • 5 min response</p>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="lg:w-3/4">
            {/* Results Info */}
            <div className="mb-6 flex justify-between items-center">
              <div>
                <p className="text-gray-600">
                  Showing {properties.length} of {total} properties available for house sitting
                </p>
                <p className="text-sm text-gray-500">All properties require 1 month minimum stays</p>
              </div>
              <div className="flex items-center space-x-4">
                <select 
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={limit}
                  onChange={(e) => {/* Handle items per page */}}
                >
                  <option value="12">12 per page</option>
                  <option value="24">24 per page</option>
                  <option value="48">48 per page</option>
                </select>
                <button
                  onClick={() => navigate('/list-property')}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  List Your Property
                </button>
              </div>
            </div>

            {/* Properties Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gradient-to-br from-green-100 to-blue-100 h-64 rounded-2xl"></div>
                    <div className="h-4 bg-gray-200 rounded mt-4"></div>
                    <div className="h-4 bg-gray-200 rounded mt-2 w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : properties.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2.5 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-green-300 transition-colors font-medium"
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
                            className={`px-4 py-2.5 border-2 rounded-lg transition-colors font-medium ${
                              page === pageNum
                                ? 'border-green-600 bg-green-600 text-white shadow-md'
                                : 'border-gray-300 hover:bg-gray-50 hover:border-green-300'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2.5 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-green-300 transition-colors font-medium"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-search text-green-400 text-3xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search filters or check back later</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setFilters({
                      city: '',
                      country: '',
                      minPrice: undefined,
                      maxPrice: undefined,
                      bedrooms: undefined,
                      type: '',
                      minStayDays: 30,
                    })}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    Clear all filters
                  </button>
                  <button
                    onClick={() => navigate('/list-property')}
                    className="bg-white text-green-600 border-2 border-green-600 hover:bg-green-50 px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    List Your Property
                  </button>
                </div>
                <div className="mt-8 max-w-md mx-auto">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-sm text-gray-700">
                      <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                      <strong>Tip:</strong> All How Sitter properties require 1 month minimum stays. 
                      Consider longer stays for better opportunities.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* How Sitter Features */}
            <div className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border-2 border-green-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose How Sitter Properties?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 text-lg flex items-center">
                    <i className="fas fa-check-circle text-green-600 mr-2"></i>
                    For House Sitters
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <i className="fas fa-calendar-alt text-green-500 mr-2 mt-1"></i>
                      <span>1 month minimum stays for stable arrangements</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fab fa-whatsapp text-green-500 mr-2 mt-1"></i>
                      <span>Direct WhatsApp communication with homeowners</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-file-contract text-blue-500 mr-2 mt-1"></i>
                      <span>Electronic agreements with clear responsibilities</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-dollar-sign text-yellow-500 mr-2 mt-1"></i>
                      <span>First transaction: PayPal (50% minimum), then flexible payments</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 text-lg flex items-center">
                    <i className="fas fa-home text-blue-600 mr-2"></i>
                    For Homeowners (Listers)
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <i className="fas fa-user-check text-green-500 mr-2 mt-1"></i>
                      <span>Verified sitters with Mandatory Discovery</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-shield-alt text-blue-500 mr-2 mt-1"></i>
                      <span>Sitters indemnify platform and homeowners</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-exclamation-triangle text-yellow-500 mr-2 mt-1"></i>
                      <span>5-day electronic notice to vacate clause</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-percentage text-green-500 mr-2 mt-1"></i>
                      <span>Commission only on first PayPal transaction</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-green-50 via-yellow-50 to-white rounded-2xl p-12 text-center border-2 border-green-200 shadow-lg">
          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center mr-4 shadow-xl">
              <i className="fas fa-home text-white text-2xl"></i>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Ready to Find Your House Sitting Property?</h2>
              <p className="text-gray-600">Join our trust-based community</p>
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-left bg-white p-6 rounded-xl border border-green-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                  <i className="fas fa-user-check text-green-600 mr-2"></i>
                  For House Sitters
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Complete Mandatory Discovery to access verified properties and start house sitting.
                </p>
                <button
                  onClick={() => navigate('/register?sitter=true')}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Register as Sitter
                </button>
              </div>
              <div className="text-left bg-white p-6 rounded-xl border border-green-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                  <i className="fas fa-home text-blue-600 mr-2"></i>
                  For Homeowners
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  List your property and find verified sitters to care for your home.
                </p>
                <button
                  onClick={() => navigate('/list-property')}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  List Your Property
                </button>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <a
                href="https://wa.me/6588888888"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <i className="fab fa-whatsapp mr-2"></i>
                WhatsApp Property Questions
              </a>
              <p className="text-gray-500 text-sm mt-4">
                8AM–5PM daily • Expert property advice • 5 min average response
              </p>
            </div>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-start">
            <i className="fas fa-gavel text-gray-400 mt-1 mr-3"></i>
            <div>
              <p className="text-sm text-gray-700">
                <strong>Legal Notice:</strong> How Sitter arrangements are structured as house sitting agreements, 
                not traditional leases. All agreements include electronic 5-day notice to vacate clauses. 
                Sitters act as fiduciaries and indemnify both platform and homeowners. First transaction must 
                use PayPal through our platform for at least 50% of booking amount.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};