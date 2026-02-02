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
      const response = await api.getSitters({ limit: 6 });
      setSitters(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sitters');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="global-sitters" className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-dark mb-4">Global Trust-Based House-Sitting Network</h2>
        <p className="text-xl text-gray max-w-2xl mx-auto">
          Verified house sitters from our database
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-64 rounded-2xl"></div>
              <div className="h-4 bg-gray-200 rounded mt-4"></div>
              <div className="h-4 bg-gray-200 rounded mt-2 w-3/4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={fetchSitters}
            className="mt-4 text-primary hover:underline"
          >
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
    </div>
  );
};

const SitterCard: React.FC<{ sitter: Sitter }> = ({ sitter }) => {
  return (
    <div className="group bg-white border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative h-64">
        {sitter.avatar_url ? (
          <img 
            src={sitter.avatar_url} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            alt={sitter.name}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <i className="fas fa-user text-gray-400 text-6xl"></i>
          </div>
        )}
        {sitter.is_available && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold">
            Available
          </div>
        )}
      </div>
      
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-dark">{sitter.name}</h3>
            <div className="flex items-center text-gray mt-1">
              <span className="text-lg mr-2">📍</span>
              <span>{sitter.country}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-yellow-500">
              <i className="fas fa-star mr-1"></i>
              <span className="font-bold text-dark">{sitter.rating.toFixed(1)}</span>
            </div>
            <p className="text-xs text-gray">({sitter.total_reviews} reviews)</p>
          </div>
        </div>

        <p className="text-gray italic mb-6 border-l-4 border-primary pl-4 py-1">"{sitter.bio}"</p>

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-gray mb-3">Credentials</p>
          <div className="flex flex-wrap gap-2">
            {sitter.credentials.slice(0, 3).map((cred) => (
              <span key={cred} className="bg-light-gray text-dark text-xs px-3 py-1.5 rounded-full">
                {cred}
              </span>
            ))}
            {sitter.credentials.length > 3 && (
              <span className="bg-light-gray text-dark text-xs px-3 py-1.5 rounded-full">
                +{sitter.credentials.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-hover transition-colors">
            View Profile
          </button>
          <button className="w-12 h-12 border border-border rounded-lg flex items-center justify-center hover:bg-light-gray transition-colors text-primary">
            <i className="fab fa-whatsapp text-xl"></i>
          </button>
        </div>
      </div>
    </div>
  );
};