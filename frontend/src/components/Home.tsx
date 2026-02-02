import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Property, Sitter } from '../services/api';

interface HomeProps {
  onStartBooking?: () => void;
  onListProperty?: () => void;
}

interface Stats {
  properties: number;
  sitters: number;
  countries: number;
  successfulArrangements: number;
}

export const Home: React.FC<HomeProps> = ({ onStartBooking, onListProperty }) => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sitters' | 'properties'>('properties');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  const [hoveredSitter, setHoveredSitter] = useState<string | null>(null);
  
  // Refs for animations
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHomeData();
    // Initialize animations
    initAnimations();
  }, []);

  const initAnimations = () => {
    // Add scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeInUp');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe elements for animation
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
  };

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data in parallel
      const [propertiesResponse, sittersResponse] = await Promise.all([
        api.getProperties({ limit: 6 }),
        api.getSitters({ limit: 4 })
      ]);
      
      console.log('✅ Home data loaded successfully');
      
      // Set properties and sitters with safe defaults
      setProperties(propertiesResponse.data || []);
      setSitters(sittersResponse.data || []);
      
      // Animated counter for stats
      const targetStats = {
        properties: propertiesResponse.pagination?.total || 1500,
        sitters: sittersResponse.pagination?.total || 850,
        countries: 65,
        successfulArrangements: 3200
      };
      
      // Animate stats counting up
      animateStats(targetStats);
      
    } catch (err) {
      console.error('❌ Error fetching home data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      // Set fallback data
      setProperties([]);
      setSitters([]);
      setStats({
        properties: 1500,
        sitters: 850,
        countries: 65,
        successfulArrangements: 3200
      });
    } finally {
      setLoading(false);
    }
  };

  const animateStats = (targetStats: Stats) => {
    let currentStats = {
      properties: 0,
      sitters: 0,
      countries: 0,
      successfulArrangements: 0
    };

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = {
      properties: targetStats.properties / steps,
      sitters: targetStats.sitters / steps,
      countries: targetStats.countries / steps,
      successfulArrangements: targetStats.successfulArrangements / steps
    };

    let step = 0;
    const timer = setInterval(() => {
      step++;
      currentStats = {
        properties: Math.min(Math.floor(increment.properties * step), targetStats.properties),
        sitters: Math.min(Math.floor(increment.sitters * step), targetStats.sitters),
        countries: Math.min(Math.floor(increment.countries * step), targetStats.countries),
        successfulArrangements: Math.min(Math.floor(increment.successfulArrangements * step), targetStats.successfulArrangements)
      };

      setStats(currentStats);

      if (step >= steps) {
        clearInterval(timer);
        setStats(targetStats);
      }
    }, duration / steps);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/properties');
    }
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  const handleViewSitter = (sitterId: string) => {
    navigate(`/sitters/${sitterId}`);
  };

  const handleQuickFilter = (filter: string) => {
    switch (filter) {
      case 'monthly':
        navigate('/properties?maxPrice=2000');
        break;
      case 'pet-friendly':
        navigate('/properties?amenities=pet-friendly');
        break;
      case 'long-term':
        navigate('/properties?minStayDays=30');
        break;
      case 'verified':
        navigate('/sitters?verified=true');
        break;
    }
  };

  const getSafeRating = (rating: any): number => {
    if (rating === null || rating === undefined) return 4.5;
    if (typeof rating === 'number') return rating;
    if (typeof rating === 'string') {
      const parsed = parseFloat(rating);
      return isNaN(parsed) ? 4.5 : parsed;
    }
    return 4.5;
  };

  return (
    <div className="min-h-screen">
      {/* Interactive Hero Section */}
      <section 
        ref={heroRef}
        className="relative pt-20 pb-32 bg-gradient-to-br from-primary/5 via-white to-secondary/5 overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
          <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-accent/5 rounded-full blur-2xl animate-pulse animation-delay-500"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Animated Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-dark mb-8 leading-tight animate-fadeIn">
              Trust-Based <span className="text-primary">House Sitting</span>
              <br />
              <span className="text-secondary">Made Simple</span>
            </h1>
            
            {/* Animated Subtitle */}
            <p className="text-xl text-gray max-w-3xl mx-auto mb-12 leading-relaxed animate-fadeIn animation-delay-300">
              Connect with verified house sitters and homeowners worldwide. 
              Secure, flexible arrangements for peace of mind while you're away.
            </p>
            
            {/* Interactive Search Bar */}
            <div className="max-w-4xl mx-auto mb-12 animate-fadeInUp animation-delay-500">
              <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-2 border border-border transform transition-all duration-300 hover:shadow-3xl">
                <div className="flex flex-col md:flex-row items-stretch md:items-center">
                  <div className="flex-1 flex items-center px-6 py-4">
                    <i className="fas fa-search text-gray mr-4 text-lg"></i>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Where do you need a house sitter?"
                      className="w-full outline-none text-lg text-dark placeholder-gray bg-transparent"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="ml-2 text-gray hover:text-dark transition-colors"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center px-6 py-4 border-t md:border-t-0 md:border-l border-border">
                    <i className="fas fa-calendar text-gray mr-4 text-lg"></i>
                    <input
                      type="text"
                      placeholder="Select dates"
                      className="w-full outline-none text-lg text-dark placeholder-gray cursor-pointer bg-transparent"
                      onFocus={(e) => e.target.type = 'date'}
                      onBlur={(e) => e.target.type = 'text'}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary px-10 py-4 text-lg font-semibold rounded-xl m-2 transform transition-transform hover:scale-105 active:scale-95"
                  >
                    <i className="fas fa-search mr-3"></i>
                    Search
                  </button>
                </div>
              </form>
              
              {/* Quick Filters */}
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                {[
                  { label: 'Under $2k/month', icon: 'fa-dollar-sign', filter: 'monthly' },
                  { label: 'Pet Friendly', icon: 'fa-paw', filter: 'pet-friendly' },
                  { label: 'Long Term', icon: 'fa-calendar-alt', filter: 'long-term' },
                  { label: 'Verified Sitters', icon: 'fa-user-check', filter: 'verified' }
                ].map((item) => (
                  <button
                    key={item.filter}
                    onClick={() => handleQuickFilter(item.filter)}
                    className="flex items-center gap-2 bg-white border border-border px-4 py-2 rounded-full text-sm text-gray hover:border-primary hover:text-primary transition-all duration-200 group"
                  >
                    <i className={`fas ${item.icon} group-hover:scale-110 transition-transform`}></i>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Animated CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp animation-delay-700">
              <button
                onClick={() => navigate('/sitters')}
                className="btn-primary px-10 py-4 text-lg font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <i className="fas fa-user-check mr-3 text-lg animate-pulse"></i>
                Find a Trusted Sitter
              </button>
              <button
                onClick={() => navigate('/list-property')}
                className="bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white px-10 py-4 text-lg font-semibold rounded-full transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <i className="fas fa-home mr-3 text-lg"></i>
                List Your Property
              </button>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <i className="fas fa-chevron-down text-gray text-2xl"></i>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section ref={statsRef} className="py-16 bg-white animate-on-scroll">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats ? (
              [
                { label: 'Properties Listed', value: stats.properties, icon: 'fas fa-home', color: 'text-primary' },
                { label: 'Verified Sitters', value: stats.sitters, icon: 'fas fa-user-check', color: 'text-secondary' },
                { label: 'Countries', value: stats.countries, icon: 'fas fa-globe-asia', color: 'text-accent' },
                { label: 'Successful Arrangements', value: stats.successfulArrangements, icon: 'fas fa-handshake', color: 'text-status-green' }
              ].map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center group cursor-pointer transform transition-transform hover:scale-105"
                  onClick={() => navigate(stat.label.includes('Properties') ? '/properties' : '/sitters')}
                >
                  <div className={`text-5xl font-bold ${stat.color} mb-3 transition-all duration-500`}>
                    {stat.value.toLocaleString()}+
                  </div>
                  <div className="text-gray flex items-center justify-center group-hover:text-dark transition-colors">
                    <i className={`${stat.icon} mr-3 ${stat.color} text-xl group-hover:scale-110 transition-transform`}></i>
                    <span className="font-medium">{stat.label}</span>
                  </div>
                </div>
              ))
            ) : (
              // Loading skeleton
              [...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-12 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Interactive Tabs Section */}
      <section className="py-20 bg-light-gray animate-on-scroll">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-full p-1 inline-flex border border-border">
              <button
                onClick={() => setActiveTab('properties')}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeTab === 'properties'
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray hover:text-dark'
                }`}
              >
                <i className="fas fa-home mr-2"></i>
                Browse Properties
              </button>
              <button
                onClick={() => setActiveTab('sitters')}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeTab === 'sitters'
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray hover:text-dark'
                }`}
              >
                <i className="fas fa-user-check mr-2"></i>
                Browse Sitters
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="relative">
            {/* Properties Tab */}
            <div className={`transition-all duration-500 ${activeTab === 'properties' ? 'opacity-100 visible' : 'opacity-0 invisible absolute top-0 left-0'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
                <div>
                  <h2 className="text-4xl font-bold text-dark mb-3">Featured Properties</h2>
                  <p className="text-gray text-lg">Handpicked homes needing trusted sitters</p>
                </div>
                <button 
                  onClick={() => navigate('/properties')}
                  className="text-primary font-semibold hover:text-primary-hover transition-colors flex items-center gap-3 mt-4 md:mt-0 group"
                >
                  View all properties
                  <i className="fas fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
                </button>
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
                  <div className="bg-status-red/10 border border-status-red/20 rounded-2xl p-8 max-w-md mx-auto">
                    <i className="fas fa-exclamation-triangle text-status-red text-4xl mb-4"></i>
                    <p className="text-status-red font-medium mb-4">{error}</p>
                    <button 
                      onClick={fetchHomeData}
                      className="btn-primary"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : properties && properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {properties.map((property) => (
                    <PropertyCard 
                      key={property.id} 
                      property={property} 
                      onClick={() => handleViewProperty(property.id)}
                      isHovered={hoveredProperty === property.id}
                      onMouseEnter={() => setHoveredProperty(property.id)}
                      onMouseLeave={() => setHoveredProperty(null)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-light-gray rounded-2xl p-8 max-w-md mx-auto">
                    <i className="fas fa-home text-gray-400 text-4xl mb-4"></i>
                    <p className="text-gray font-medium mb-4">No properties available at the moment</p>
                    <button 
                      onClick={fetchHomeData}
                      className="btn-primary"
                    >
                      Refresh Properties
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sitters Tab */}
            <div className={`transition-all duration-500 ${activeTab === 'sitters' ? 'opacity-100 visible' : 'opacity-0 invisible absolute top-0 left-0'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
                <div>
                  <h2 className="text-4xl font-bold text-dark mb-3">Top-Rated Sitters</h2>
                  <p className="text-gray text-lg">Verified and highly reviewed professionals</p>
                </div>
                <button 
                  onClick={() => navigate('/sitters')}
                  className="text-primary font-semibold hover:text-primary-hover transition-colors flex items-center gap-3 mt-4 md:mt-0 group"
                >
                  Browse all sitters
                  <i className="fas fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-48 rounded-2xl"></div>
                      <div className="h-4 bg-gray-200 rounded mt-4"></div>
                      <div className="h-4 bg-gray-200 rounded mt-2 w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : sitters && sitters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {sitters.map((sitter) => (
                    <SitterCard 
                      key={sitter.id} 
                      sitter={sitter} 
                      onClick={() => handleViewSitter(sitter.id)}
                      getSafeRating={getSafeRating}
                      isHovered={hoveredSitter === sitter.id}
                      onMouseEnter={() => setHoveredSitter(sitter.id)}
                      onMouseLeave={() => setHoveredSitter(null)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-light-gray rounded-2xl p-8 max-w-md mx-auto">
                    <i className="fas fa-user text-gray-400 text-4xl mb-4"></i>
                    <p className="text-gray font-medium mb-4">No sitters available at the moment</p>
                    <button 
                      onClick={fetchHomeData}
                      className="btn-primary"
                    >
                      Refresh Sitters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-light-gray to-white animate-on-scroll">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-dark mb-4">How House Sitting Works</h2>
            <p className="text-gray text-lg max-w-3xl mx-auto">
              A seamless journey from discovery to peace of mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: 'fas fa-search',
                title: 'Discover & Match',
                description: 'Browse verified profiles, use smart filters, and find perfect matches',
                color: 'primary',
                steps: ['Search properties/sitters', 'Apply filters', 'Save favorites']
              },
              {
                icon: 'fas fa-calendar-check',
                title: 'Connect & Verify',
                description: 'Schedule virtual meetings, verify identities, and discuss details',
                color: 'secondary',
                steps: ['Schedule video call', 'Verify documents', 'Discuss expectations']
              },
              {
                icon: 'fas fa-home',
                title: 'Secure & Relax',
                description: 'Sign digital agreements, make secure payments, and enjoy peace',
                color: 'accent',
                steps: ['Sign agreement', 'Secure payment', 'Receive updates']
              }
            ].map((step, index) => (
              <div 
                key={index} 
                className="text-center group cursor-pointer transform transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative inline-block mb-8">
                  <div className={`w-24 h-24 rounded-2xl bg-${step.color}/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg`}>
                    <i className={`${step.icon} text-3xl text-${step.color} group-hover:rotate-12 transition-transform`}></i>
                  </div>
                  <div className={`absolute -top-2 -right-2 w-10 h-10 rounded-full bg-${step.color} text-white flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform`}>
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-dark mb-4 group-hover:text-primary transition-colors">{step.title}</h3>
                <p className="text-gray leading-relaxed mb-6">{step.description}</p>
                <ul className="text-left text-sm text-gray space-y-2">
                  {step.steps.map((s, i) => (
                    <li key={i} className="flex items-center">
                      <i className={`fas fa-check text-${step.color} mr-2`}></i>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Testimonials Carousel */}
      <section className="py-20 bg-white animate-on-scroll">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-dark mb-4">Trusted by Thousands Worldwide</h2>
            <p className="text-gray text-lg max-w-3xl mx-auto">
              Real stories from our global community of homeowners and sitters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Chen',
                role: 'Homeowner in Singapore',
                avatar: 'SC',
                content: 'Found the perfect sitter for my 3-month trip. Regular updates gave me complete peace of mind.',
                rating: 5,
                date: '2 weeks ago',
                location: 'Singapore'
              },
              {
                name: 'James Wilson',
                role: 'Digital Nomad & Sitter',
                avatar: 'JW',
                content: 'House sitting allowed me to experience local living in 8 countries this year. Amazing community!',
                rating: 5,
                date: '1 month ago',
                location: 'Global'
              },
              {
                name: 'Maria Rodriguez',
                role: 'Homeowner in Spain',
                avatar: 'MR',
                content: 'The verification process gave me confidence. Our sitter took better care of our home than we expected!',
                rating: 5,
                date: '3 weeks ago',
                location: 'Barcelona'
              }
            ].map((testimonial, index) => (
              <div 
                key={index} 
                className="card p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg mr-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-dark group-hover:text-primary transition-colors">{testimonial.name}</h4>
                    <p className="text-gray text-sm">{testimonial.role}</p>
                  </div>
                  <div className="text-xs text-gray bg-light-gray px-2 py-1 rounded">
                    {testimonial.location}
                  </div>
                </div>
                <div className="flex text-accent mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <i key={i} className="fas fa-star group-hover:scale-110 transition-transform"></i>
                  ))}
                </div>
                <p className="text-gray italic mb-4 group-hover:text-dark transition-colors">"{testimonial.content}"</p>
                <div className="text-xs text-gray flex justify-between items-center">
                  <span>{testimonial.date}</span>
                  <button className="text-primary hover:text-primary-hover transition-colors">
                    Read full story →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-white to-secondary/10 animate-on-scroll">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-2xl transform transition-all duration-500 hover:shadow-3xl">
            <h2 className="text-4xl font-bold text-dark mb-6">
              Ready to Experience Trust-Based House Sitting?
            </h2>
            <p className="text-xl text-gray mb-10 max-w-2xl mx-auto">
              Join thousands of homeowners and sitters who trust our platform for secure, flexible arrangements.
            </p>
            
            {/* Interactive Stats */}
            <div className="flex justify-center gap-8 mb-10">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">4.8★</div>
                <div className="text-sm text-gray">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">98%</div>
                <div className="text-sm text-gray">Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-gray">Support</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="btn-primary px-10 py-4 text-lg font-semibold shadow-lg transform transition-all hover:scale-105 active:scale-95"
              >
                <i className="fas fa-user-plus mr-3"></i>
                Sign Up Free
              </button>
              <button
                onClick={() => {
                  // Open demo video modal
                  alert('Demo video would play here');
                }}
                className="bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white px-10 py-4 text-lg font-semibold rounded-full transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-95"
              >
                <i className="fas fa-play-circle mr-3"></i>
                Watch 2-min Demo
              </button>
            </div>
            
            <p className="text-sm text-gray mt-8">
              No credit card required • Free to browse • Verified community
            </p>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/list-property')}
        className="fixed bottom-8 right-8 bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 animate-bounce-slow z-50"
        aria-label="List your property"
      >
        <i className="fas fa-plus text-2xl"></i>
      </button>
    </div>
  );
};

// Interactive Property Card Component
interface PropertyCardProps {
  property: Property;
  onClick: () => void;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onClick, 
  isHovered,
  onMouseEnter,
  onMouseLeave 
}) => {
  const [isSaved, setIsSaved] = useState(false);

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-status-red';
      case 'occupied': return 'bg-status-blue';
      case 'maintenance': return 'bg-status-green';
      default: return 'bg-gray';
    }
  };

  const getBadgeText = (status: string) => {
    switch (status) {
      case 'available': return 'Available Now';
      case 'occupied': return 'Currently Occupied';
      case 'maintenance': return 'Maintenance';
      default: return status;
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <div 
      className="group card overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Image Container with Zoom */}
      <div className="relative h-64 overflow-hidden">
        {property.primary_image ? (
          <img 
            src={property.primary_image} 
            className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
            alt={property.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x256/009639/ffffff?text=Property';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <i className="fas fa-home text-primary text-5xl"></i>
          </div>
        )}
        
        {/* Status Badge */}
        <div className={`absolute top-4 left-4 ${getBadgeColor(property.status)} text-white px-3 py-1.5 rounded-full text-xs font-bold transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
          {getBadgeText(property.status)}
        </div>
        
        {/* Interactive Save Button */}
        <button 
          onClick={handleSaveClick}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-white transition-all duration-300 transform hover:scale-110"
          aria-label={isSaved ? 'Remove from saved' : 'Save property'}
        >
          <i className={`fas fa-heart ${isSaved ? 'text-status-red' : 'text-gray'} transition-colors`}></i>
        </button>
        
        {/* Price Tag Animation */}
        <div className={`absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <div className="text-lg font-bold text-primary">${property.price_per_month}</div>
          <div className="text-xs text-gray">per month</div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h4 className="text-xl font-bold text-dark line-clamp-1 mb-1 group-hover:text-primary transition-colors">{property.title}</h4>
            <div className="flex items-center text-gray">
              <i className="fas fa-map-marker-alt mr-2 text-sm"></i>
              <span className="text-sm">{property.location}, {property.city}</span>
            </div>
          </div>
        </div>
        
        {/* Property Details with Icons */}
        <div className="flex items-center text-gray mb-4">
          <div className="flex items-center mr-6 group">
            <i className="fas fa-bed mr-2 group-hover:text-primary transition-colors"></i>
            <span className="text-sm font-medium">{property.bedrooms} beds</span>
          </div>
          <div className="flex items-center group">
            <i className="fas fa-bath mr-2 group-hover:text-primary transition-colors"></i>
            <span className="text-sm font-medium">{property.bathrooms} baths</span>
          </div>
        </div>
        
        {/* Amenities with Hover Effect */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(property.amenities || []).slice(0, 3).map((amenity) => (
            <span 
              key={amenity} 
              className="bg-light-gray text-dark text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-300 hover:bg-primary hover:text-white"
            >
              {amenity}
            </span>
          ))}
          {(property.amenities || []).length > 3 && (
            <span className="bg-light-gray text-dark text-xs px-3 py-1.5 rounded-full font-medium">
              +{(property.amenities || []).length - 3}
            </span>
          )}
        </div>
        
        {/* Homeowner & Action with Animation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary transition-colors">
              <i className="fas fa-user text-primary group-hover:text-white transition-colors"></i>
            </div>
            <div>
              <div className="text-xs text-gray">Hosted by</div>
              <div className="text-sm font-medium text-dark group-hover:text-primary transition-colors">
                {property.homeowner_name || 'Homeowner'}
              </div>
            </div>
          </div>
          <button className="btn-secondary px-4 py-2 text-sm group-hover:bg-primary group-hover:text-white transition-all duration-300">
            View Details
            <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

// Interactive Sitter Card Component
interface SitterCardProps {
  sitter: Sitter;
  onClick: () => void;
  getSafeRating: (rating: any) => number;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const SitterCard: React.FC<SitterCardProps> = ({ 
  sitter, 
  onClick, 
  getSafeRating,
  isHovered,
  onMouseEnter,
  onMouseLeave 
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <i 
            key={i}
            className={`fas fa-star text-sm ${
              i < fullStars 
                ? 'text-accent' 
                : i === fullStars && hasHalfStar 
                  ? 'fas fa-star-half-alt text-accent'
                  : 'text-gray-300'
            }`}
          ></i>
        ))}
        <span className="ml-2 text-sm font-medium text-dark">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getVerificationBadge = (verified: boolean) => {
    if (verified) {
      return (
        <div className="flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
          <i className="fas fa-shield-check mr-1"></i>
          Verified
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className="card p-6 text-center group cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Avatar with Animation */}
      <div className="relative inline-block mb-4">
        <div className={`w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg transition-all duration-500 ${isHovered ? 'scale-110 ring-4 ring-primary/30' : ''}`}>
          {sitter.avatar ? (
            <img 
              src={sitter.avatar} 
              className="w-full h-full object-cover"
              alt={sitter.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sitter.name)}&background=009639&color=fff`;
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
              {sitter.name.charAt(0)}
            </div>
          )}
        </div>
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute -top-2 -right-2 bg-white p-2 rounded-full shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-110"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <i className={`fas fa-heart ${isFavorite ? 'text-status-red' : 'text-gray'} transition-colors`}></i>
        </button>
        
        {/* Online Status */}
        {sitter.is_online && (
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>
      
      {/* Name and Verification */}
      <div className="mb-2">
        <h4 className="text-lg font-bold text-dark group-hover:text-primary transition-colors line-clamp-1">
          {sitter.name}
        </h4>
        <div className="flex items-center justify-center gap-2 mt-1">
          {getVerificationBadge(sitter.is_verified)}
          {sitter.languages && sitter.languages.length > 0 && (
            <div className="text-xs text-gray bg-light-gray px-2 py-1 rounded">
              {sitter.languages[0]}
            </div>
          )}
        </div>
      </div>
      
      {/* Rating and Reviews */}
      <div className="mb-4">
        {renderStars(getSafeRating(sitter.avg_rating))}
        <div className="text-xs text-gray mt-1">
          {sitter.total_reviews || 0} reviews
        </div>
      </div>
      
      {/* Sitter Details */}
      <div className="space-y-2 mb-6">
        {sitter.experience_years && (
          <div className="flex items-center justify-center text-sm text-gray group-hover:text-dark transition-colors">
            <i className="fas fa-calendar-alt mr-2 text-primary"></i>
            <span>{sitter.experience_years} years experience</span>
          </div>
        )}
        {sitter.location && (
          <div className="flex items-center justify-center text-sm text-gray group-hover:text-dark transition-colors">
            <i className="fas fa-map-marker-alt mr-2 text-secondary"></i>
            <span className="line-clamp-1">{sitter.location}</span>
          </div>
        )}
      </div>
      
      {/* Skills */}
      {sitter.skills && sitter.skills.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {sitter.skills.slice(0, 3).map((skill, index) => (
            <span 
              key={index}
              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium transition-all duration-300 group-hover:bg-primary group-hover:text-white"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
      
      {/* Action Button */}
      <button 
        onClick={onClick}
        className="btn-secondary w-full py-2 text-sm group-hover:bg-primary group-hover:text-white transition-all duration-300 flex items-center justify-center"
      >
        View Profile
        <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
      </button>
    </div>
  );
};

export default Home;