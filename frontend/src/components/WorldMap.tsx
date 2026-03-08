// src/components/WorldMap.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker, Tooltip, LayersControl, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { api, Property, Sitter } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom animated markers
const createPropertyIcon = (isAvailable: boolean) => {
  return L.divIcon({
    className: 'custom-marker property-marker',
    html: `
      <div class="marker-pulse ${isAvailable ? 'available' : 'unavailable'}">
        <div class="marker-icon">
          <i class="fas fa-home"></i>
        </div>
        <div class="marker-shadow"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const createSitterIcon = (isAvailable: boolean) => {
  return L.divIcon({
    className: 'custom-marker sitter-marker',
    html: `
      <div class="marker-pulse ${isAvailable ? 'available' : 'unavailable'}">
        <div class="marker-icon">
          <i class="fas fa-user"></i>
        </div>
        <div class="marker-shadow"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Heatmap data point
interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

interface MapLocation {
  id: string;
  type: 'property' | 'sitter';
  title: string;
  lat: number;
  lng: number;
  location: string;
  country: string;
  price?: number;
  rating?: number;
  image?: string;
  description?: string;
  is_available: boolean;
  featured?: boolean;
  reviews?: number;
  experience?: number;
}

interface WorldMapProps {
  showProperties?: boolean;
  showSitters?: boolean;
  height?: string;
  onLocationSelect?: (location: MapLocation) => void;
}

// Custom map controls component
const MapControls: React.FC<{ onFitBounds: () => void; onReset: () => void }> = ({ onFitBounds, onReset }) => {
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={onFitBounds}
        className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-200 group"
        title="Fit all markers"
      >
        <i className="fas fa-expand-arrows-alt text-gray-600 group-hover:text-green-600"></i>
      </button>
      <button
        onClick={onReset}
        className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-200 group"
        title="Reset view"
      >
        <i className="fas fa-globe text-gray-600 group-hover:text-green-600"></i>
      </button>
    </div>
  );
};

// Search box component
const SearchBox: React.FC<{ onSearch: (location: MapLocation) => void; locations: MapLocation[] }> = ({ onSearch, locations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<MapLocation[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length > 2) {
      const filtered = locations.filter(loc => 
        loc.title.toLowerCase().includes(term.toLowerCase()) ||
        loc.location.toLowerCase().includes(term.toLowerCase()) ||
        loc.country.toLowerCase().includes(term.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (location: MapLocation) => {
    onSearch(location);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  return (
    <div className="absolute top-4 left-4 z-[1000] w-72">
      <div className="relative">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search locations..."
              className="w-full pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
          </div>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            {suggestions.map((loc, idx) => (
              <button
                key={`${loc.type}-${loc.id}`}
                className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-center gap-3 border-b last:border-0"
                onClick={() => handleSuggestionClick(loc)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  loc.type === 'property' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  <i className={`fas ${
                    loc.type === 'property' ? 'fa-home' : 'fa-user'
                  } ${
                    loc.type === 'property' ? 'text-green-600' : 'text-blue-600'
                  } text-sm`}></i>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{loc.title}</p>
                  <p className="text-xs text-gray-500">{loc.location}, {loc.country}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Stats panel component
const StatsPanel: React.FC<{ stats: { properties: number; sitters: number; available: number; countries: number } }> = ({ stats }) => {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-green-200 p-4">
      <h4 className="font-bold text-gray-900 mb-3 flex items-center">
        <i className="fas fa-chart-pie text-green-600 mr-2"></i>
        Live Statistics
      </h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.properties}</div>
          <div className="text-xs text-gray-600">Properties</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.sitters}</div>
          <div className="text-xs text-gray-600">Sitters</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.available}</div>
          <div className="text-xs text-gray-600">Available</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.countries}</div>
          <div className="text-xs text-gray-600">Countries</div>
        </div>
      </div>
    </div>
  );
};

// Featured location card
const FeaturedLocation: React.FC<{ location: MapLocation; onClose: () => void; onView: () => void }> = ({ location, onClose, onView }) => {
  return (
    <div className="absolute bottom-4 right-4 z-[1000] w-80 bg-white rounded-xl shadow-2xl border-2 border-green-200 overflow-hidden animate-slideIn">
      <div className="relative h-32 bg-gradient-to-r from-green-600 to-blue-600">
        {location.image ? (
          <img src={location.image} alt={location.title} className="w-full h-full object-cover opacity-50" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className={`fas ${location.type === 'property' ? 'fa-home' : 'fa-user'} text-white text-4xl opacity-30`}></i>
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
        >
          <i className="fas fa-times text-white"></i>
        </button>
        <div className="absolute bottom-2 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
            location.is_available ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
          }`}>
            {location.is_available ? '● Available' : '○ Unavailable'}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-gray-900">{location.title}</h3>
            <p className="text-sm text-gray-600">
              <i className="fas fa-map-marker-alt text-green-500 mr-1 text-xs"></i>
              {location.location}, {location.country}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            location.type === 'property' ? 'bg-green-100' : 'bg-blue-100'
          }`}>
            <i className={`fas ${
              location.type === 'property' ? 'fa-home' : 'fa-user'
            } ${
              location.type === 'property' ? 'text-green-600' : 'text-blue-600'
            }`}></i>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          {location.type === 'property' && location.price && (
            <div>
              <span className="text-xs text-gray-500">Monthly price</span>
              <p className="font-bold text-green-600">${location.price}</p>
            </div>
          )}
          {location.type === 'sitter' && location.rating && (
            <div>
              <span className="text-xs text-gray-500">Rating</span>
              <p className="font-bold text-yellow-600">
                <i className="fas fa-star mr-1 text-xs"></i>
                {location.rating.toFixed(1)}
              </p>
            </div>
          )}
          {location.reviews && (
            <div>
              <span className="text-xs text-gray-500">Reviews</span>
              <p className="font-bold text-gray-900">{location.reviews}</p>
            </div>
          )}
        </div>

        <button
          onClick={onView}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 rounded-lg font-medium transition-all transform hover:scale-[1.02]"
        >
          View {location.type === 'property' ? 'Property' : 'Profile'}
        </button>
      </div>
    </div>
  );
};

// Legend component
const MapLegend: React.FC = () => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-green-200 px-6 py-3">
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <span>Available Properties</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <span>Available Sitters</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
};

export const WorldMap: React.FC<WorldMapProps> = ({
  showProperties = true,
  showSitters = true,
  height = '600px',
  onLocationSelect
}) => {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [stats, setStats] = useState({ properties: 0, sitters: 0, available: 0, countries: 0 });
  
  const mapRef = useRef<L.Map | null>(null);
  const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const navigate = useNavigate();

  // Fetch data from database
  useEffect(() => {
    fetchLocations();
  }, [showProperties, showSitters]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      
      const allLocations: MapLocation[] = [];
      const countriesSet = new Set<string>();
      let propertyCount = 0;
      let sitterCount = 0;
      let availableCount = 0;
      
      // Fetch properties from database
      if (showProperties) {
        try {
          const propsResponse = await api.getProperties({ limit: 500 });
          const properties = propsResponse.data;
          propertyCount = properties.length;
          
          properties.forEach((prop: Property) => {
            if (prop.status === 'available') availableCount++;
            if (prop.country) countriesSet.add(prop.country);
            
            const coords = getCoordinatesForCountry(prop.country, prop.city);
            allLocations.push({
              id: prop.id,
              type: 'property',
              title: prop.title,
              lat: coords[0],
              lng: coords[1],
              location: prop.city || '',
              country: prop.country || '',
              price: prop.price_per_month,
              image: prop.primary_image,
              description: prop.description,
              is_available: prop.status === 'available',
              featured: prop.status === 'available' && prop.price_per_month > 3000,
              reviews: 0
            });
          });
        } catch (err) {
          console.error('Failed to fetch properties:', err);
        }
      }
      
      // Fetch sitters from database
      if (showSitters) {
        try {
          const sittersResponse = await api.getSitters({ limit: 500 });
          const sitters = sittersResponse.data;
          sitterCount = sitters.length;
          
          sitters.forEach((sitter: Sitter) => {
            if (sitter.is_available) availableCount++;
            if (sitter.country) countriesSet.add(sitter.country);
            
            const locationName = sitter.location || sitter.city || '';
            const coords = getCoordinatesForCountry(sitter.country || '', locationName);
            
            allLocations.push({
              id: sitter.id,
              type: 'sitter',
              title: sitter.name,
              lat: coords[0],
              lng: coords[1],
              location: locationName,
              country: sitter.country || '',
              rating: sitter.rating || sitter.avg_rating,
              image: sitter.avatar_url || sitter.avatar,
              description: sitter.bio,
              is_available: sitter.is_available || false,
              featured: (sitter.rating || 0) > 4.5,
              reviews: sitter.total_reviews,
              experience: sitter.experience_years
            });
          });
        } catch (err) {
          console.error('Failed to fetch sitters:', err);
        }
      }

      setLocations(allLocations);
      setStats({
        properties: propertyCount,
        sitters: sitterCount,
        available: availableCount,
        countries: countriesSet.size
      });

      // Generate heatmap data
      const heatmap: HeatmapPoint[] = allLocations.map(loc => ({
        lat: loc.lat,
        lng: loc.lng,
        intensity: loc.is_available ? 1 : 0.5
      }));
      setHeatmapData(heatmap);

    } catch (err) {
      console.error('Failed to fetch locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (location: MapLocation) => {
    setSelectedLocation(location);
    setMapCenter([location.lat, location.lng]);
    setMapZoom(12);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  const handleFitBounds = () => {
    if (mapRef.current && locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const handleResetView = () => {
    setMapCenter([20, 0]);
    setMapZoom(2);
    setSelectedLocation(null);
  };

  const getIcon = (location: MapLocation) => {
    return location.type === 'property' 
      ? createPropertyIcon(location.is_available)
      : createSitterIcon(location.is_available);
  };

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fas fa-map-marked-alt text-green-600 text-2xl animate-pulse"></i>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading global map data...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching properties and sitters from database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-green-200" style={{ height }}>
      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        ref={mapRef as any}
        preferCanvas={true}
      >
        {/* Base map layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          className="map-tiles"
        />

        {/* Satellite layer option */}
        <LayersControl position="bottomright">
          <LayersControl.BaseLayer checked name="Light">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Dark">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Markers */}
        {locations.map((location) => (
          <Marker
            key={`${location.type}-${location.id}`}
            position={[location.lat, location.lng]}
            icon={getIcon(location)}
            eventHandlers={{
              click: () => handleMarkerClick(location),
              mouseover: (e) => {
                e.target.openPopup();
              },
              mouseout: (e) => {
                e.target.closePopup();
              }
            }}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[220px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    location.type === 'property' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <i className={`fas ${
                      location.type === 'property' ? 'fa-home' : 'fa-user'
                    } text-xl ${
                      location.type === 'property' ? 'text-green-600' : 'text-blue-600'
                    }`}></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{location.title}</h4>
                    <p className="text-xs text-gray-600">
                      {location.location && `${location.location}, `}{location.country}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {location.type === 'property' && location.price && (
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <div className="text-xs text-gray-600">Price</div>
                      <div className="font-bold text-green-600">${location.price}</div>
                    </div>
                  )}
                  {location.type === 'sitter' && location.rating && (
                    <div className="text-center p-2 bg-yellow-50 rounded-lg">
                      <div className="text-xs text-gray-600">Rating</div>
                      <div className="font-bold text-yellow-600">{location.rating.toFixed(1)} ★</div>
                    </div>
                  )}
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">Status</div>
                    <div className={`font-bold ${location.is_available ? 'text-green-600' : 'text-yellow-600'}`}>
                      {location.is_available ? 'Available' : 'Unavailable'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (location.type === 'property') {
                      navigate(`/properties/${location.id}`);
                    } else {
                      navigate(`/sitters/${location.id}`);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-[1.02]"
                >
                  View Details
                </button>
              </div>
            </Popup>

            <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
              <span className="font-medium">{location.title}</span>
            </Tooltip>
          </Marker>
        ))}

        <ZoomControl position="bottomright" />
      </MapContainer>

      {/* UI Overlays */}
      <SearchBox onSearch={(loc) => handleMarkerClick(loc)} locations={locations} />
      <MapControls onFitBounds={handleFitBounds} onReset={handleResetView} />
      <StatsPanel stats={stats} />
      <MapLegend />

      {/* Featured Location Card */}
      {selectedLocation && (
        <FeaturedLocation
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onView={() => {
            if (selectedLocation.type === 'property') {
              navigate(`/properties/${selectedLocation.id}`);
            } else {
              navigate(`/sitters/${selectedLocation.id}`);
            }
          }}
        />
      )}

      {/* Database sync indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-green-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-float">
        <i className="fas fa-database mr-2"></i>
        Live from Database • {locations.length} locations
      </div>
    </div>
  );
};

// Enhanced coordinate mapping with more cities
function getCoordinatesForCountry(country: string = '', city: string = ''): [number, number] {
  const coordinates: Record<string, [number, number]> = {
    // North America
    'USA': [39.8283, -98.5795],
    'United States': [39.8283, -98.5795],
    'Canada': [56.1304, -106.3468],
    'Mexico': [23.6345, -102.5528],
    
    // Europe
    'UK': [55.3781, -3.4360],
    'United Kingdom': [55.3781, -3.4360],
    'Germany': [51.1657, 10.4515],
    'France': [46.6034, 2.2137],
    'Spain': [40.4637, -3.7492],
    'Italy': [41.8719, 12.5674],
    'Portugal': [39.3999, -8.2245],
    'Netherlands': [52.1326, 5.2913],
    'Belgium': [50.5039, 4.4699],
    'Switzerland': [46.8182, 8.2275],
    'Austria': [47.5162, 14.5501],
    'Sweden': [60.1282, 18.6435],
    'Norway': [60.4720, 8.4689],
    'Denmark': [56.2639, 9.5018],
    'Finland': [61.9241, 25.7482],
    'Ireland': [53.1424, -8.2439],
    'Greece': [39.0742, 21.8243],
    'Poland': [51.9194, 19.1451],
    'Czech Republic': [49.8175, 15.4730],
    'Hungary': [47.1625, 19.5033],
    'Croatia': [45.1000, 15.2000],
    
    // South America
    'Brazil': [-14.2350, -51.9253],
    'Argentina': [-38.4161, -63.6167],
    'Chile': [-35.6751, -71.5429],
    'Colombia': [4.5709, -74.2973],
    'Peru': [-9.1900, -75.0152],
    'Venezuela': [6.4238, -66.5897],
    
    // Asia
    'Japan': [36.2048, 138.2529],
    'China': [35.8617, 104.1954],
    'India': [20.5937, 78.9629],
    'South Korea': [35.9078, 127.7669],
    'Singapore': [1.3521, 103.8198],
    'Thailand': [15.8700, 100.9925],
    'Vietnam': [14.0583, 108.2772],
    'Malaysia': [4.2105, 101.9758],
    'Indonesia': [-0.7893, 113.9213],
    'Philippines': [12.8797, 121.7740],
    'UAE': [23.4241, 53.8478],
    'Saudi Arabia': [23.8859, 45.0792],
    'Israel': [31.0461, 34.8516],
    'Turkey': [38.9637, 35.2433],
    
    // Africa
    'South Africa': [-30.5595, 22.9375],
    'Egypt': [26.8206, 30.8025],
    'Morocco': [31.7917, -7.0926],
    'Kenya': [-0.0236, 37.9062],
    'Nigeria': [9.0820, 8.6753],
    'Ghana': [7.9465, -1.0232],
    
    // Oceania
    'Australia': [-25.2744, 133.7751],
    'New Zealand': [-40.9006, 174.8860],
  };

  const cities: Record<string, [number, number]> = {
    // US Cities
    'New York': [40.7128, -74.0060],
    'Los Angeles': [34.0522, -118.2437],
    'Chicago': [41.8781, -87.6298],
    'Houston': [29.7604, -95.3698],
    'Phoenix': [33.4484, -112.0740],
    'Philadelphia': [39.9526, -75.1652],
    'San Antonio': [29.4241, -98.4936],
    'San Diego': [32.7157, -117.1611],
    'Dallas': [32.7767, -96.7970],
    'San Jose': [37.3382, -121.8863],
    'Austin': [30.2672, -97.7431],
    'Jacksonville': [30.3322, -81.6557],
    'Fort Worth': [32.7555, -97.3308],
    'Columbus': [39.9612, -82.9988],
    'Charlotte': [35.2271, -80.8431],
    'San Francisco': [37.7749, -122.4194],
    'Indianapolis': [39.7684, -86.1581],
    'Seattle': [47.6062, -122.3321],
    'Denver': [39.7392, -104.9903],
    'Washington': [38.9072, -77.0369],
    'Boston': [42.3601, -71.0589],
    'Nashville': [36.1627, -86.7816],
    'Baltimore': [39.2904, -76.6122],
    'Oklahoma City': [35.4676, -97.5164],
    'Louisville': [38.2527, -85.7585],
    'Portland': [45.5152, -122.6784],
    'Las Vegas': [36.1699, -115.1398],
    'Milwaukee': [43.0389, -87.9065],
    'Albuquerque': [35.0853, -106.6056],
    'Tucson': [32.2226, -110.9747],
    'Fresno': [36.7378, -119.7871],
    'Sacramento': [38.5816, -121.4944],
    'Kansas City': [39.0997, -94.5786],
    'Atlanta': [33.7490, -84.3880],
    'Miami': [25.7617, -80.1918],
    'New Orleans': [29.9511, -90.0715],
    'Orlando': [28.5383, -81.3792],
    'Minneapolis': [44.9778, -93.2650],
    'Cleveland': [41.4993, -81.6944],
    'Cincinnati': [39.1031, -84.5120],
    'Pittsburgh': [40.4406, -79.9959],
    'St. Louis': [38.6270, -90.1994],
    'Tampa': [27.9506, -82.4572],
    'Raleigh': [35.7796, -78.6382],
    
    // Canadian Cities
    'Toronto': [43.6532, -79.3832],
    'Montreal': [45.5017, -73.5673],
    'Vancouver': [49.2827, -123.1207],
    'Calgary': [51.0447, -114.0719],
    'Edmonton': [53.5461, -113.4938],
    'Ottawa': [45.4215, -75.6972],
    'Quebec City': [46.8139, -71.2080],
    
    // European Cities
    'London': [51.5074, -0.1278],
    'Paris': [48.8566, 2.3522],
    'Berlin': [52.5200, 13.4050],
    'Madrid': [40.4168, -3.7038],
    'Rome': [41.9028, 12.4964],
    'Amsterdam': [52.3676, 4.9041],
    'Brussels': [50.8503, 4.3517],
    'Vienna': [48.2082, 16.3738],
    'Zurich': [47.3769, 8.5417],
    'Geneva': [46.2044, 6.1432],
    'Barcelona': [41.3851, 2.1734],
    'Milan': [45.4642, 9.1900],
    'Munich': [48.1351, 11.5820],
    'Frankfurt': [50.1109, 8.6821],
    'Hamburg': [53.5511, 9.9937],
    'Cologne': [50.9375, 6.9603],
    'Stockholm': [59.3293, 18.0686],
    'Copenhagen': [55.6761, 12.5683],
    'Oslo': [59.9139, 10.7522],
    'Helsinki': [60.1699, 24.9384],
    'Dublin': [53.3498, -6.2603],
    'Lisbon': [38.7223, -9.1393],
    'Porto': [41.1579, -8.6291],
    'Prague': [50.0755, 14.4378],
    'Budapest': [47.4979, 19.0402],
    'Warsaw': [52.2297, 21.0122],
    'Athens': [37.9838, 23.7275],
    'Istanbul': [41.0082, 28.9784],
    
    // South American Cities
    'Rio de Janeiro': [-22.9068, -43.1729],
    'Sao Paulo': [-23.5505, -46.6333],
    'Brasilia': [-15.8267, -47.9218],
    'Salvador': [-12.9777, -38.5016],
    'Fortaleza': [-3.7172, -38.5433],
    'Belo Horizonte': [-19.9167, -43.9345],
    'Manaus': [-3.1190, -60.0217],
    'Curitiba': [-25.4297, -49.2719],
    'Recife': [-8.0476, -34.8770],
    'Porto Alegre': [-30.0346, -51.2177],
    'Buenos Aires': [-34.6037, -58.3816],
    'Santiago': [-33.4489, -70.6693],
    'Lima': [-12.0464, -77.0428],
    'Bogota': [4.7110, -74.0721],
    'Caracas': [10.4806, -66.9036],
    
    // Asian Cities
    'Tokyo': [35.6762, 139.6503],
    'Osaka': [34.6937, 135.5023],
    'Kyoto': [35.0116, 135.7681],
    'Seoul': [37.5665, 126.9780],
    'Busan': [35.1796, 129.0756],
    'Beijing': [39.9042, 116.4074],
    'Shanghai': [31.2304, 121.4737],
    'Guangzhou': [23.1291, 113.2644],
    'Shenzhen': [22.5431, 114.0579],
    'Hong Kong': [22.3193, 114.1694],
    'Taipei': [25.0330, 121.5654],
    'Bangkok': [13.7563, 100.5018],
    'Phuket': [7.8804, 98.3923],
    'Chiang Mai': [18.7883, 98.9853],
    'Ho Chi Minh City': [10.8231, 106.6297],
    'Hanoi': [21.0285, 105.8542],
    'Kuala Lumpur': [3.1390, 101.6869],
    'Singapore City': [1.3521, 103.8198],
    'Jakarta': [-6.2088, 106.8456],
    'Bali': [-8.4095, 115.1889],
    'Manila': [14.5995, 120.9842],
    'Cebu': [10.3157, 123.8854],
    'Mumbai': [19.0760, 72.8777],
    'Delhi': [28.6139, 77.2090],
    'Bangalore': [12.9716, 77.5946],
    'Chennai': [13.0827, 80.2707],
    'Kolkata': [22.5726, 88.3639],
    'Dubai': [25.2048, 55.2708],
    'Abu Dhabi': [24.4539, 54.3773],
    'Doha': [25.2854, 51.5310],
    'Riyadh': [24.7136, 46.6753],
    'Jeddah': [21.5433, 39.1728],
    
    // African Cities
    'Cape Town': [-33.9249, 18.4241],
    'Johannesburg': [-26.2041, 28.0473],
    'Durban': [-29.8587, 31.0218],
    'Cairo': [30.0444, 31.2357],
    'Alexandria': [31.2001, 29.9187],
    'Casablanca': [33.5731, -7.5898],
    'Marrakech': [31.6295, -7.9811],
    'Nairobi': [-1.2921, 36.8219],
    'Mombasa': [-4.0435, 39.6682],
    'Lagos': [6.5244, 3.3792],
    'Abuja': [9.0765, 7.3986],
    'Accra': [5.6037, -0.1870],
    'Addis Ababa': [9.0320, 38.7469],
    
    // Oceanian Cities
    'Sydney': [-33.8688, 151.2093],
    'Melbourne': [-37.8136, 144.9631],
    'Brisbane': [-27.4698, 153.0251],
    'Perth': [-31.9505, 115.8605],
    'Adelaide': [-34.9285, 138.6007],
    'Canberra': [-35.2809, 149.1300],
    'Auckland': [-36.8485, 174.7633],
    'Wellington': [-41.2866, 174.7756],
    'Christchurch': [-43.5320, 172.6362],
  };

  if (city && cities[city]) {
    return cities[city];
  }

  if (country && coordinates[country]) {
    return coordinates[country];
  }

  return [20, 0];
}

export default WorldMap;