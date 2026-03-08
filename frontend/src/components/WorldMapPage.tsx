// src/components/WorldMapPage.tsx
import React from 'react';
import { WorldMap } from './WorldMap';
import { Link } from 'react-router-dom';

export const WorldMapPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with animated gradient */}
        <div className="text-center mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-200/20 via-yellow-200/20 to-blue-200/20 blur-3xl -z-10"></div>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-2xl animate-pulse">
                <i className="fas fa-globe-americas text-white text-3xl"></i>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-ping"></div>
            </div>
            <div className="ml-6 text-left">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                How Sitter Worldwide
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Explore properties and sitters around the globe in real-time
              </p>
            </div>
          </div>
          
          {/* Stats preview */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-green-200">
              <i className="fas fa-database text-green-600 mr-2"></i>
              <span className="text-gray-700">Live from database</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-blue-200">
              <i className="fas fa-sync-alt text-blue-600 mr-2 animate-spin"></i>
              <span className="text-gray-700">Real-time updates</span>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="relative">
          <WorldMap 
            showProperties={true}
            showSitters={true}
            height="600px"
          />
        </div>

        {/* Feature highlights */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: 'fa-home', color: 'green', title: 'Properties', desc: 'Browse from our database of available properties' },
            { icon: 'fa-user', color: 'blue', title: 'Sitters', desc: 'Connect with verified sitters worldwide' },
            { icon: 'fa-chart-line', color: 'yellow', title: 'Live Stats', desc: 'Real-time statistics from your database' },
            { icon: 'fa-search', color: 'purple', title: 'Smart Search', desc: 'Search by location, name, or country' }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white rounded-xl border-2 border-green-200 p-6 text-center hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className={`w-14 h-14 mx-auto mb-4 rounded-full bg-${feature.color}-100 flex items-center justify-center`}>
                <i className={`fas ${feature.icon} text-${feature.color}-600 text-2xl`}></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="mt-12 text-center">
          <Link
            to="/properties"
            className="inline-flex items-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl transition-all mr-4 transform hover:scale-105"
          >
            <i className="fas fa-home mr-2"></i>
            Browse Properties
          </Link>
          <Link
            to="/sitters"
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <i className="fas fa-user-check mr-2"></i>
            Browse Sitters
          </Link>
        </div>

        {/* Database info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <i className="fas fa-check-circle text-green-500 mr-1"></i>
          Connected to database • Data updates automatically
        </div>
      </div>
    </div>
  );
};