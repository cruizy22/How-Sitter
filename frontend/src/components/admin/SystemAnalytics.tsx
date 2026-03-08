// frontend/components/admin/SystemAnalytics.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

export const SystemAnalytics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchSystemStats();
  }, [timeRange]);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSystemStats();
      setStats(data.stats || data);
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
      setError('Failed to load analytics data');
      
      // Set mock data for development
      setStats({
        users: {
          total: 150,
          homeowners: 80,
          sitters: 70,
          verified_users: 120,
          pending_verifications: 5
        },
        properties: {
          total: 45,
          pending_approval: 3,
          available: 40
        },
        dailyRegistrations: generateDailyRegistrations(),
        monthlyRevenue: generateMonthlyRevenue(),
        roleDistribution: [
          { role: 'homeowner', count: 80 },
          { role: 'sitter', count: 70 },
          { role: 'admin', count: 1 }
        ],
        propertyTypes: [
          { type: 'house', count: 20 },
          { type: 'apartment', count: 15 },
          { type: 'condo', count: 8 },
          { type: 'townhouse', count: 2 }
        ],
        verificationStats: {
          pending_users: 5,
          approved_users: 120,
          pending_properties: 3,
          approved_properties: 40
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for mock data
  const generateDailyRegistrations = () => {
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 10) + 1
      });
    }
    return data;
  };

  const generateMonthlyRevenue = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 5000) + 1000,
      bookings: Math.floor(Math.random() * 20) + 5
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const roleDistributionData = stats?.roleDistribution?.map((item: any) => ({
    name: item.role === 'homeowner' ? 'Homeowners' : 
          item.role === 'sitter' ? 'Sitters' : 
          item.role === 'admin' ? 'Admins' : item.role,
    value: item.count || 0
  })) || [];

  const propertyTypeData = stats?.propertyTypes?.map((item: any) => ({
    name: item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : 'Unknown',
    value: item.count || 0
  })) || [];

  const verificationData = [
    { name: 'Pending Users', value: stats?.verificationStats?.pending_users || 0 },
    { name: 'Approved Users', value: stats?.verificationStats?.approved_users || 0 },
    { name: 'Pending Properties', value: stats?.verificationStats?.pending_properties || 0 },
    { name: 'Approved Properties', value: stats?.verificationStats?.approved_properties || 0 },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-100 rounded"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchSystemStats}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">System Analytics</h2>
            <p className="text-gray-600 text-sm mt-1">Platform statistics and insights</p>
          </div>
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={fetchSystemStats}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <i className={`fas fa-sync mr-2 ${loading ? 'fa-spin' : ''}`}></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
              <i className="fas fa-user-clock text-blue-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.verificationStats?.pending_users || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mr-4">
              <i className="fas fa-user-check text-green-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Approved Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.verificationStats?.approved_users || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center mr-4">
              <i className="fas fa-home text-yellow-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Properties</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.verificationStats?.pending_properties || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mr-4">
              <i className="fas fa-check-double text-purple-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Approved Properties</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.verificationStats?.approved_properties || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Registrations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i className="fas fa-user-plus text-blue-500 mr-2"></i>
            Daily Registrations
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.dailyRegistrations || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Registrations"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Role Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i className="fas fa-users text-purple-500 mr-2"></i>
            User Role Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleDistributionData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [value, 'Users']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i className="fas fa-dollar-sign text-green-500 mr-2"></i>
            Monthly Revenue
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [`$${value?.toLocaleString() || 0}`, 'Revenue']}
                />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bookings" name="Bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i className="fas fa-check-circle text-yellow-500 mr-2"></i>
            Verification Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={verificationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [value, 'Count']}
                />
                <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                  {verificationData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.name.includes('Pending') ? '#f59e0b' :
                        entry.name.includes('Approved') ? '#10b981' : COLORS[index % COLORS.length]
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Property Types Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Types Distribution</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {propertyTypeData.length > 0 ? (
                propertyTypeData.map((item: any, index: number) => {
                  const total = propertyTypeData.reduce((sum: number, type: any) => sum + (type.value || 0), 0);
                  const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {item.value}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-3 max-w-xs">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    No property data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};