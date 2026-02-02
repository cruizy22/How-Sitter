import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalProperties: 0,
    totalSits: 0,
  });

  // Mock data for now - you can replace with API calls
  useEffect(() => {
    const mockStats = {
      totalBookings: user?.role === 'homeowner' ? 12 : 8,
      activeBookings: user?.role === 'homeowner' ? 3 : 2,
      completedBookings: user?.role === 'homeowner' ? 9 : 6,
      totalProperties: user?.role === 'homeowner' ? 2 : 0,
      totalSits: user?.role === 'sitter' ? 5 : 0,
    };
    setStats(mockStats);
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your {user?.role === 'homeowner' ? 'properties' : 'house sitting'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <i className="fas fa-calendar text-primary text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeBookings}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
            </div>
          </div>

          {user?.role === 'homeowner' ? (
            <>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Properties</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalProperties}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <i className="fas fa-home text-blue-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.completedBookings}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <i className="fas fa-star text-purple-600 text-xl"></i>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sits</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalSits}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <i className="fas fa-briefcase text-blue-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rating</p>
                    <p className="text-3xl font-bold text-gray-900">4.8</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <i className="fas fa-star text-yellow-600 text-xl"></i>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {user?.role === 'homeowner' ? (
            <>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Properties</h3>
                <p className="text-gray-600 mb-6">Add, edit, or remove your property listings</p>
                <Link
                  to="/list-property"
                  className="block w-full text-center bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  List New Property
                </Link>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">View Applications</h3>
                <p className="text-gray-600 mb-6">Review sitter applications for your properties</p>
                <Link
                  to="/bookings"
                  className="block w-full text-center border border-primary text-primary hover:bg-primary/10 py-3 rounded-lg font-semibold transition-colors"
                >
                  Check Applications
                </Link>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sits</h3>
                <p className="text-gray-600 mb-6">View and manage upcoming house sitting arrangements</p>
                <Link
                  to="/bookings"
                  className="block w-full text-center border border-gray-300 hover:border-gray-400 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                >
                  View Calendar
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Find Properties</h3>
                <p className="text-gray-600 mb-6">Browse available house sitting opportunities worldwide</p>
                <Link
                  to="/properties"
                  className="block w-full text-center bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Browse Properties
                </Link>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Applications</h3>
                <p className="text-gray-600 mb-6">Track the status of your house sitting applications</p>
                <Link
                  to="/bookings"
                  className="block w-full text-center border border-primary text-primary hover:bg-primary/10 py-3 rounded-lg font-semibold transition-colors"
                >
                  View Applications
                </Link>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
                <p className="text-gray-600 mb-6">Update your profile, preferences, and availability</p>
                <button className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 py-3 rounded-lg font-semibold transition-colors">
                  Edit Profile
                </button>
              </div>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <i className="fas fa-check text-green-600"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Booking confirmed</p>
                  <p className="text-sm text-gray-600">Your booking at Luxury Villa has been confirmed</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <i className="fas fa-comment text-blue-600"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">New message</p>
                  <p className="text-sm text-gray-600">John D. sent you a message about your application</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">1 day ago</span>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <i className="fas fa-star text-purple-600"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">New review</p>
                  <p className="text-sm text-gray-600">You received a 5-star review from Sarah L.</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">3 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};