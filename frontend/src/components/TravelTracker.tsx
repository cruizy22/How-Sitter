import React from 'react';
import { TRAVEL_STATS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const TravelTracker: React.FC = () => {
  const COLORS = ['#009639', '#FEDD00', '#6DA9D2', '#8B5CF6'];
  
  return (
    <div className="bg-light-gray py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <i className="fas fa-map-marker-alt mr-2"></i>
            Global Insights
          </div>
          <h2 className="text-4xl font-bold text-dark mb-4">Global House Sitting Network</h2>
          <p className="text-lg text-gray max-w-2xl mx-auto">
            Track where our trusted sitters are located worldwide and explore popular destinations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Insights Card */}
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-border">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                <i className="fas fa-globe-americas text-primary text-xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-dark">Global Sitter Network</h3>
                <p className="text-gray">Active sitters across 50+ countries</p>
              </div>
            </div>
            
            <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 mb-8">
              <div className="flex items-start">
                <i className="fas fa-quote-left text-primary/40 text-xl mr-3 mt-1"></i>
                <p className="italic text-gray leading-relaxed">
                  "This year I've provided house sitting services in Brazil, Colombia, Mexico, and the United States – gaining diverse experience with different property types and cultures."
                </p>
              </div>
              <div className="flex items-center mt-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 mr-3"></div>
                <div>
                  <p className="font-bold text-dark text-sm">Experienced Sitter</p>
                  <p className="text-gray text-xs">5+ years of house sitting</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-green-100 text-primary flex items-center justify-center">
                  <i className="fas fa-passport"></i>
                </div>
                <div>
                  <p className="font-medium text-dark">International Experience</p>
                  <p className="text-gray text-sm">Sitters with experience in multiple countries</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-secondary flex items-center justify-center">
                  <i className="fas fa-home"></i>
                </div>
                <div>
                  <p className="font-medium text-dark">Property Diversity</p>
                  <p className="text-gray text-sm">Experience with various property types worldwide</p>
                </div>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-4">
              {TRAVEL_STATS.map((stat) => (
                <div key={stat.country} className="p-4 bg-light-gray rounded-xl border border-border hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xl">{stat.flag}</span>
                    <span className="text-xs font-bold text-gray">{stat.percentage}%</span>
                  </div>
                  <p className="font-bold text-dark">{stat.country}</p>
                  <p className="text-sm text-gray">{stat.duration}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visualization Card */}
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-border">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mr-4">
                <i className="fas fa-chart-pie text-accent text-xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-dark">Destination Distribution</h3>
                <p className="text-gray">Where sitters are most active</p>
              </div>
            </div>
            
            <div className="h-64 mb-12">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={TRAVEL_STATS}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="percentage"
                    nameKey="country"
                    label={(entry) => `${entry.country}: ${entry.percentage}%`}
                  >
                    {TRAVEL_STATS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Percentage']}
                    labelFormatter={(label) => `Country: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-bold text-dark text-lg">Popular Regions</h4>
              <div className="space-y-4">
                {TRAVEL_STATS.map((stat, index) => (
                  <div key={stat.country} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3" 
                          style={{ backgroundColor: COLORS[index] }}
                        ></div>
                        <span className="font-medium text-dark">{stat.country}</span>
                      </div>
                      <span className="text-gray">{stat.duration}</span>
                    </div>
                    <div className="h-2 bg-light-gray rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${stat.percentage}%`,
                          backgroundColor: COLORS[index]
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-gray text-sm">
                <i className="fas fa-info-circle text-primary mr-2"></i>
                Data based on active sitter profiles and completed house-sitting arrangements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};