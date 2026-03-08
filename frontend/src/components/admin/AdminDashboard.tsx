// frontend/components/admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { PendingVerifications } from './PendingVerifications';
import { SystemAnalytics } from './SystemAnalytics';
import { AdminAuditLogs } from './AdminAuditLogs';

// Define the interface that matches what getAdminStats() actually returns
interface AdminDashboardStats {
  users: {
    total: number;
    homeowners: number;
    sitters: number;
    verified_users: number;
    pending_verifications: number;
  };
  properties: {
    total: number;
    pending_approval: number;
    pending_verification: number;
    available: number;
  };
  arrangements: {
    total: number;
    pending: number;
    active: number;
    completed: number;
  };
  pending_requests: number;
  recent_activities: Array<{ action_type: string; count: number }>;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First check if user is logged in and is admin
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Get user info from localStorage or verify token
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role !== 'admin') {
          setError('Admin access required');
          setLoading(false);
          return;
        }
        setAdminInfo(user);
      } else {
        // Try to verify token and get user info
        try {
          const verification = await api.verifyToken();
          if (verification.valid && verification.user) {
            if (verification.user.role !== 'admin') {
              setError('Admin access required');
              setLoading(false);
              return;
            }
            setAdminInfo(verification.user);
            localStorage.setItem('user', JSON.stringify(verification.user));
          } else {
            navigate('/login');
            return;
          }
        } catch (err) {
          console.error('Token verification failed:', err);
          navigate('/login');
          return;
        }
      }

      // Fetch dashboard stats
      await fetchDashboardStats();
    } catch (error) {
      console.error('Failed to initialize admin dashboard:', error);
      setError('Failed to load dashboard. Please try again.');
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Get stats from API - returns DashboardStats directly
      const statsData = await api.getAdminStats();
      console.log('Dashboard stats received:', statsData);
      
      // Ensure we have valid data structure
      const validatedStats: AdminDashboardStats = {
        users: statsData.users || {
          total: 0,
          homeowners: 0,
          sitters: 0,
          verified_users: 0,
          pending_verifications: 0
        },
        properties: statsData.properties || {
          total: 0,
          pending_approval: 0,
          pending_verification: 0,
          available: 0
        },
        arrangements: statsData.arrangements || {
          total: 0,
          pending: 0,
          active: 0,
          completed: 0
        },
        pending_requests: statsData.pending_requests || 0,
        recent_activities: statsData.recent_activities || []
      };
      
      setStats(validatedStats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setError('Failed to load dashboard statistics. Please try again.');
      // Set default empty stats to prevent UI from breaking
      setStats({
        users: {
          total: 0,
          homeowners: 0,
          sitters: 0,
          verified_users: 0,
          pending_verifications: 0
        },
        properties: {
          total: 0,
          pending_approval: 0,
          pending_verification: 0,
          available: 0
        },
        arrangements: {
          total: 0,
          pending: 0,
          active: 0,
          completed: 0
        },
        pending_requests: 0,
        recent_activities: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.clearToken();
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-sm">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-red-500 text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Show admin access required if not admin
  if (!adminInfo || adminInfo.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-sm">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <i className="fas fa-shield-alt text-red-500 text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Admin Access Required</h2>
          <p className="text-gray-600 mb-6">You need administrator privileges to access this page.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // CRITICAL FIX: Add null check before rendering stats-dependent content
  // If stats is still null, show loading or error
  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center mr-3">
                <i className="fas fa-shield-alt text-white"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">How Sitter Admin</h1>
                <p className="text-sm text-gray-600">Administration Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{adminInfo?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{adminInfo?.email || 'admin@example.com'}</p>
              </div>
              <div className="relative group">
                <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <i className="fas fa-user text-gray-600"></i>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block z-50">
                  <a href="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <i className="fas fa-user-cog mr-2"></i>Profile
                  </a>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
              { id: 'verifications', label: 'Verifications', icon: 'fa-check-circle', badge: stats?.pending_requests },
              { id: 'properties', label: 'Properties', icon: 'fa-home', badge: stats?.properties?.pending_approval },
              { id: 'users', label: 'Users', icon: 'fa-users', badge: stats?.users?.pending_verifications },
              { id: 'analytics', label: 'Analytics', icon: 'fa-chart-bar' },
              { id: 'audit-logs', label: 'Audit Logs', icon: 'fa-history' },
              { id: 'settings', label: 'Settings', icon: 'fa-cog' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className={`fas ${tab.icon} mr-2`}></i>
                {tab.label}
                {tab.badge && tab.badge > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards - Safe to access stats now because we checked !stats above */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
                    <i className="fas fa-users text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <span className="text-green-600 font-medium">{stats.users.homeowners} homeowners</span>
                  <span className="mx-2">•</span>
                  <span className="text-blue-600 font-medium">{stats.users.sitters} sitters</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mr-4">
                    <i className="fas fa-home text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Properties</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.properties.total}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <span className="text-yellow-600 font-medium">{stats.properties.pending_approval} pending</span>
                  <span className="mx-2">•</span>
                  <span className="text-green-600 font-medium">{stats.properties.available} available</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mr-4">
                    <i className="fas fa-calendar-check text-purple-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Arrangements</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.arrangements.active}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <span className="text-gray-600">{stats.arrangements.pending} pending</span>
                  <span className="mx-2">•</span>
                  <span className="text-green-600 font-medium">{stats.arrangements.completed} completed</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mr-4">
                    <i className="fas fa-clock text-red-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pending Actions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending_requests}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setActiveTab('verifications')}
                    className="text-sm bg-red-50 text-red-700 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Review now
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i className="fas fa-history text-gray-500 mr-2"></i>
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {stats.recent_activities && stats.recent_activities.length > 0 ? (
                    stats.recent_activities.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            activity.action_type === 'verification' ? 'bg-green-100' :
                            activity.action_type === 'property_approval' ? 'bg-blue-100' :
                            activity.action_type === 'user_management' ? 'bg-purple-100' : 'bg-gray-100'
                          }`}>
                            <i className={`fas ${
                              activity.action_type === 'verification' ? 'fa-check-circle text-green-600' :
                              activity.action_type === 'property_approval' ? 'fa-home text-blue-600' :
                              activity.action_type === 'user_management' ? 'fa-user-cog text-purple-600' : 'fa-cog text-gray-600'
                            } text-sm`}></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {activity.action_type.replace('_', ' ')}
                            </p>
                            <p className="text-xs text-gray-500">{activity.count} actions</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('audit-logs')}
                          className="text-xs text-green-600 hover:text-green-700 font-medium"
                        >
                          View all
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i className="fas fa-bolt text-yellow-500 mr-2"></i>
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab('verifications')}
                    className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    <i className="fas fa-check-circle text-blue-600 text-xl mb-2"></i>
                    <p className="text-sm font-medium text-gray-900">Review Verifications</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('properties')}
                    className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                  >
                    <i className="fas fa-home text-green-600 text-xl mb-2"></i>
                    <p className="text-sm font-medium text-gray-900">Approve Properties</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                  >
                    <i className="fas fa-user-check text-purple-600 text-xl mb-2"></i>
                    <p className="text-sm font-medium text-gray-900">Manage Users</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors"
                  >
                    <i className="fas fa-chart-line text-orange-600 text-xl mb-2"></i>
                    <p className="text-sm font-medium text-gray-900">View Analytics</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'verifications' && (
          <PendingVerifications />
        )}

        {activeTab === 'audit-logs' && (
          <AdminAuditLogs />
        )}

        {activeTab === 'analytics' && (
          <SystemAnalytics />
        )}

        {activeTab === 'properties' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Property Approvals</h2>
            <div className="text-center py-12">
              <i className="fas fa-home text-gray-400 text-5xl mb-4"></i>
              <p className="text-gray-600 mb-4">Property approval interface coming soon</p>
              <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                View Pending Properties ({stats?.properties?.pending_approval || 0})
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">User Management</h2>
            <div className="text-center py-12">
              <i className="fas fa-users text-gray-400 text-5xl mb-4"></i>
              <p className="text-gray-600 mb-4">User management interface coming soon</p>
              <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Manage Users
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Admin Settings</h2>
            <div className="text-center py-12">
              <i className="fas fa-cog text-gray-400 text-5xl mb-4"></i>
              <p className="text-gray-600">Admin settings interface coming soon</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};