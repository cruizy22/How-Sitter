import React from 'react';
import { TRAVEL_STATS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const TravelTracker: React.FC = () => {
  const COLORS = ['#009639', '#FEDD00', '#6DA9D2', '#8B5CF6', '#FF6B6B'];
  
  // Enhanced travel stats with How Sitter focus
  const enhancedStats = TRAVEL_STATS.map(stat => ({
    ...stat,
    description: `${stat.percentage}% of How Sitter arrangements`,
    icon: stat.country === 'Brazil' ? 'fa-flag' : 
           stat.country === 'United States' ? 'fa-landmark' :
           stat.country === 'Spain' ? 'fa-sun' :
           stat.country === 'Portugal' ? 'fa-anchor' : 'fa-globe-europe'
  }));

  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-green-600 to-yellow-600 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6">
            <i className="fas fa-globe-americas mr-2"></i>
            How Sitter Global Network
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Worldwide House Sitting Community</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track where our trusted sitters are located worldwide and explore popular destinations for house sitting arrangements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Insights Card */}
          <div className="bg-white p-10 rounded-2xl shadow-lg border-2 border-green-200">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-yellow-600 flex items-center justify-center mr-4">
                <i className="fas fa-users text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Global Sitter Network</h3>
                <p className="text-gray-600">Verified sitters across 50+ countries</p>
              </div>
            </div>
            
            {/* Testimonial */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200 mb-8">
              <div className="flex items-start">
                <i className="fas fa-quote-left text-green-400 text-xl mr-3 mt-1"></i>
                <div>
                  <p className="italic text-gray-700 leading-relaxed">
                    "Through How Sitter, I've provided house sitting services in Brazil, Colombia, Mexico, and the United States. 
                    The mandatory discovery process gives homeowners confidence, and the 1-month minimum stay allows for meaningful connections."
                  </p>
                  <div className="flex items-center mt-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-yellow-600 flex items-center justify-center text-white font-bold mr-3">
                      MS
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Maria Silva</p>
                      <p className="text-gray-600 text-xs">Verified How Sitter, 5+ years experience</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <i className="fas fa-passport"></i>
                </div>
                <div>
                  <p className="font-bold text-gray-900">International Experience</p>
                  <p className="text-gray-600 text-sm">Sitters with house sitting experience in multiple countries</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <i className="fas fa-home"></i>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Property Diversity</p>
                  <p className="text-gray-600 text-sm">Experience with various property types worldwide</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Verified Community</p>
                  <p className="text-gray-600 text-sm">All sitters complete mandatory discovery process</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-12 grid grid-cols-2 gap-4">
              {enhancedStats.map((stat) => (
                <div key={stat.country} className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-green-100 hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{stat.flag}</span>
                      <i className={`fas ${stat.icon} text-green-600 group-hover:scale-110 transition-transform`}></i>
                    </div>
                    <span className="text-xs font-bold bg-gradient-to-r from-green-600 to-yellow-600 text-white px-2 py-1 rounded-full">
                      {stat.percentage}%
                    </span>
                  </div>
                  <p className="font-bold text-gray-900">{stat.country}</p>
                  <p className="text-sm text-gray-600">{stat.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.duration}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visualization Card */}
          <div className="bg-white p-10 rounded-2xl shadow-lg border-2 border-green-200">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center mr-4">
                <i className="fas fa-chart-pie text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Destination Distribution</h3>
                <p className="text-gray-600">Where How Sitter arrangements are most active</p>
              </div>
            </div>
            
            {/* Chart */}
            <div className="h-64 mb-12">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={enhancedStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="percentage"
                    nameKey="country"
                    label={(entry) => `${entry.country}: ${entry.percentage}%`}
                  >
                    {enhancedStats.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Percentage']}
                    labelFormatter={(label) => `Country: ${label}`}
                    contentStyle={{
                      background: 'white',
                      border: '2px solid #009639',
                      borderRadius: '12px',
                      padding: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Progress Bars */}
            <div className="space-y-6">
              <h4 className="font-bold text-gray-900 text-lg flex items-center">
                <i className="fas fa-chart-line text-green-600 mr-2"></i>
                Popular House Sitting Regions
              </h4>
              <div className="space-y-4">
                {enhancedStats.map((stat, index) => (
                  <div key={stat.country} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3" 
                          style={{ backgroundColor: COLORS[index] }}
                        ></div>
                        <span className="font-bold text-gray-900">{stat.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-sm">{stat.duration}</span>
                        <span className="text-sm font-bold text-green-600">{stat.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${stat.percentage}%`,
                          background: `linear-gradient(90deg, ${COLORS[index]}, ${COLORS[(index + 1) % COLORS.length]})`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* How Sitter Benefits */}
            <div className="mt-8 pt-8 border-t border-green-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="text-2xl font-bold text-green-600">1 Month</div>
                  <div className="text-sm text-gray-700">Minimum Stay</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">100%</div>
                  <div className="text-sm text-gray-700">Discovery Verified</div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl border border-green-200">
                <div className="flex items-start">
                  <i className="fas fa-info-circle text-green-600 mt-1 mr-3"></i>
                  <div>
                    <p className="text-sm font-bold text-green-800">How Sitter Global Standards</p>
                    <p className="text-xs text-green-700 mt-1">
                      All arrangements follow How Sitter policies: 1-month minimum stays, mandatory discovery, 
                      PayPal-first payments, and electronic agreements with 5-day notice requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-green-600 to-yellow-600 rounded-2xl p-12 text-white shadow-2xl">
            <h3 className="text-3xl font-bold mb-4">Ready to Join Our Global Community?</h3>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-95">
              Whether you're looking for a house sitter or want to become one, join How Sitter's trusted worldwide network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/sitters" 
                className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-0.5"
              >
                <i className="fas fa-search mr-2"></i>
                Find Verified Sitters
              </a>
              <a 
                href="/discovery" 
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-0.5"
              >
                <i className="fas fa-user-check mr-2"></i>
                Start Discovery Process
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
      
    </div>
  );
};