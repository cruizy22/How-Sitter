// frontend/components/admin/PendingVerifications.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface VerificationRequest {
  id: string;
  entity_type: string;
  entity_id: string;
  user_name: string;
  user_email: string;
  status: string;
  created_at: string;
  request_type?: string;
  requested_data?: any;
  admin_notes?: string;
}

export const PendingVerifications: React.FC = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const limit = 10;

  useEffect(() => {
    fetchPendingVerifications();
  }, [filter, page]);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { 
        page, 
        limit 
      };
      
      if (filter !== 'all') params.type = filter;
      
      const response = await api.getPendingVerifications(params);
      
      if (response.data && Array.isArray(response.data)) {
        // Filter to only show pending status
        const pendingRequests = response.data.filter(req => 
          req.status === 'pending' || req.status === undefined || req.status === null
        );
        setRequests(pendingRequests);
        setTotal(response.pagination?.total || pendingRequests.length);
      } else {
        setRequests([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Failed to fetch pending verifications:', error);
      setError('Failed to load verification requests');
      
      // Set mock data for development
      setRequests([
        {
          id: '1',
          entity_type: 'user',
          entity_id: '123',
          user_name: 'John Doe',
          user_email: 'john@example.com',
          status: 'pending',
          created_at: new Date().toISOString(),
          request_type: 'verification',
          requested_data: {
            name: 'John Doe',
            email: 'john@example.com',
            role: 'sitter',
            phone: '+1234567890',
            country: 'USA'
          }
        },
        {
          id: '2',
          entity_type: 'property',
          entity_id: '456',
          user_name: 'Jane Smith',
          user_email: 'jane@example.com',
          status: 'pending',
          created_at: new Date().toISOString(),
          request_type: 'property_verification',
          requested_data: {
            title: 'Beautiful Beach House',
            address: '123 Ocean Drive, Miami FL',
            property_type: 'house'
          }
        }
      ]);
      setTotal(2);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (entityType: string, entityId: string) => {
    if (!entityId) {
      alert('Error: Missing entity ID');
      return;
    }
    
    if (window.confirm('Are you sure you want to approve this verification?')) {
      try {
        setProcessingId(`${entityType}-${entityId}`);
        await api.verifyEntity(entityType, entityId, { action: 'approve', notes: '' });
        alert('Verification approved successfully');
        fetchPendingVerifications();
      } catch (error) {
        console.error('Approve error:', error);
        alert('Failed to approve verification. Please try again.');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleReject = async (entityType: string, entityId: string) => {
    if (!entityId) {
      alert('Error: Missing entity ID');
      return;
    }
    
    const notes = prompt('Please provide a reason for rejection:');
    if (notes !== null) {
      try {
        setProcessingId(`${entityType}-${entityId}`);
        await api.verifyEntity(entityType, entityId, { action: 'reject', notes });
        alert('Verification rejected');
        fetchPendingVerifications();
      } catch (error) {
        console.error('Reject error:', error);
        alert('Failed to reject verification. Please try again.');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleRequestInfo = async (entityType: string, entityId: string) => {
    if (!entityId) {
      alert('Error: Missing entity ID');
      return;
    }
    
    const message = prompt('What additional information do you need?');
    if (message) {
      try {
        setProcessingId(`${entityType}-${entityId}`);
        await api.requestMoreInfo(entityType, entityId, message);
        alert('Information request sent successfully');
      } catch (error) {
        console.error('Request info error:', error);
        alert('Failed to send request. Please try again.');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'user': return 'fa-user';
      case 'property': return 'fa-home';
      case 'sitter': return 'fa-user-check';
      default: return 'fa-question-circle';
    }
  };

  const getEntityColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'property': return 'bg-green-100 text-green-800';
      case 'sitter': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString || 'N/A';
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && requests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && requests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Verifications</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchPendingVerifications}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Pending Verifications</h2>
            <p className="text-gray-600 text-sm mt-1">
              {requests.length} request{requests.length !== 1 ? 's' : ''} pending review
            </p>
          </div>
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={loading}
            >
              <option value="all">All Types</option>
              <option value="user">Users</option>
              <option value="property">Properties</option>
              <option value="sitter">Sitters</option>
            </select>
            <button
              onClick={fetchPendingVerifications}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              <i className={`fas fa-sync mr-2 ${loading ? 'fa-spin' : ''}`}></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <i className="fas fa-check-circle text-green-600 text-2xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending verifications</h3>
          <p className="text-gray-600">All verification requests have been processed.</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-200">
            {requests.map((request) => {
              const entityId = request.entity_id || request.id;
              const entityType = request.entity_type || 'unknown';
              const isProcessing = processingId === `${entityType}-${entityId}`;
              
              return (
                <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                    <div className="flex items-start space-x-4 flex-1 w-full">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getEntityColor(entityType)}`}>
                        <i className={`fas ${getEntityIcon(entityType)}`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {request.user_name || 'Unknown'}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEntityColor(entityType)}`}>
                            {entityType}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 break-words">
                          {request.user_email && (
                            <>Submitted by {request.user_email}</>
                          )}
                        </p>
                        
                        <p className="text-xs text-gray-500 mt-1">
                          Request ID: {request.id} • Created: {formatDate(request.created_at)}
                        </p>
                        
                        {request.requested_data && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Submitted Data:</p>
                            <div className="p-3 bg-gray-50 rounded-lg overflow-x-auto">
                              <pre className="text-xs whitespace-pre-wrap break-words">
                                {JSON.stringify(request.requested_data, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto">
                      <button
                        onClick={() => handleApprove(entityType, entityId)}
                        disabled={isProcessing || !entityId}
                        className="flex-1 lg:flex-none px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                        ) : (
                          <i className="fas fa-check mr-2"></i>
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(entityType, entityId)}
                        disabled={isProcessing || !entityId}
                        className="flex-1 lg:flex-none px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <i className="fas fa-times mr-2"></i>
                        Reject
                      </button>
                      <button
                        onClick={() => handleRequestInfo(entityType, entityId)}
                        disabled={isProcessing || !entityId}
                        className="flex-1 lg:flex-none px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <i className="fas fa-question-circle mr-2"></i>
                        Request Info
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                  <span className="font-medium">{total}</span> results
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};