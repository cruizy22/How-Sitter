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
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    navigate(path);
  };

  // Main navigation items (from Home.tsx style)
  const mainNavItems = [
    { label: 'view homes', path: '/properties' },
    { label: 'find sitters', path: '/sitters' },
    { label: 'how it works', path: '/how-it-works' },
    { label: 'community', path: '/community' },
    { label: 'corporate', path: '/corporate' },
  ];

  // Secondary/utility nav items (from original Layout)
  const utilityNavItems = [
    { label: 'Home', path: '/' },
    { label: 'World Map', path: '/world-map' },
    { label: 'FAQ', path: '/faq' },
    ...(user ? [
      { label: 'Dashboard', path: '/dashboard' },
      ...(user.role === 'homeowner' ? [{ label: 'List Property', path: '/list-property' }] : []),
      { label: 'Bookings', path: '/bookings' },
      { label: 'Messages', path: '/messages' },
      ...(user.role === 'admin' ? [{ label: 'Admin', path: '/admin/dashboard' }] : []),
    ] : []),
  ];

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: G.wh, color: G.s900, minHeight: '100vh' }}>

      {/* ══ TOP UTILITY BAR (light, subtle) ══ */}
      <div style={{
        background: G.s100,
        padding: '8px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '13px',
        borderBottom: `1px solid ${G.s200}`,
        color: G.s500,
      }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <span style={{ fontWeight: 600 }}>✦ Trust-Based House Sitting</span>
          <span style={{ fontWeight: 600 }}>🌍 65+ Countries</span>
          <span style={{ fontWeight: 600 }}>⭐ 4.8 Rating</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {/* Utility navigation */}
          {utilityNavItems.slice(0, 4).map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              style={{
                background: 'none',
                border: 'none',
                color: activeSection === item.path ? G.g700 : G.s500,
                fontWeight: activeSection === item.path ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px',
              }}
            >
              {item.label}
            </button>
          ))}
          <span style={{ color: G.s500 }}>|</span>
          {!user ? (
            <>
              <button
                onClick={() => handleNavigation('/login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: G.g700,
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Log In
              </button>
              <button
                onClick={() => handleNavigation('/register')}
                style={{
                  background: G.g700,
                  color: 'white',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Sign Up Free
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: G.s700 }}>
                {user.name} {user.role === 'admin' && '(Admin)'}
              </span>
              <button
                onClick={onLogout}
                style={{
                  background: 'none',
                  border: `1px solid ${G.s500}`,
                  color: G.s700,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══ MAIN NAVIGATION (dark green, sticky) ══ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 300, height: 70,
        background: G.g900,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 40px',
        boxShadow: '0 4px 20px rgba(0,0,0,.2)',
      }}>
        {/* Logo */}
        <div 
          onClick={() => handleNavigation('/')} 
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        >
          <svg width="36" height="36" viewBox="0 0 34 34" fill="none">
            <rect width="34" height="34" rx="9" fill={G.y500}/>
            <path d="M17 7L8 14v13h6v-8h6v8h6V14z" fill={G.g900} strokeWidth="0"/>
          </svg>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 20, letterSpacing: '-.3px' }}>howsitter</span>
        </div>

        {/* Main navigation links (desktop) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {mainNavItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.path)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,.8)',
                padding: '8px 14px',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '7px',
                cursor: 'pointer',
                transition: 'all .15s ease',
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

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleNavigation('/list-property')}
            style={{
              background: 'rgba(255,255,255,.1)',
              border: '1.5px solid rgba(255,255,255,.22)',
              color: '#fff',
              borderRadius: '9px',
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            List my home
          </button>
          <button
            onClick={() => handleNavigation('/register')}
            style={{
              background: G.y500,
              border: 'none',
              color: G.g900,
              borderRadius: '9px',
              padding: '9px 20px',
              fontSize: '13px',
              fontWeight: 900,
              boxShadow: '0 4px 14px rgba(245,166,35,.4)',
              cursor: 'pointer',
            }}
          >
            Sign up free
          </button>
        </div>

        {/* Mobile menu button */}
        <div style={{ display: 'none', alignItems: 'center', gap: '10px' }}>
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
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 114, // 44px (utility) + 70px (nav)
          left: 0,
          right: 0,
          bottom: 0,
          background: G.wh,
          zIndex: 299,
          padding: '20px',
          overflowY: 'auto',
          borderTop: `1px solid ${G.s200}`,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Main nav items in mobile */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: G.s400, textTransform: 'uppercase', marginBottom: '10px' }}>MAIN</div>
              {mainNavItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.path)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: G.s900,
                    borderBottom: `1px solid ${G.s100}`,
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Utility nav items in mobile */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: G.s400, textTransform: 'uppercase', marginBottom: '10px' }}>MORE</div>
              {utilityNavItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: G.s700,
                    borderBottom: `1px solid ${G.s100}`,
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Support link */}
            <a
              href="https://wa.me/6588888888"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                background: G.g100,
                borderRadius: '10px',
                textDecoration: 'none',
                color: G.g700,
                fontWeight: 600,
                marginTop: '20px',
              }}
            >
              <i className="fab fa-whatsapp" style={{ fontSize: '20px' }}></i>
              WhatsApp Support
            </a>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{ flexGrow: 1 }}>{children}</main>

      {/* ══ FOOTER (from Home.tsx style) ══ */}
      <footer style={{ background: '#0A1628', padding: '56px 40px 28px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 1fr 1fr', gap: 48, marginBottom: 44 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <svg width="30" height="30" viewBox="0 0 34 34" fill="none">
                  <rect width="34" height="34" rx="9" fill={G.y500}/>
                  <path d="M17 7L8 14v13h6v-8h6v8h6V14z" fill={G.g900}/>
                </svg>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>howsitter</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, lineHeight: 1.72, maxWidth: 260, marginBottom: 22, fontWeight: 500 }}>
                Connecting verified house sitters with homeowners worldwide. Flexible, secure arrangements with genuine peace of mind.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['🇰🇪','🇬🇧','🇺🇸','🇦🇺','🇸🇬','🇿🇦'].map(f => (
                  <span key={f} style={{ fontSize: 20, cursor: 'pointer', opacity: .6 }}>{f}</span>
                ))}
              </div>
            </div>
            {[
              { head: 'Platform', links: ['Browse Homes', 'Find Sitters', 'List Property', 'How It Works', 'Pricing'] },
              { head: 'Company',  links: ['About Us', 'Careers', 'Press', 'Blog', 'Partners'] },
              { head: 'Legal',    links: ['Privacy Policy', 'Terms of Use', 'Safety', 'Cookie Policy', 'Contact'] },
            ].map(col => (
              <div key={col.head}>
                <div style={{ color: 'rgba(255,255,255,.6)', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 16 }}>{col.head}</div>
                {col.links.map(l => (
                  <button
                    key={l}
                    onClick={() => handleNavigation(`/${l.toLowerCase().replace(' ', '-')}`)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,.35)',
                      fontSize: 13,
                      marginBottom: 10,
                      cursor: 'pointer',
                      fontWeight: 500,
                      display: 'block',
                      padding: 0,
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,.22)', fontSize: 12, fontWeight: 500 }}>© 2025 Howsitter. All rights reserved.</span>
            <span style={{ color: 'rgba(255,255,255,.22)', fontSize: 12, fontWeight: 500 }}>Made with ♥ by the Howsitter team</span>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
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
        }}
      >
        +
      </button>
    </div>
  );
};