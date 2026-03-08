import React, { useState, useEffect } from 'react';
import { api, Sitter } from '../services/api';

export const GlobalSitters: React.FC = () => {
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSitters();
  }, []);

  const fetchSitters = async () => {
    try {
      setLoading(true);
      const response = await api.getSitters({ 
        limit: 6
      });
      setSitters(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sitters');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="global-sitters" className="max-w-7xl mx-auto px-4 py-20">
      {/* Brand Header */}
      <div className="flex items-center justify-center mb-12">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center mr-4 shadow-lg">
          <i className="fas fa-globe-americas text-white text-2xl"></i>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900">How Sitter</h1>
          <p className="text-green-600 font-medium">Global Trust Network</p>
        </div>
      </div>

      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Global House-Sitting Network</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experienced house sitters from around the world ready to care for your home
        </p>
      </div>

      {/* Sitter Qualities */}
      <div className="mb-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">What Makes a Great Sitter</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-white rounded-xl border border-green-100">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
              <i className="fas fa-clock text-green-600 text-xl"></i>
            </div>
            <h4 className="font-bold text-gray-900">Reliable</h4>
            <p className="text-sm text-gray-600">Dependable and punctual</p>
          </div>
          <div className="text-center p-4 bg-white rounded-xl border border-green-100">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-100 flex items-center justify-center">
              <i className="fas fa-paw text-yellow-600 text-xl"></i>
            </div>
            <h4 className="font-bold text-gray-900">Pet-Friendly</h4>
            <p className="text-sm text-gray-600">Love caring for animals</p>
          </div>
          <div className="text-center p-4 bg-white rounded-xl border border-green-100">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
              <i className="fas fa-broom text-blue-600 text-xl"></i>
            </div>
            <h4 className="font-bold text-gray-900">Clean & Tidy</h4>
            <p className="text-sm text-gray-600">Respectful of your space</p>
          </div>
          <div className="text-center p-4 bg-white rounded-xl border border-green-100">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
              <i className="fas fa-comments text-purple-600 text-xl"></i>
            </div>
            <h4 className="font-bold text-gray-900">Communicative</h4>
            <p className="text-sm text-gray-600">Regular updates via WhatsApp</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gradient-to-br from-green-100 to-blue-100 h-64 rounded-2xl"></div>
              <div className="h-4 bg-gray-200 rounded mt-4"></div>
              <div className="h-4 bg-gray-200 rounded mt-2 w-3/4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
          </div>
          <p className="text-red-500">{error}</p>
          <button 
            onClick={fetchSitters}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium"
          >
            <i className="fas fa-redo mr-2"></i>
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sitters.map((sitter) => (
            <SitterCard key={sitter.id} sitter={sitter} />
          ))}
        </div>
      )}

      {/* WhatsApp Community CTA */}
      <div className="mt-16 bg-gradient-to-r from-green-50 via-yellow-50 to-white rounded-2xl p-12 text-center border-2 border-green-200 shadow-lg">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center mr-4 shadow-xl">
            <i className="fab fa-whatsapp text-white text-3xl"></i>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-900">Join Our Global Network</h3>
            <p className="text-gray-600">Connect with sitters worldwide</p>
          </div>
        </div>
        
        <div className="max-w-md mx-auto">
          <a
            href="https://chat.whatsapp.com/how-sitter-global"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <i className="fab fa-whatsapp mr-2"></i>
            Join How Sitter Global WhatsApp
          </a>
          <p className="text-gray-500 text-sm mt-4">
            Connect with sitters, share experiences, and get community support
          </p>
        </div>
      </div>
    </div>
  );
};

const SitterCard: React.FC<{ sitter: Sitter }> = ({ sitter }) => {
  return (
    <div className="group bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-64">
        {sitter.avatar_url ? (
          <img 
            src={sitter.avatar_url} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            alt={sitter.name}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-5xl font-bold">
              {sitter.name.charAt(0)}
            </div>
          </div>
        )}
        {sitter.is_available && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            Available Now
          </div>
        )}
      </div>
      
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{sitter.name}</h3>
            <div className="flex items-center text-gray-600 mt-1">
              <span className="text-lg mr-2">📍</span>
              <span>{sitter.country || 'Location not specified'}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-yellow-500">
              <i className="fas fa-star mr-1"></i>
              <span className="font-bold text-gray-900">{sitter.rating?.toFixed(1) || '5.0'}</span>
            </div>
            <p className="text-xs text-gray-500">({sitter.total_reviews || 0} reviews)</p>
          </div>
        </div>

        <p className="text-gray-600 italic mb-6 border-l-4 border-green-600 pl-4 py-1 bg-green-50">
          "{sitter.bio || 'Experienced house sitter ready to care for your home'}"
        </p>

        {/* Skills/Credentials */}
        {(sitter.skills?.length > 0 || sitter.credentials?.length > 0) && (
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Skills</p>
            <div className="flex flex-wrap gap-2">
              {(sitter.skills || sitter.credentials || []).slice(0, 4).map((skill, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-800 text-xs px-3 py-1.5 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {sitter.experience_years ? (
          <div className="mb-6 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center text-sm text-gray-700">
              <i className="fas fa-calendar-alt text-blue-600 mr-2"></i>
              <span>{sitter.experience_years} years of experience</span>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center text-sm text-gray-700">
              <i className="fas fa-home text-green-600 mr-2"></i>
              <span>Ready to care for your home</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg">
            View Profile
          </button>
          <a
            href={`https://wa.me/${sitter.phone || '6588888888'}?text=Hi ${encodeURIComponent(sitter.name)}, I saw your profile on How Sitter and would like to discuss a house sitting arrangement.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 border border-green-200 rounded-lg flex items-center justify-center hover:bg-green-50 transition-colors text-green-600"
          >
            <i className="fab fa-whatsapp text-xl"></i>
          </a>
        </div>

        {/* Trust Indicator */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <i className="fas fa-handshake text-green-500 mr-1"></i>
              <span>Trust-Based Community</span>
            </div>
            {sitter.completed_arrangements > 0 && (
              <div className="flex items-center">
                <i className="fas fa-check-circle text-green-500 mr-1"></i>
                <span>{sitter.completed_arrangements} completed sits</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};