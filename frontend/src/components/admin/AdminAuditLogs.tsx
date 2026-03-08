// frontend/components/admin/AdminAuditLogs.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface AuditLog {
  id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  admin_id: string;
  admin_name: string;
  action_details: any;
  ip_address: string;
  created_at: string;
}

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    action_type: '',
    entity_type: '',
    start_date: '',
    end_date: '',
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchAuditLogs();
  }, [filters, page]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { page, limit };
      if (filters.action_type) params.action_type = filters.action_type;
      if (filters.entity_type) params.entity_type = filters.entity_type;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      
      const response = await api.getAuditLogs(params);
      
      if (response.data && Array.isArray(response.data)) {
        setLogs(response.data);
        setTotal(response.pagination?.total || 0);
      } else {
        setLogs([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      setError('Failed to load audit logs');
      
      // Set mock data for development
      setLogs([
        {
          id: '1',
          action_type: 'verification',
          entity_type: 'user',
          entity_id: '123',
          admin_id: 'admin1',
          admin_name: 'Admin User',
          action_details: {
            action: 'approve',
            notes: 'User verified successfully'
          },
          ip_address: '192.168.1.1',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          action_type: 'property_approval',
          entity_type: 'property',
          entity_id: '456',
          admin_id: 'admin1',
          admin_name: 'Admin User',
          action_details: {
            action: 'approve',
            notes: 'Property approved'
          },
          ip_address: '192.168.1.1',
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
      setTotal(2);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      action_type: '',
      entity_type: '',
      start_date: '',
      end_date: '',
    });
    setPage(1);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'verification': return 'fa-check-circle';
      case 'property_approval': return 'fa-home';
      case 'user_management': return 'fa-user-cog';
      case 'content_moderation': return 'fa-flag';
      case 'system': return 'fa-cog';
      default: return 'fa-history';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'verification': return 'text-green-600 bg-green-100';
      case 'property_approval': return 'text-blue-600 bg-blue-100';
      case 'user_management': return 'text-purple-600 bg-purple-100';
      case 'content_moderation': return 'text-yellow-600 bg-yellow-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && logs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Audit Logs</h2>
            <p className="text-gray-600 text-sm mt-1">Track all administrator actions</p>
          </div>
          <button
            onClick={fetchAuditLogs}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <i className={`fas fa-sync mr-2 ${loading ? 'fa-spin' : ''}`}></i>
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
            <select
              value={filters.action_type}
              onChange={(e) => handleFilterChange('action_type', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Actions</option>
              <option value="verification">Verification</option>
              <option value="property_approval">Property Approval</option>
              <option value="user_management">User Management</option>
              <option value="content_moderation">Content Moderation</option>
              <option value="system">System</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
            <select
              value={filters.entity_type}
              onChange={(e) => handleFilterChange('entity_type', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Entities</option>
              <option value="user">User</option>
              <option value="property">Property</option>
              <option value="sitter">Sitter</option>
              <option value="review">Review</option>
              <option value="arrangement">Arrangement</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-6 border-b border-gray-200 bg-red-50">
          <div className="flex items-center text-red-700">
            <i className="fas fa-exclamation-triangle mr-3"></i>
            <span>{error}</span>
          </div>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <i className="fas fa-search text-gray-400 text-2xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
          <p className="text-gray-600">No actions match your filter criteria.</p>
          {Object.values(filters).some(v => v !== '') && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-200">
            {logs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActionColor(log.action_type)}`}>
                      <i className={`fas ${getActionIcon(log.action_type)}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900 capitalize">
                          {log.action_type?.replace('_', ' ') || 'Unknown Action'}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action_type)}`}>
                          {log.entity_type || 'Unknown Entity'}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {log.admin_name || 'Unknown Admin'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        {formatDateTime(log.created_at)}
                      </p>
                      
                      {log.action_details && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Action Details:</p>
                          <div className="p-3 bg-gray-50 rounded-lg overflow-x-auto">
                            <pre className="text-xs whitespace-pre-wrap break-words">
                              {JSON.stringify(log.action_details, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">IP Address:</span>
                          <span className="ml-2 text-gray-600">{log.ip_address || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Entity ID:</span>
                          <span className="ml-2 text-gray-600 font-mono">{log.entity_id || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                  
                  {/* Page numbers */}
                  <div className="hidden sm:flex space-x-2">
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
                          disabled={loading}
                          className={`px-3 py-1 border rounded text-sm transition-colors ${
                            page === pageNum
                              ? 'border-green-600 bg-green-600 text-white'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <span className="sm:hidden px-3 py-1 text-sm text-gray-700">
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