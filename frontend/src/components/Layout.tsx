// src/components/Layout.tsx - UPDATED PROPS
import React, { useState } from 'react';

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

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Properties', path: '/properties' },
    { label: 'Sitters', path: '/sitters' },
    ...(user ? [
      { label: 'Dashboard', path: '/dashboard' },
      ...(user.role === 'homeowner' ? [{ label: 'List Property', path: '/list-property' }] : []),
      { label: 'Bookings', path: '/bookings' },
      { label: 'Messages', path: '/messages' },
    ] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => onNavigate('/')}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <i className="fas fa-home text-white"></i>
                </div>
                <div>
                  <span className="text-2xl font-bold text-dark">How Sitter</span>
                  <div className="text-xs text-gray -mt-1">Trust-Based House Sitting</div>
                </div>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`px-5 py-2.5 text-sm font-medium rounded-full transition-colors ${
                    activeSection === item.path 
                      ? 'bg-primary text-white' 
                      : 'text-gray hover:text-dark hover:bg-light-gray'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right Side - Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <i className="fas fa-user text-primary"></i>
                    </div>
                    <span className="text-sm font-medium text-dark">{user.name}</span>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="text-sm font-medium text-gray hover:text-dark"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => onNavigate('/login')}
                    className="text-sm font-medium text-gray hover:text-dark"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => onNavigate('/register')}
                    className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-hover transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-4">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="text-gray hover:text-dark"
              >
                <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-border px-4 py-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    onNavigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    activeSection === item.path 
                      ? 'bg-primary text-white' 
                      : 'text-gray hover:text-dark hover:bg-light-gray'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="pt-6 mt-6 border-t border-border space-y-3">
              {user ? (
                <>
                  <div className="flex items-center px-4 py-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <i className="fas fa-user text-primary"></i>
                    </div>
                    <div>
                      <p className="font-medium text-dark">{user.name}</p>
                      <p className="text-sm text-gray">{user.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (onLogout) onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-3 text-gray font-medium hover:text-dark"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      onNavigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-3 text-gray font-medium hover:text-dark"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => {
                      onNavigate('/register');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-hover"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-dark text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Logo & Description */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <i className="fas fa-home text-primary"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">How Sitter</h3>
                  <p className="text-gray-400 text-sm">Global Trust-Based House Sitting</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Connecting homeowners with verified house sitters worldwide. Secure, trusted arrangements for peace of mind while you're away.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-semibold text-white mb-6 text-lg">Platform</h4>
              <ul className="space-y-3">
                <li><button onClick={() => onNavigate('/')} className="text-gray-400 hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => onNavigate('/sitters')} className="text-gray-400 hover:text-white transition-colors">Global Sitters</button></li>
                <li><button onClick={() => onNavigate('/list-property')} className="text-gray-400 hover:text-white transition-colors">List Property</button></li>
                <li><button onClick={() => onNavigate('/faq')} className="text-gray-400 hover:text-white transition-colors">FAQ</button></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-white mb-6 text-lg">Support</h4>
              <ul className="space-y-3">
                <li><button onClick={() => onNavigate('/faq')} className="text-gray-400 hover:text-white transition-colors">FAQ</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Safety Guidelines</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Contact Us</button></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-6 text-lg">Legal</h4>
              <ul className="space-y-3">
                <li><button onClick={() => onNavigate('/legal')} className="text-gray-400 hover:text-white transition-colors">Legal Agreements</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Terms of Service</button></li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 How Sitter. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <span className="text-gray-400 text-sm">
                  Made with <i className="fas fa-heart text-red-400 mx-1"></i> in Singapore
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/6588888888"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform z-50"
      >
        <i className="fab fa-whatsapp text-2xl"></i>
      </a>
    </div>
  );
};