import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

export const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [arrangements, setArrangements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    fetchArrangements();
  }, []);

  const fetchArrangements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getArrangements();
      
      // Handle different response formats
      if (response && response.arrangements) {
        setArrangements(response.arrangements);
      } else if (Array.isArray(response)) {
        setArrangements(response);
      } else {
        setArrangements([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch arrangements:', error);
      setError(error.message || 'Failed to load arrangements');
      setArrangements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelArrangement = async (arrangementId: string) => {
    if (!confirm('Are you sure you want to cancel this arrangement?')) return;
    
    try {
      await api.updateArrangementStatus(arrangementId, 'cancelled');
      fetchArrangements(); // Refresh list
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to cancel arrangement');
    }
  };

  const handleCompleteArrangement = async (arrangementId: string) => {
    if (!confirm('Mark this arrangement as completed?')) return;
    
    try {
      await api.updateArrangementStatus(arrangementId, 'completed');
      
      // Remind about PayPal for first transaction
      if (arrangements.find(a => a.id === arrangementId)?.transaction_count === 0) {
        alert('Remember: For the first transaction, please use PayPal through our platform for at least 50% of the booking amount.');
      }
      
      fetchArrangements(); // Refresh list
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to complete arrangement');
    }
  };

  const handleSendNoticeToVacate = async (arrangementId: string) => {
    if (!confirm('Send 5-day Notice to Vacate? This will notify the sitter to vacate the property within 5 days.')) return;
    
    try {
      await api.sendNoticeToVacate(arrangementId);
      alert('5-day Notice to Vacate sent successfully');
      fetchArrangements();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to send notice');
    }
  };

  const filteredArrangements = arrangements.filter(arr => {
    if (activeTab === 'all') return true;
    return arr.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

  const calculateDuration = (startDate: string, endDate: string) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30);
      const remainingDays = diffDays % 30;
      
      if (diffMonths === 0) {
        return '1 month minimum';
      } else if (remainingDays === 0) {
        return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
      } else {
        return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ${remainingDays} days`;
      }
    } catch {
      return 'Duration not available';
    }
  };

  // Get WhatsApp number safely
  const getWhatsAppNumber = (arrangement: any) => {
    if (user?.role === 'homeowner') {
      return arrangement.sitter_whatsapp || arrangement.whatsapp_number || '6588888888';
    } else {
      return arrangement.homeowner_whatsapp || arrangement.whatsapp_number || '6588888888';
    }
  };

  // Get contact name for WhatsApp
  const getContactName = (arrangement: any) => {
    if (user?.role === 'homeowner') {
      return arrangement.sitter_name || 'the sitter';
    } else {
      return arrangement.homeowner_name || 'the homeowner';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My House Sitting Arrangements</h1>
            <p className="text-gray-600">
              Manage your trust-based house sitting connections
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <i className="fas fa-home text-white"></i>
            </div>
            <span className="text-2xl font-bold text-gray-900">How Sitter</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle text-red-500 mr-3 text-xl"></i>
              <div>
                <p className="font-medium text-red-800">Error Loading Arrangements</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Reminder Banner */}
        {user?.role === 'sitter' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle text-yellow-500 mr-3 text-xl"></i>
              <div>
                <p className="font-medium text-yellow-800">Payment Reminder</p>
                <p className="text-yellow-700 text-sm">
                  First transaction must use PayPal through our platform for at least 50% of the booking amount.
                  Subsequent arrangements can use cash, Pix, Zelle, or other off-book methods.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          {(['all', 'active', 'completed', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your arrangements...</p>
          </div>
        ) : filteredArrangements.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
              <i className="fas fa-calendar text-green-600 text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'all' ? 'No house sitting arrangements yet' : `No ${activeTab} arrangements`}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'all' 
                ? 'Start by browsing properties and making arrangement requests.' 
                : `You don't have any ${activeTab} house sitting arrangements.`}
            </p>
            {activeTab === 'all' && (
              <Link
                to="/properties"
                className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Browse Properties
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredArrangements.map((arrangement) => (
              <div key={arrangement.id} className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{arrangement.property_title}</h3>
                      <div className="flex items-center text-gray-600 mt-1">
                        <i className="fas fa-map-marker-alt text-sm mr-2 text-green-600"></i>
                        <span>{arrangement.location}, {arrangement.city}, {arrangement.country}</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm mt-2">
                        <i className="fas fa-clock mr-2"></i>
                        <span>{calculateDuration(arrangement.start_date, arrangement.end_date)}</span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(arrangement.status)}`}>
                        {arrangement.status.charAt(0).toUpperCase() + arrangement.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Dates</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(arrangement.start_date)} - {formatDate(arrangement.end_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Monthly Amount</p>
                      <p className="font-medium text-gray-900">${arrangement.monthly_amount}/month</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Messages</p>
                      <p className="font-medium text-gray-900">{arrangement.message_count || 0}</p>
                    </div>
                  </div>

                  {/* Sitter Info */}
                  {arrangement.sitter_name && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">House Sitter</p>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <i className="fas fa-user text-green-600"></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{arrangement.sitter_name}</p>
                          <p className="text-sm text-gray-600">{arrangement.sitter_country}</p>
                          <div className="flex items-center mt-1">
                            <i className="fab fa-whatsapp text-green-500 mr-1"></i>
                            <span className="text-xs text-gray-500">WhatsApp Available</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Homeowner Info */}
                  {arrangement.homeowner_name && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Homeowner (Lister)</p>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <i className="fas fa-home text-blue-600"></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{arrangement.homeowner_name}</p>
                          <p className="text-sm text-gray-600">{arrangement.homeowner_email}</p>
                          <div className="flex items-center mt-1">
                            <i className="fab fa-whatsapp text-green-500 mr-1"></i>
                            <span className="text-xs text-gray-500">WhatsApp Available</span>
                          </div>
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
                      to={`/messages?arrangement=${arrangement.id}`}
                      className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium"
                    >
                      View Messages ({arrangement.message_count || 0})
                    </Link>

                    {/* WhatsApp Direct */}
                    <a
                      href={`https://wa.me/${getWhatsAppNumber(arrangement)}?text=Hi ${encodeURIComponent(getContactName(arrangement))}, regarding our arrangement at ${arrangement.property_title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center"
                    >
                      <i className="fab fa-whatsapp mr-2"></i>
                      WhatsApp Direct
                    </a>

                    {/* Action buttons based on status and role */}
                    {user?.role === 'homeowner' && arrangement.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleCompleteArrangement(arrangement.id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                        >
                          Mark as Completed
                        </button>
                        <button
                          onClick={() => handleSendNoticeToVacate(arrangement.id)}
                          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium"
                        >
                          5-Day Notice to Vacate
                        </button>
                      </>
                    )}

                    {user?.role === 'sitter' && arrangement.status === 'active' && (
                      <button
                        onClick={() => handleCompleteArrangement(arrangement.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                      >
                        Complete Arrangement
                      </button>
                    )}

                    {/* Cancel button for active arrangements (both parties) */}
                    {arrangement.status === 'active' && (
                      <button
                        onClick={() => handleCancelArrangement(arrangement.id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
                      >
                        Cancel Arrangement
                      </button>
                    )}
                  </div>

                  {/* Payment Method Info */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <i className="fas fa-info-circle mr-2 text-blue-500"></i>
                      {arrangement.transaction_count === 0 
                        ? 'First transaction: Use PayPal through our platform for at least 50%'
                        : 'Subsequent arrangements: Cash, Pix, Zelle, or other methods accepted'}
                    </p>
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