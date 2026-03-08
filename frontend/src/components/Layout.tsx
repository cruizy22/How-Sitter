// src/components/Layout.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onNavigate: (section: string) => void;
  user?: any;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeSection, 
  onNavigate,
  user,
  onLogout 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    navigate(path);
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Properties', path: '/properties' },
    { label: 'Sitters', path: '/sitters' },
    // In the navItems array, add:
    { label: 'World Map', path: '/world-map' }, // Add this line
    { label: 'FAQ', path: '/faq' },
    ...(user ? [
      { label: 'Dashboard', path: '/dashboard' },
      ...(user.role === 'homeowner' ? [{ label: 'List Property', path: '/list-property' }] : []),
      { label: 'Bookings', path: '/bookings' },
      { label: 'Messages', path: '/messages' },
      ...(user.role === 'admin' ? [{ label: 'Admin', path: '/admin/dashboard' }] : []),
    ] : []),
  ];

  // Determine if user needs verification
  const needsVerification = user?.role === 'sitter' && !user?.is_verified;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-green-50">
      {/* How Sitter Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-green-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => handleNavigation('/')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg">
                  <i className="fas fa-home text-white"></i>
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900">How Sitter</span>
                  <div className="text-xs text-green-600 -mt-1 font-medium">Trust-Based House Sitting</div>
                </div>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`px-5 py-2.5 text-sm font-medium rounded-full transition-all ${
                    activeSection === item.path 
                      ? item.label === 'Admin' 
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-green-600 text-white shadow-md'
                      : item.label === 'Admin'
                        ? 'text-purple-600 hover:text-purple-800 hover:bg-purple-50 border border-purple-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-green-50'
                  }`}
                >
                  {item.label}
                  {item.label === 'Admin' && (
                    <i className="fas fa-shield-alt ml-2"></i>
                  )}
                </button>
              ))}
              
              {/* Support Link */}
              <a
                href="https://wa.me/6588888888"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 text-sm font-medium text-green-600 hover:text-green-700 rounded-full hover:bg-green-50 transition-colors flex items-center"
              >
                <i className="fab fa-whatsapp mr-2"></i>
                Support
              </a>
            </nav>

            {/* Right Side - Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow ${
                      user.role === 'admin' 
                        ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                        : 'bg-gradient-to-br from-green-500 to-green-600'
                    }`}>
                      <i className="fas fa-user text-white text-sm"></i>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleNavigation('/login')}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => handleNavigation('/register')}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg"
                  >
                    Sign Up Free
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button and WhatsApp */}
            <div className="lg:hidden flex items-center space-x-4">
              <a 
                href="https://wa.me/6588888888"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700"
              >
                <i className="fab fa-whatsapp text-xl"></i>
              </a>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="text-gray-600 hover:text-gray-900"
              >
                <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-green-200 px-4 py-4 shadow-lg">
            <div className="space-y-1">
              {/* Navigation Items */}
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`Block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all flex items-center ${
                    activeSection === item.path 
                      ? item.label === 'Admin'
                        ? 'bg-purple-600 text-white'
                        : 'bg-green-600 text-white'
                      : item.label === 'Admin'
                        ? 'text-purple-600 hover:text-purple-800 hover:bg-purple-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-green-50'
                  }`}
                >
                  {item.label}
                  {item.label === 'Admin' && (
                    <i className="fas fa-shield-alt ml-auto"></i>
                  )}
                </button>
              ))}
              
              {/* Support Link in Mobile */}
              <a
                href="https://wa.me/6588888888"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-green-600 hover:text-green-700 hover:bg-green-50 transition-all"
              >
                <i className="fab fa-whatsapp mr-2"></i>
                WhatsApp Support
              </a>
            </div>

            {/* Mobile Auth Section */}
            <div className="pt-6 mt-6 border-t border-gray-200 space-y-3">
              {user ? (
                <>
                  <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow ${
                      user.role === 'admin'
                        ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                        : 'bg-gradient-to-br from-green-500 to-green-600'
                    }`}>
                      <i className="fas fa-user text-white"></i>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {user.role === 'admin' ? 'Administrator' : 
                         user.role === 'sitter' ? 'House Sitter' : 'Homeowner'}
                      </p>
                    </div>
                  </div>
                 
                  <button 
                    onClick={() => {
                      if (onLogout) onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-3 text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleNavigation('/login')}
                    className="w-full text-center py-3 text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => handleNavigation('/register')}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 shadow-md transition-all"
                  >
                    Sign Up Free
                  </button>
                </>
              )}
              
              {/* Global Network Link */}
              <a
                href="https://chat.whatsapp.com/how-sitter-global"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <i className="fab fa-whatsapp mr-2"></i>
                Join Global Network
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                  <i className="fas fa-home text-white"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">How Sitter</h3>
                  <p className="text-green-300 text-sm font-medium">Trust-Based House Sitting</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Connecting verified house sitters with homeowners worldwide. 
                Trust-based arrangements starting at 1 month minimum.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-6 text-lg">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => handleNavigation('/')} className="text-gray-300 hover:text-white transition-colors text-sm">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('/properties')} className="text-gray-300 hover:text-white transition-colors text-sm">
                    Browse Properties
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('/sitters')} className="text-gray-300 hover:text-white transition-colors text-sm">
                    Find Sitters
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('/faq')} className="text-gray-300 hover:text-white transition-colors text-sm">
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-6 text-lg">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => handleNavigation('/legal')} className="text-gray-300 hover:text-white transition-colors text-sm">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('/legal')} className="text-gray-300 hover:text-white transition-colors text-sm">
                    Privacy Policy
                  </button>
                </li>
                <li className="text-gray-400 text-sm">5-Day Notice Policy</li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="font-semibold text-white mb-6 text-lg">Connect</h4>
              <ul className="space-y-3">
                <li>
                  <a href="https://wa.me/6588888888" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center">
                    <i className="fab fa-whatsapp mr-2 text-green-400"></i>
                    WhatsApp Support
                  </a>
                </li>
                <li>
                  <a href="https://chat.whatsapp.com/how-sitter-global" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center">
                    <i className="fab fa-whatsapp mr-2 text-blue-400"></i>
                    Global Network
                  </a>
                </li>
                <li>
                  <a href="mailto:support@howsitter.com" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center">
                    <i className="fas fa-envelope mr-2 text-green-400"></i>
                    Email Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="mt-16 pt-8 border-t border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-400 text-sm">
                  © 2025 How Sitter. All rights reserved.
                </p>
              </div>
              <div className="flex items-center space-x-6">
                {!user ? (
                  <>
                    <button 
                      onClick={() => handleNavigation('/login')}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      Log In
                    </button>
                    <button 
                      onClick={() => handleNavigation('/register')}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={onLogout}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <a
          href="https://chat.whatsapp.com/how-sitter-global"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110"
          title="Join Global Network"
        >
          <i className="fab fa-whatsapp text-2xl"></i>
        </a>
        <a
          href="https://wa.me/6588888888"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 animate-bounce-slow"
          title="Customer Service"
        >
          <i className="fab fa-whatsapp text-2xl"></i>
        </a>
      </div>
    </div>
  );
};