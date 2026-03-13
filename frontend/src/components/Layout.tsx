// src/components/Layout.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMobile } from '../hooks/useMobile';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onNavigate: (section: string) => void;
  user?: any;
  onLogout?: () => void;
}

// Color tokens from Home.tsx
const G = {
  g900: '#0D3D24',  // deepest green (nav bg)
  g800: '#1A5C38',  // dark green
  g700: '#1E6B45',  // primary green
  g600: '#237A4E',  // mid green
  g100: '#EBF5EE',  // light green bg
  g50:  '#F4FAF6',  // very light green
  y500: '#F5A623',  // amber yellow (accent CTA)
  y100: '#FEF3DC',  // light yellow
  s900: '#111827',  // near black
  s800: '#1F2937',
  s700: '#374151',
  s500: '#6B7280',
  s400: '#9CA3AF',
  s200: '#E5E7EB',
  s100: '#F9FAFB',
  wh:   '#FFFFFF',
};

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeSection, 
  onNavigate,
  user,
  onLogout 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMobile, isTablet } = useMobile();
  const navigate = useNavigate();

  // Responsive values
  const navPadding = isMobile ? '0 16px' : '0 40px';

  // Handle window resize to close mobile menu on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleNavigation = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setMobileMenuOpen(false);
    navigate('/');
  };

  // Main navigation items
  const mainNavItems = [
    { label: 'view homes', path: '/properties' },
    { label: 'find sitters', path: '/sitters' },
    { label: 'how it works', path: '/how-it-works' },
    { label: 'community', path: '/community' },
    { label: 'corporate', path: '/corporate' },
  ];

  // Secondary/utility nav items
  const utilityNavItems = [
    ...(user ? [
      { label: 'Dashboard', path: '/dashboard' },
      ...(user.role === 'homeowner' ? [{ label: 'List Property', path: '/list-property' }] : []),
      { label: 'Bookings', path: '/bookings' },
      { label: 'Messages', path: '/messages' },
      ...(user.role === 'admin' ? [{ label: 'Admin', path: '/admin/dashboard' }] : []),
    ] : []),
  ];

  return (
    <div style={{ 
      fontFamily: "'Nunito', sans-serif", 
      background: G.wh, 
      color: G.s900, 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden'
    }}>
      {/* ══ MAIN NAVIGATION (dark green, sticky) ══ */}
      <nav style={{
        position: 'sticky', 
        top: 0, 
        zIndex: 300, 
        height: isMobile ? 60 : 70,
        background: G.g900,
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between', 
        padding: navPadding,
        boxShadow: '0 4px 20px rgba(0,0,0,.2)',
      }}>
        {/* Logo */}
        <div 
          onClick={() => handleNavigation('/')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isMobile ? 8 : 12, 
            cursor: 'pointer' 
          }}
        >
          <svg width={isMobile ? 30 : 36} height={isMobile ? 30 : 36} viewBox="0 0 34 34" fill="none">
            <rect width="34" height="34" rx="9" fill={G.y500}/>
            <path d="M17 7L8 14v13h6v-8h6v8h6V14z" fill={G.g900} strokeWidth="0"/>
          </svg>
          <span style={{ 
            color: '#fff', 
            fontWeight: 800, 
            fontSize: isMobile ? 18 : 20, 
            letterSpacing: '-.3px' 
          }}>
            {isMobile ? 'HS' : 'howsitter'}
          </span>
        </div>

        {/* Main navigation links - hide on mobile */}
        {!isMobile && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isTablet ? '2px' : '4px' 
          }}>
            {mainNavItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,.8)',
                  padding: isTablet ? '6px 10px' : '8px 14px',
                  fontSize: isTablet ? '13px' : '14px',
                  fontWeight: 600,
                  borderRadius: '7px',
                  cursor: 'pointer',
                  transition: 'all .15s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,.1)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = 'rgba(255,255,255,.8)';
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* CTA Buttons - show fewer on tablet, hide on mobile (will be in mobile menu) */}
        {!isMobile ? (
          <div style={{ display: 'flex', gap: isTablet ? '8px' : '10px' }}>
            <button
              onClick={() => handleNavigation('/list-property')}
              style={{
                background: 'rgba(255,255,255,.1)',
                border: '1.5px solid rgba(255,255,255,.22)',
                color: '#fff',
                borderRadius: '9px',
                padding: isTablet ? '7px 14px' : '9px 18px',
                fontSize: isTablet ? '12px' : '13px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {isTablet ? 'List' : 'List my home'}
            </button>
            <button
              onClick={() => handleNavigation('/register')}
              style={{
                background: G.y500,
                border: 'none',
                color: G.g900,
                borderRadius: '9px',
                padding: isTablet ? '7px 16px' : '9px 20px',
                fontSize: isTablet ? '12px' : '13px',
                fontWeight: 900,
                boxShadow: '0 4px 14px rgba(245,166,35,.4)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {isTablet ? 'Sign up' : 'Sign up free'}
            </button>
          </div>
        ) : (
          /* Mobile user indicator */
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user && (
              <span style={{ color: '#fff', fontSize: '14px' }}>
                {user.name.split(' ')[0]}
              </span>
            )}
          </div>
        )}

        {/* Mobile menu button - visible only on mobile */}
        <div style={{ 
          display: isMobile ? 'flex' : 'none', 
          alignItems: 'center', 
          gap: '10px' 
        }}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'rgba(255,255,255,.1)',
              border: 'none',
              color: '#fff',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 298,
              animation: 'fadeIn 0.3s ease'
            }}
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu content */}
          <div style={{
            position: 'fixed',
            top: 60, // Height of nav bar
            left: 0,
            right: 0,
            bottom: 0,
            background: G.wh,
            zIndex: 299,
            padding: '20px',
            overflowY: 'auto',
            borderTop: `1px solid ${G.s200}`,
            animation: 'slideDown 0.3s ease'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* User info if logged in */}
              {user && (
                <div style={{
                  padding: '16px',
                  background: G.g100,
                  borderRadius: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: G.g700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '20px'
                    }}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: G.g900 }}>{user.name}</div>
                      <div style={{ fontSize: '13px', color: G.s500 }}>{user.role}</div>
                    </div>
                  </div>
                  {user.role === 'sitter' && (
                    <div style={{
                      marginTop: '12px',
                      padding: '8px',
                      background: G.y100,
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: G.g800
                    }}>
                      ✓ Verified Sitter
                    </div>
                  )}
                </div>
              )}
              
              {/* Main nav items */}
              <div>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: 700, 
                  color: G.s400, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  marginBottom: '8px',
                  paddingLeft: '8px'
                }}>
                  MAIN MENU
                </div>
                {mainNavItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavigation(item.path)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '14px 16px',
                      background: activeSection === item.path ? G.g100 : 'none',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '16px',
                      fontWeight: activeSection === item.path ? 700 : 600,
                      color: activeSection === item.path ? G.g700 : G.s900,
                      borderBottom: `1px solid ${G.s100}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>
                      {item.label === 'view homes' && '🏠'}
                      {item.label === 'find sitters' && '👤'}
                      {item.label === 'how it works' && '📋'}
                      {item.label === 'community' && '👥'}
                      {item.label === 'corporate' && '🏢'}
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Utility nav items - only shown when user is logged in */}
              {user && utilityNavItems.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: 700, 
                    color: G.s400, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                    paddingLeft: '8px'
                  }}>
                    YOUR ACCOUNT
                  </div>
                  {utilityNavItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '14px 16px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: G.s700,
                        borderBottom: `1px solid ${G.s100}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <span style={{ fontSize: '16px', opacity: 0.7 }}>
                        {item.label === 'Dashboard' && '📊'}
                        {item.label === 'List Property' && '📝'}
                        {item.label === 'Bookings' && '📅'}
                        {item.label === 'Messages' && '💬'}
                        {item.label === 'Admin' && '⚙️'}
                      </span>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Auth buttons for non-logged in users */}
              {!user && (
                <div style={{ 
                  marginTop: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <button
                    onClick={() => handleNavigation('/login')}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: `2px solid ${G.g700}`,
                      color: G.g700,
                      padding: '14px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '16px',
                      cursor: 'pointer'
                    }}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => handleNavigation('/register')}
                    style={{
                      width: '100%',
                      background: G.g700,
                      border: 'none',
                      color: '#fff',
                      padding: '14px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '16px',
                      cursor: 'pointer'
                    }}
                  >
                    Sign Up Free
                  </button>
                </div>
              )}

              {/* Logout button for logged in users */}
              {user && (
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    marginTop: '24px',
                    background: 'none',
                    border: `2px solid ${G.s400}`,
                    color: G.s700,
                    padding: '14px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>🚪</span>
                  Logout
                </button>
              )}

              {/* WhatsApp Support */}
              <a
                href="https://wa.me/6588888888"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '16px',
                  background: G.g100,
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: G.g700,
                  fontWeight: 700,
                  marginTop: '24px',
                  border: `1px solid ${G.g100}`
                }}
              >
                <i className="fab fa-whatsapp" style={{ fontSize: '22px' }}></i>
                WhatsApp Support
              </a>

              {/* App version */}
              <div style={{
                textAlign: 'center',
                marginTop: '32px',
                fontSize: '11px',
                color: G.s400
              }}>
                Version 1.0.0
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main style={{ 
        flexGrow: 1,
        width: '100%',
        paddingBottom: isMobile ? '20px' : 0
      }}>
        {children}
      </main>

      {/* ══ FOOTER - COMPLETELY REMOVED ══ */}
      {/* No footer content */}

      {/* Floating Action Button - hide on mobile (use bottom nav) */}
      {!isMobile && (
        <button
          onClick={() => handleNavigation('/list-property')}
          style={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: G.g700,
            color: '#fff',
            border: 'none',
            fontSize: 22,
            boxShadow: '0 6px 20px rgba(30,107,69,.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          +
        </button>
      )}

      {/* Add animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};