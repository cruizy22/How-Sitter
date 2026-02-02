import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

export const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [arrangements, setArrangements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'active' | 'completed'>('all');

  useEffect(() => {
    fetchArrangements();
  }, []);

  const fetchArrangements = async () => {
    try {
      setLoading(true);
      const response = await api.getArrangements();
      setArrangements(response.arrangements || []);
    } catch (error) {
      console.error('Failed to fetch arrangements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (arrangementId: string, status: string) => {
    if (!confirm(`Are you sure you want to ${status} this arrangement?`)) return;
    
    try {
      await api.updateArrangementStatus(arrangementId, status);
      fetchArrangements(); // Refresh list
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const filteredArrangements = arrangements.filter(arr => {
    if (activeTab === 'all') return true;
    return arr.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">
            Manage your house sitting arrangements
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          {(['all', 'pending', 'confirmed', 'active', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab !== 'all' && (
                <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {arrangements.filter(a => a.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredArrangements.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="fas fa-calendar text-gray-400 text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'all' ? 'No bookings yet' : `No ${activeTab} bookings`}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'all' 
                ? 'Start by browsing properties and making booking requests.' 
                : `You don't have any ${activeTab} bookings.`}
            </p>
            {activeTab === 'all' && (
              <Link
                to="/properties"
                className="inline-block bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-semibold"
              >
                Browse Properties
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredArrangements.map((arrangement) => (
              <div key={arrangement.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{arrangement.property_title}</h3>
                      <div className="flex items-center text-gray-600 mt-1">
                        <i className="fas fa-map-marker-alt text-sm mr-2"></i>
                        <span>{arrangement.location}, {arrangement.city}, {arrangement.country}</span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(arrangement.status)}`}>
                        {arrangement.status.charAt(0).toUpperCase() + arrangement.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Dates</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(arrangement.start_date)} - {formatDate(arrangement.end_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-medium text-gray-900">${arrangement.total_amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Security Deposit</p>
                      <p className="font-medium text-gray-900">${arrangement.property_security_deposit || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Messages</p>
                      <p className="font-medium text-gray-900">{arrangement.message_count || 0}</p>
                    </div>
                  </div>

                  {arrangement.sitter_name && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Sitter</p>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <i className="fas fa-user text-primary"></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{arrangement.sitter_name}</p>
                          <p className="text-sm text-gray-600">{arrangement.sitter_country}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {arrangement.homeowner_name && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Homeowner</p>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <i className="fas fa-user text-primary"></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{arrangement.homeowner_name}</p>
                          <p className="text-sm text-gray-600">{arrangement.homeowner_email}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`/properties/${arrangement.property_id}`}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      View Property
                    </Link>
                    
                    <Link
                      to={`/bookings?arrangement=${arrangement.id}`}
                      className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 font-medium"
                    >
                      View Messages ({arrangement.message_count || 0})
                    </Link>

                    {/* Status update buttons for homeowners */}
                    {user?.role === 'homeowner' && arrangement.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(arrangement.id, 'confirmed')}
                          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium"
                        >
                          Confirm Booking
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(arrangement.id, 'cancelled')}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {/* Mark as completed */}
                    {user?.role === 'homeowner' && arrangement.status === 'active' && (
                      <button
                        onClick={() => handleStatusUpdate(arrangement.id, 'completed')}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
                      >
                        Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};