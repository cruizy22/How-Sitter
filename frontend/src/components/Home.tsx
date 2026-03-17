/*
 * HowSitter — Home Page
 * Fully responsive with mobile-first design
 * Font: Nunito via Google Fonts
 * Palette: Forest Green #1E6B45 · Amber #F5A623 · Slate grays
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, Property, Sitter } from '../services/api';
import { WorldMap } from './WorldMap';
import { useMobile } from '../hooks/useMobile';

/* ─── inject Nunito once ─── */
(() => {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('hs-font')) {
    const l = document.createElement('link');
    l.id = 'hs-font';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap';
    document.head.appendChild(l);
  }
})();

/* ─── tokens ─── */
const G = {
  g900: '#0D3D24',
  g800: '#1A5C38',
  g700: '#1E6B45',
  g600: '#237A4E',
  g100: '#EBF5EE',
  g50: '#F4FAF6',
  y500: '#F5A623',
  y100: '#FEF3DC',
  s900: '#111827',
  s800: '#1F2937',
  s700: '#374151',
  s500: '#6B7280',
  s400: '#9CA3AF',
  s200: '#E5E7EB',
  s100: '#F9FAFB',
  wh: '#FFFFFF',
  f: "'Nunito', sans-serif'",
};

/* ─── curated Unsplash images ─── */
const IMGS = {
  hero: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=85',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=85',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1600&q=85',
  ],
  properties: [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800&q=80',
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80',
    'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80',
  ],
  lifestyle: [
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=80',
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=900&q=80',
  ],
};

/* ─── useInView hook ─── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    const ob = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          ob.disconnect();
        }
      },
      { threshold, rootMargin: '50px' }
    );
    
    ob.observe(el);
    return () => ob.disconnect();
  }, [threshold]);
  
  return { ref, vis };
}

/* ─── helpers ─── */
const pill = (bg: string, col: string, x: React.CSSProperties = {}): React.CSSProperties => ({
  background: bg,
  color: col,
  borderRadius: 999,
  padding: '4px 12px',
  fontSize: 'clamp(10px, 2.5vw, 12px)',
  fontWeight: 700,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  whiteSpace: 'nowrap',
  letterSpacing: '.02em',
  ...x,
});

type Stats = { 
  properties: number; 
  sitters: number; 
  countries: number; 
  stays: number;
};

/* ══ Mobile PropertyThumb ══ */
const PropertyThumbMobile: React.FC<{ p: Property; idx: number; nav: any }> = ({ p, idx, nav }) => {
  const src = p.primary_image || IMGS.properties[idx % IMGS.properties.length];
  
  return (
    <div
      onClick={() => nav(`/properties/${p.id}`)}
      style={{
        borderRadius: 18,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,.12)',
        height: 200,
        marginBottom: 8
      }}
    >
      <img
        src={src}
        alt={p.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={e => {
          (e.target as HTMLImageElement).src = IMGS.properties[idx % IMGS.properties.length];
        }}
      />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,.62) 0%, transparent 55%)'
      }} />
      <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, marginBottom: 5 }}>
          {p.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {p.city && (
            <span style={{ ...pill('rgba(255,255,255,.18)', '#fff', { fontSize: 11 }) }}>
              📍 {p.city}
            </span>
          )}
          {p.status === 'available' && (
            <span style={{ ...pill('rgba(46,213,115,.25)', '#86EFAC', { fontSize: 11 }) }}>
              ● available
            </span>
          )}
          <span style={{ ...pill('rgba(245,166,35,.25)', G.y500, { fontSize: 11 }) }}>
            ${p.price_per_month.toLocaleString()}/mo
          </span>
        </div>
      </div>
    </div>
  );
};

/* ══ PropertyThumb — for the masonry grid ══ */
const PropertyThumb: React.FC<{ p: Property | undefined; idx: number; nav: any; style: React.CSSProperties }> = ({
  p,
  idx,
  nav,
  style
}) => {
  const src = p?.primary_image || IMGS.properties[idx % IMGS.properties.length];
  
  return (
    <div
      className="hs-card"
      onClick={() => p && nav(`/properties/${p.id}`)}
      style={{
        borderRadius: 18,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,.12)',
        cursor: 'pointer',
        transition: 'transform .22s ease, box-shadow .22s ease',
        ...style
      }}
    >
      <img
        src={src}
        alt={p?.title || 'Property'}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={e => {
          (e.target as HTMLImageElement).src = IMGS.properties[idx % IMGS.properties.length];
        }}
      />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,.62) 0%, transparent 55%)'
      }} />
      <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, marginBottom: 5 }}>
          {p?.title || `Property ${idx + 1}`}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {p?.city && (
            <span style={{ ...pill('rgba(255,255,255,.18)', '#fff', { fontSize: 11, backdropFilter: 'blur(4px)' }) }}>
              📍 {p.city}
            </span>
          )}
          {p?.status === 'available' && (
            <span style={{ ...pill('rgba(46,213,115,.25)', '#86EFAC', { fontSize: 11 }) }}>
              ● available
            </span>
          )}
          {p?.price_per_month && (
            <span style={{ ...pill('rgba(245,166,35,.25)', G.y500, { fontSize: 11 }) }}>
              ${p.price_per_month.toLocaleString()}/mo
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══ Mobile PropertyCard ══ */
const PropertyCardMobile: React.FC<{ p: Property; i: number; nav: any; stayMode: string; isMobile: boolean }> = ({
  p,
  i,
  nav,
  stayMode,
  isMobile
}) => {
  const [saved, setSaved] = useState(false);
  const price = stayMode === 'Nightly' ? Math.round(p.price_per_month / 30) : p.price_per_month;
  const src = p.primary_image || IMGS.properties[i % IMGS.properties.length];

  return (
    <div
      onClick={() => nav(`/properties/${p.id}`)}
      style={{
        background: G.wh,
        borderRadius: 18,
        border: `1.5px solid ${G.s200}`,
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,.06)',
        cursor: 'pointer',
        marginBottom: 16
      }}
    >
      <div style={{ position: 'relative', height: isMobile ? 180 : 210, overflow: 'hidden' }}>
        <img
          src={src}
          alt={p.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => {
            (e.target as HTMLImageElement).src = IMGS.properties[i % IMGS.properties.length];
          }}
        />
        <div style={{
          ...pill(p.price_per_month > 2000 ? '#7C3AED' : p.price_per_month > 1400 ? G.g700 : G.s500, '#fff'),
          position: 'absolute',
          top: 12,
          left: 12
        }}>
          {p.price_per_month > 2000 ? 'premium' : p.price_per_month > 1400 ? 'standard' : 'basic'}
        </div>
        <button
          onClick={e => {
            e.stopPropagation();
            setSaved(!saved);
          }}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(255,255,255,.88)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          {saved ? '❤️' : '🤍'}
        </button>
      </div>

      <div style={{ padding: isMobile ? '14px 16px' : '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <h3 style={{
            fontSize: isMobile ? 15 : 16,
            fontWeight: 800,
            color: G.g900,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {p.title}
          </h3>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
            <div style={{ fontSize: isMobile ? 17 : 19, fontWeight: 900, color: G.g900 }}>
              ${price.toLocaleString()}
            </div>
          </div>
        </div>
        <div style={{ fontSize: isMobile ? 12 : 13, color: G.s400, marginBottom: 10, fontWeight: 500 }}>
          {p.bedrooms}bd · {p.bathrooms}ba · {p.city}
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {(p.amenities || ['WiFi', 'Furnished', 'Pets OK']).slice(0, isMobile ? 2 : 3).map(a => (
            <span key={a} style={{
              fontSize: isMobile ? 10 : 11,
              color: G.s500,
              background: G.s100,
              border: `1px solid ${G.s200}`,
              borderRadius: 6,
              padding: '3px 9px',
              fontWeight: 600
            }}>
              {a}
            </span>
          ))}
        </div>
        <button
          onClick={e => {
            e.stopPropagation();
            nav(`/properties/${p.id}`);
          }}
          style={{
            width: '100%',
            background: G.g900,
            color: '#fff',
            border: 'none',
            borderRadius: 9,
            padding: isMobile ? '10px' : '8px 18px',
            fontSize: isMobile ? 13 : 12,
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

/* ══ PropertyCard — horizontal listing card ══ */
const PropertyCard: React.FC<{ p: Property; i: number; nav: any; stayMode: string }> = ({ p, i, nav, stayMode }) => {
  const [saved, setSaved] = useState(false);
  const [imgI, setImgI] = useState(0);
  const allImgs = p.primary_image
    ? [p.primary_image, ...IMGS.properties.slice(0, 3)]
    : IMGS.properties.slice(i % 8, i % 8 + 4);
  const price = stayMode === 'Nightly' ? Math.round(p.price_per_month / 30) : p.price_per_month;
  const orig = Math.round(price * 1.08);

  return (
    <div
      className="hs-card"
      style={{
        background: G.wh,
        borderRadius: 18,
        border: `1.5px solid ${G.s200}`,
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,.06)',
        cursor: 'pointer'
      }}
      onClick={() => nav(`/properties/${p.id}`)}
    >
      {/* image + thumbs */}
      <div style={{ position: 'relative', height: 210, overflow: 'hidden' }}>
        <img
          src={allImgs[imgI]}
          alt={p.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => {
            (e.target as HTMLImageElement).src = IMGS.properties[i % IMGS.properties.length];
          }}
        />
        {/* tier badge */}
        <div style={{
          ...pill(p.price_per_month > 2000 ? '#7C3AED' : p.price_per_month > 1400 ? G.g700 : G.s500, '#fff'),
          position: 'absolute',
          top: 12,
          left: 12
        }}>
          {p.price_per_month > 2000 ? 'premium' : p.price_per_month > 1400 ? 'standard' : 'basic'}
        </div>
        {/* save btn */}
        <button
          onClick={e => {
            e.stopPropagation();
            setSaved(!saved);
          }}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(255,255,255,.88)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          {saved ? '❤️' : '🤍'}
        </button>
        {/* thumb strip */}
        <div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 4 }}>
          {allImgs.slice(0, 4).map((src, j) => (
            <div
              key={j}
              onClick={e => {
                e.stopPropagation();
                setImgI(j);
              }}
              style={{
                width: 34,
                height: 25,
                borderRadius: 5,
                overflow: 'hidden',
                border: imgI === j ? '2px solid #fff' : '1.5px solid rgba(255,255,255,.4)',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <img
                src={src}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => {
                  (e.target as HTMLImageElement).src = IMGS.properties[j % IMGS.properties.length];
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* content */}
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 800,
            color: G.g900,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {p.title}
          </h3>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
            <div style={{ fontSize: 19, fontWeight: 900, color: G.g900 }}>${price.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: G.s400, textDecoration: 'line-through' }}>${orig.toLocaleString()}</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: G.s400, marginBottom: 10, fontWeight: 500 }}>
          {p.bedrooms}bd · {p.bathrooms}ba · {p.city}
        </div>
        <div style={{ display: 'flex', gap: 7, marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{ ...pill(G.g100, G.g700, { fontSize: 11 }) }}>📍 {p.location || p.city}</span>
          {p.status === 'available' && (
            <span style={{ ...pill('#DCFCE7', '#166534', { fontSize: 11 }) }}>● available</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {(p.amenities || ['WiFi', 'Furnished', 'Pets OK']).slice(0, 3).map(a => (
            <span key={a} style={{
              fontSize: 11,
              color: G.s500,
              background: G.s100,
              border: `1px solid ${G.s200}`,
              borderRadius: 6,
              padding: '3px 9px',
              fontWeight: 600
            }}>
              {a}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: `1px solid ${G.s200}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: G.g100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 800,
              color: G.g700
            }}>
              {(p.homeowner_name || 'H')[0]}
            </div>
            <div>
              <div style={{ fontSize: 10, color: G.s400, fontWeight: 600 }}>Hosted by</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: G.g900 }}>{p.homeowner_name || 'Homeowner'}</div>
            </div>
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              nav(`/properties/${p.id}`);
            }}
            style={{
              background: G.g900,
              color: '#fff',
              border: 'none',
              borderRadius: 9,
              padding: '8px 18px',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            View →
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══ Mobile SitterCard ══ */
const SitterCardMobile: React.FC<{ s: Sitter; nav: any; safeRating: (r: any) => number; isMobile: boolean }> = ({
  s,
  nav,
  safeRating,
  isMobile
}) => {
  const [saved, setSaved] = useState(false);
  const rating = safeRating(s.avg_rating);

  return (
    <div
      onClick={() => nav(`/sitters/${s.id}`)}
      style={{
        background: G.wh,
        borderRadius: 18,
        border: `1.5px solid ${G.s200}`,
        padding: isMobile ? 16 : 24,
        position: 'relative',
        boxShadow: '0 2px 10px rgba(0,0,0,.05)',
        cursor: 'pointer',
        marginBottom: 16
      }}
    >
      <button
        onClick={e => {
          e.stopPropagation();
          setSaved(!saved);
        }}
        style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' }}
      >
        {saved ? '❤️' : '🤍'}
      </button>

      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: isMobile ? 48 : 56,
            height: isMobile ? 48 : 56,
            borderRadius: '50%',
            overflow: 'hidden',
            border: `2.5px solid ${G.s200}`
          }}>
            {s.avatar ? (
              <img
                src={s.avatar}
                alt={s.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=1E6B45&color=fff`;
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                background: `linear-gradient(135deg,${G.g700},${G.g800})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 900,
                fontSize: isMobile ? 18 : 22
              }}>
                {s.name[0]}
              </div>
            )}
          </div>
          {s.is_online && (
            <div style={{
              position: 'absolute',
              bottom: 1,
              right: 1,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#10B981',
              border: '2px solid #fff'
            }} />
          )}
        </div>

        <div style={{ paddingTop: 2 }}>
          <div style={{ fontWeight: 800, color: G.g900, fontSize: isMobile ? 14 : 15 }}>{s.name}</div>
          {s.is_verified && (
            <span style={{ ...pill(G.g100, G.g700, { fontSize: isMobile ? 10 : 11, padding: '2px 9px', marginTop: 4, display: 'inline-flex' }) }}>
              ✓ Verified
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
        {[1, 2, 3, 4, 5].map(j => (
          <span key={j} style={{ color: j <= Math.floor(rating) ? G.y500 : G.s200, fontSize: isMobile ? 12 : 13 }}>★</span>
        ))}
        <span style={{ fontSize: isMobile ? 12 : 13, fontWeight: 800, color: G.g900 }}>{rating.toFixed(1)}</span>
        <span style={{ fontSize: isMobile ? 10 : 12, color: G.s400, fontWeight: 500 }}>({s.total_reviews || 0})</span>
      </div>

      {s.location && (
        <div style={{ fontSize: isMobile ? 11 : 12, color: G.s500, marginBottom: 12, fontWeight: 500 }}>
          📍 {s.location}
        </div>
      )}

      <button
        style={{
          width: '100%',
          padding: isMobile ? 12 : 10,
          background: G.g900,
          color: '#fff',
          border: 'none',
          borderRadius: 9,
          fontSize: isMobile ? 13 : 13,
          fontWeight: 800,
          cursor: 'pointer'
        }}
      >
        View profile →
      </button>
    </div>
  );
};

/* ══ SitterCard ══ */
const SitterCard: React.FC<{ s: Sitter; nav: any; safeRating: (r: any) => number }> = ({ s, nav, safeRating }) => {
  const [saved, setSaved] = useState(false);
  const rating = safeRating(s.avg_rating);
  
  return (
    <div
      className="hs-card"
      onClick={() => nav(`/sitters/${s.id}`)}
      style={{
        background: G.wh,
        borderRadius: 18,
        border: `1.5px solid ${G.s200}`,
        padding: 24,
        position: 'relative',
        boxShadow: '0 2px 10px rgba(0,0,0,.05)',
        cursor: 'pointer'
      }}
    >
      <button
        onClick={e => {
          e.stopPropagation();
          setSaved(!saved);
        }}
        style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' }}
      >
        {saved ? '❤️' : '🤍'}
      </button>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', border: `2.5px solid ${G.s200}` }}>
            {s.avatar ? (
              <img
                src={s.avatar}
                alt={s.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=1E6B45&color=fff`;
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                background: `linear-gradient(135deg,${G.g700},${G.g800})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 900,
                fontSize: 22
              }}>
                {s.name[0]}
              </div>
            )}
          </div>
          {s.is_online && (
            <div style={{
              position: 'absolute',
              bottom: 1,
              right: 1,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#10B981',
              border: '2px solid #fff'
            }} />
          )}
        </div>
        <div style={{ paddingTop: 2 }}>
          <div style={{ fontWeight: 800, color: G.g900, fontSize: 15 }}>{s.name}</div>
          {s.is_verified && (
            <span style={{ ...pill(G.g100, G.g700, { fontSize: 11, padding: '2px 9px', marginTop: 4, display: 'inline-flex' }) }}>
              ✓ Verified
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
        {[1, 2, 3, 4, 5].map(j => (
          <span key={j} style={{ color: j <= Math.floor(rating) ? G.y500 : G.s200, fontSize: 13 }}>★</span>
        ))}
        <span style={{ fontSize: 13, fontWeight: 800, color: G.g900 }}>{rating.toFixed(1)}</span>
        <span style={{ fontSize: 12, color: G.s400, fontWeight: 500 }}>({s.total_reviews || 0})</span>
      </div>
      {s.experience_years && (
        <div style={{ fontSize: 12, color: G.s500, marginBottom: 3, fontWeight: 500 }}>
          📅 {s.experience_years} yrs experience
        </div>
      )}
      {s.location && (
        <div style={{ fontSize: 12, color: G.s500, marginBottom: 12, fontWeight: 500 }}>
          📍 {s.location}
        </div>
      )}
      {s.skills && s.skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
          {s.skills.slice(0, 3).map((sk, i) => (
            <span key={i} style={{
              fontSize: 11,
              background: G.s100,
              color: G.s700,
              borderRadius: 5,
              padding: '3px 8px',
              fontWeight: 600
            }}>
              {sk}
            </span>
          ))}
        </div>
      )}
      <button style={{
        width: '100%',
        padding: 10,
        background: G.g900,
        color: '#fff',
        border: 'none',
        borderRadius: 9,
        fontSize: 13,
        fontWeight: 800,
        cursor: 'pointer'
      }}>
        View profile →
      </button>
    </div>
  );
};

/* ══ StatsBar with responsive design ══ */
const StatsBar: React.FC<{ stats: Stats | null; isMobile: boolean }> = ({ stats, isMobile }) => {
  const { ref, vis } = useInView();

  return (
    <section ref={ref} style={{ background: G.g900, padding: isMobile ? '24px 12px' : '44px 40px' }}>
      <div style={{
        maxWidth: 1180,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? 12 : 0,
        textAlign: 'center'
      }}>
        {(stats ? [
          { v: `${stats.properties.toLocaleString()}+`, l: 'Homes listed' },
          { v: `${stats.sitters.toLocaleString()}+`, l: 'Verified sitters' },
          { v: `${stats.countries}`, l: 'Countries' },
          { v: `${stats.stays.toLocaleString()}+`, l: 'Successful stays' },
        ] : [{}, {}, {}, {}]).map((s: any, i) => (
          <div
            key={i}
            style={{
              padding: isMobile ? 2 : 8,
              borderRight: !isMobile && i < 3 ? `1px solid rgba(255,255,255,.09)` : 'none',
              opacity: vis ? 1 : 0,
              transition: 'opacity 0.6s ease',
              gridColumn: isMobile && i >= 2 ? 'span 1' : 'auto'
            }}
          >
            {s.v ? (
              <>
                <div style={{ fontSize: isMobile ? 'clamp(20px, 6vw, 28px)' : 42, fontWeight: 900, color: G.y500, lineHeight: 1, marginBottom: 4 }}>
                  {s.v}
                </div>
                <div style={{ fontSize: isMobile ? 'clamp(8px, 2.5vw, 10px)' : 12, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>
                  {s.l}
                </div>
              </>
            ) : (
              <div style={{
                height: isMobile ? 32 : 60,
                borderRadius: 8,
                background: 'linear-gradient(90deg, #f0f0f0 0%, #e4e4e4 40%, #f0f0f0 80%)',
                backgroundSize: '600px 100%',
                animation: 'shimmer 1.6s infinite linear'
              }} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

/* ── micro helpers ── */
const SkeletonCard: React.FC<{ h: number }> = ({ h }) => (
  <div style={{
    height: h,
    borderRadius: 18,
    background: 'linear-gradient(90deg, #f0f0f0 0%, #e4e4e4 40%, #f0f0f0 80%)',
    backgroundSize: '600px 100%',
    animation: 'shimmer 1.6s infinite linear',
    marginBottom: 16
  }} />
);

const EmptyState: React.FC<{ icon: string; msg: string; onRetry: () => void; isMobile: boolean }> = ({
  icon,
  msg,
  onRetry,
  isMobile
}) => (
  <div style={{ textAlign: 'center', padding: isMobile ? 24 : 60, color: G.s500, gridColumn: '1/-1' }}>
    <div style={{ fontSize: isMobile ? 32 : 44, marginBottom: 12 }}>{icon}</div>
    <p style={{ marginBottom: 16, fontSize: isMobile ? 14 : 16, fontWeight: 600 }}>{msg}</p>
    <button
      onClick={onRetry}
      style={{
        background: G.g700,
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: isMobile ? '8px 20px' : '10px 28px',
        fontSize: isMobile ? 13 : 14,
        fontWeight: 800,
        cursor: 'pointer'
      }}
    >
      Refresh
    </button>
  </div>
);

/* ══════════════════════════════════════════
   HOME Main Component - FIXED HEADER SPACING
══════════════════════════════════════════ */
export const Home: React.FC = () => {
  const nav = useNavigate();
  const { isMobile, isTablet, isDesktop } = useMobile();

  const [props, setProps] = useState<Property[]>([]);
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'properties' | 'sitters'>('properties');
  const [stayMode, setStayMode] = useState<'Monthly' | 'Nightly'>('Monthly');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroAnim, setHeroAnim] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Responsive values - OPTIMIZED WITH HEADER SPACING
  const headerHeight = isMobile ? 60 : 80; // Fixed header height
  const heroHeight = isMobile ? 520 : isTablet ? 600 : 640; // Increased to account for header
  const sectionPadding = isMobile ? '40px 16px' : isTablet ? '60px 24px' : '80px 40px';
  const containerMaxWidth = isMobile ? '100%' : isTablet ? '720px' : '1180px';
  const gridGap = isMobile ? '12px' : isTablet ? '20px' : '24px';

  /* auto-advance hero */
  useEffect(() => {
    const t = setInterval(() => {
      setHeroAnim(false);
      setTimeout(() => {
        setHeroIdx(i => (i + 1) % IMGS.hero.length);
        setHeroAnim(true);
      }, 60);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pR, sR] = await Promise.all([
        api.getProperties({ limit: isMobile ? 4 : 8 }),
        api.getSitters({ limit: isMobile ? 3 : 6 }),
      ]);
      setProps(pR.data || []);
      setSitters(sR.data || []);
      countUp({
        properties: pR.pagination?.total || 1500,
        sitters: sR.pagination?.total || 850,
        countries: 65,
        stays: 3200
      });
    } catch {
      setStats({ properties: 1500, sitters: 850, countries: 65, stays: 3200 });
    } finally {
      setLoading(false);
    }
  };

  const countUp = (t: Stats) => {
    let step = 0;
    const steps = 60;
    const id = setInterval(() => {
      step++;
      const p = step / steps;
      setStats({
        properties: Math.min(Math.round(t.properties * p), t.properties),
        sitters: Math.min(Math.round(t.sitters * p), t.sitters),
        countries: Math.min(Math.round(t.countries * p), t.countries),
        stays: Math.min(Math.round(t.stays * p), t.stays)
      });
      if (step >= steps) clearInterval(id);
    }, 30);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    nav(`/properties?search=${encodeURIComponent(location)}&budget=${budget}&mode=${stayMode}`);
  };

  const safeRating = (r: any) => {
    const n = parseFloat(r);
    return isNaN(n) ? 4.5 : n;
  };

  // Responsive grid columns
  const getPropertyGridCols = () => {
    if (isMobile) return '1fr';
    if (isTablet) return 'repeat(2, 1fr)';
    return 'repeat(auto-fill, minmax(340px, 1fr))';
  };

  const getSitterGridCols = () => {
    if (isMobile) return '1fr';
    if (isTablet) return 'repeat(2, 1fr)';
    return 'repeat(auto-fill, minmax(260px, 1fr))';
  };

  /* section hooks */
  const s1 = useInView();
  const s2 = useInView();
  const s3 = useInView();
  const s4 = useInView();
  const s5 = useInView();
  const s6 = useInView();
  const s7 = useInView();
  const s8 = useInView();

  return (
    <div style={{
      fontFamily: G.f,
      background: G.wh,
      color: G.s900,
      minHeight: '100vh',
      overflowX: 'hidden',
      width: '100%',
      maxWidth: '100vw'
    }}>


      {/* ══ MOBILE MENU ══ */}
      {isMobile && mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: G.wh,
          zIndex: 2000,
          padding: `${headerHeight + 16}px 16px 16px 16px`,
          overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Properties', 'Sitters', 'How It Works', 'Community', 'Corporate', 'Login', 'Sign Up'].map(item => (
              <button
                key={item}
                onClick={() => {
                  nav(`/${item.toLowerCase().replace(' ', '-')}`);
                  setMobileMenuOpen(false);
                }}
                style={{
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  borderBottom: `1px solid ${G.s200}`,
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ HERO — With header spacing ══ */}
      <section style={{
        position: 'relative',
        height: heroHeight,
        overflow: 'hidden',
        marginTop: 0, // No margin, padding handles it
      }}>
        {/* background image */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <img
            key={heroIdx}
            src={IMGS.hero[heroIdx]}
            alt="hero"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: heroAnim ? 1 : 0,
              transition: 'opacity .8s ease',
              transform: isMobile ? 'scale(1.1)' : 'none'
            }}
            onError={e => {
              (e.target as HTMLImageElement).src = IMGS.hero[0];
            }}
          />
        </div>

        {/* gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(13,61,36,.55) 0%, rgba(13,61,36,.72) 55%, rgba(13,61,36,.92) 100%)'
        }} />

        {/* content - FIXED WITH HEADER PADDING */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: containerMaxWidth,
          margin: '0 auto',
          padding: isMobile ? `${headerHeight + 20}px 12px 20px` : '0 40px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflowY: isMobile ? 'auto' : 'visible',
        }}>
          {/* sub-label */}
          <div style={{ marginBottom: isMobile ? 8 : 16 }}>
            <span style={{
              ...pill('rgba(245,166,35,.2)', G.y500),
              border: '1.5px solid rgba(245,166,35,.45)',
              fontSize: isMobile ? 9 : 12,
              padding: isMobile ? '3px 8px' : '4px 12px',
              display: 'inline-block'
            }}>
              ✦ TRUSTED HOUSE SITTING · 65+ COUNTRIES
            </span>
          </div>

          {/* headline */}
          <h1 style={{
            fontSize: isMobile ? 'clamp(22px, 7vw, 28px)' : 'clamp(38px, 5.5vw, 68px)',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.2,
            letterSpacing: '-.04em',
            maxWidth: isMobile ? '100%' : 720,
            marginBottom: isMobile ? 12 : 20
          }}>
            Your home,<br />
            <span style={{ color: G.y500 }}>Beautifully Cared for.</span>
          </h1>

          {/* description - Always visible but smaller on mobile */}
          <p style={{
            fontSize: isMobile ? 14 : 17,
            color: 'rgba(255,255,255,.72)',
            maxWidth: isMobile ? '100%' : 500,
            lineHeight: 1.6,
            marginBottom: isMobile ? 16 : 36,
            fontWeight: 500,
            display: 'block',
          }}>
            Connect with verified house Sitters and Listers worldwide. Secure, flexible arrangements — monthly or nightly.
          </p>

          {/* search card */}
          <div style={{ 
            maxWidth: isMobile ? '100%' : 820,
            marginBottom: isMobile ? '8px' : 0,
          }}>
            {/* stay toggle */}
            <div style={{
              display: 'flex',
              marginBottom: 0,
              overflowX: isMobile ? 'auto' : 'visible',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: isMobile ? '2px' : 0,
              gap: '2px'
            }}>
              {(['Monthly', 'Nightly'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setStayMode(m)}
                  style={{
                    padding: isMobile ? '6px 12px' : '10px 24px',
                    borderRadius: '12px 12px 0 0',
                    fontSize: isMobile ? 11 : 13,
                    fontWeight: 700,
                    background: stayMode === m ? '#fff' : 'rgba(255,255,255,.15)',
                    color: stayMode === m ? G.g800 : 'rgba(255,255,255,.75)',
                    border: 'none',
                    marginRight: 0,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Mobile search form */}
            {isMobile ? (
              <form onSubmit={handleSearch} style={{
                background: '#fff',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,.25)',
                padding: '12px',
                margin: '8px 0 12px 0',
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: G.s400, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 2 }}>Location</div>
                  <select
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${G.s200}`,
                      borderRadius: '6px',
                      fontSize: 13,
                      color: G.s900,
                      fontWeight: 600,
                      background: G.wh
                    }}
                  >
                    <option value="">Select location</option>
                    {['Nairobi', 'London', 'Sydney', 'New York', 'Dubai', 'Singapore', 'Cape Town', 'Paris', 'Toronto', 'Tokyo'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: G.s400, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 2 }}>
                    {stayMode === 'Monthly' ? 'Monthly budget' : 'Nightly rate'}
                  </div>
                  <select
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${G.s200}`,
                      borderRadius: '6px',
                      fontSize: 13,
                      color: G.s900,
                      fontWeight: 600,
                      background: G.wh
                    }}
                  >
                    <option value="">Set budget</option>
                    {(stayMode === 'Monthly'
                      ? ['Under $1,000', '$1,000–$1,500', '$1,500–$2,000', '$2,000–$3,000', '$3,000+']
                      : ['Under $80', '$80–$120', '$120–$180', '$180–$250', '$250+']
                    ).map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: G.g700,
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    fontSize: 14,
                    fontWeight: 900,
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Check availability
                </button>
              </form>
            ) : (
              /* Desktop search form */
              <form onSubmit={handleSearch} style={{
                background: '#fff',
                borderRadius: '0 16px 16px 16px',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto',
                boxShadow: '0 16px 64px rgba(0,0,0,.35)',
                marginBottom: '20px',
              }}>
                {/* location */}
                <div style={{ padding: '16px 24px', borderRight: `1px solid ${G.s200}` }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: G.s400, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Location</div>
                  <select
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    style={{ width: '100%', border: 'none', fontSize: 15, color: G.s900, fontWeight: 700, background: 'transparent' }}
                  >
                    <option value="">Select location</option>
                    {['Nairobi', 'London', 'Sydney', 'New York', 'Dubai', 'Singapore', 'Cape Town', 'Paris', 'Toronto', 'Tokyo'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                {/* budget */}
                <div style={{ padding: '16px 24px', borderRight: `1px solid ${G.s200}` }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: G.s400, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>
                    {stayMode === 'Monthly' ? 'Monthly budget' : 'Nightly rate'}
                  </div>
                  <select
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    style={{ width: '100%', border: 'none', fontSize: 15, color: G.s900, fontWeight: 700, background: 'transparent' }}
                  >
                    <option value="">Set budget</option>
                    {(stayMode === 'Monthly'
                      ? ['Under $1,000', '$1,000–$1,500', '$1,500–$2,000', '$2,000–$3,000', '$3,000+']
                      : ['Under $80', '$80–$120', '$120–$180', '$180–$250', '$250+']
                    ).map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <button type="submit" style={{
                  background: G.g700,
                  color: '#fff',
                  border: 'none',
                  padding: '0 36px',
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: '.01em',
                  cursor: 'pointer'
                }}>
                  Check availability
                </button>
              </form>
            )}

            {/* quick filters */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 8,
              flexWrap: isMobile ? 'nowrap' : 'wrap',
              overflowX: isMobile ? 'auto' : 'visible',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: isMobile ? '4px' : 0,
            }}>
              <span style={{
                color: '#fff',
                fontSize: isMobile ? 11 : 14,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                background: 'rgba(13,61,36,.5)',
                padding: isMobile ? '4px 10px' : '4px 12px',
                borderRadius: '30px',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,.2)',
                flexShrink: 0,
              }}>
                🔍 Browse:
              </span>
              
              {[['🌟 Premium', 'premium'], ['🐾 Pet friendly', 'pet-friendly'], ['📅 Long term', 'long-term'], ['✓ Verified', 'verified']].map(([l, f]) => (
                <button
                  key={f}
                  onClick={() => nav(`/properties?filter=${f}`)}
                  style={{
                    background: 'rgba(255,255,255,.15)',
                    border: '1.5px solid rgba(255,255,255,.25)',
                    color: '#fff',
                    borderRadius: 40,
                    padding: isMobile ? '6px 12px' : '6px 16px',
                    fontSize: isMobile ? 11 : 13,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                    flexShrink: 0,
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* hero dots */}
          {!isMobile && (
            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              {IMGS.hero.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setHeroIdx(i);
                    setHeroAnim(true);
                  }}
                  style={{
                    width: heroIdx === i ? 28 : 8,
                    height: 8,
                    borderRadius: 999,
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    background: heroIdx === i ? G.y500 : 'rgba(255,255,255,.35)',
                    transition: 'all .35s ease',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* scroll hint - hide on mobile */}
        {!isMobile && (
          <div style={{
            position: 'absolute',
            bottom: 24,
            right: 48,
            color: 'rgba(255,255,255,.4)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '.1em',
            transform: 'rotate(90deg)',
            transformOrigin: 'right center'
          }}>
            SCROLL ↓
          </div>
        )}
      </section>

      {/* ══ TICKER STRIP ══ */}
      <div style={{ background: G.y500, padding: isMobile ? '10px 0' : '15px 0', overflow: 'hidden' }}>
        <div style={{
          display: 'inline-block',
          animation: `ticker ${isMobile ? '24s' : '32s'} linear infinite`,
          whiteSpace: 'nowrap'
        }}>
          {[...Array(2)].map((_, ri) => (
            <span key={ri}>
              {['🏡 Fully Furnished', '✓ Verified Sitters', '📋 Flexible Contracts', '🐾 Pet Friendly', '📶 Fast Wifi', '🔧 Maintenance Support', '🎉 Community Events', '🌍 65+ Countries', '⭐ 4.8 Rating'].map(item => (
                <span key={item} style={{
                  marginRight: isMobile ? 30 : 52,
                  fontSize: isMobile ? 9 : 12,
                  fontWeight: 800,
                  color: G.g900,
                  letterSpacing: '.04em',
                  textTransform: 'uppercase'
                }}>
                  {item}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ══ HERO TAGLINE + FEATURE CHIPS ══ */}
      <section ref={s1.ref} style={{ padding: sectionPadding, background: G.s100 }}>
        <div style={{
          maxWidth: containerMaxWidth,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? 32 : 80,
          alignItems: 'center'
        }}>
          {/* left */}
          <div style={{ opacity: s1.vis ? 1 : 0, transition: 'opacity 0.6s ease' }}>
            <span style={{ ...pill(G.g100, G.g700, isMobile ? { fontSize: 10, padding: '3px 10px' } : {}), marginBottom: 8, display: 'inline-flex' }}>ABOUT HOWSITTER</span>
            <div style={{ width: 40, height: 3, background: G.y500, borderRadius: 2, margin: '10px 0 16px' }} />
            <h2 style={{
              fontSize: isMobile ? 'clamp(20px, 5vw, 24px)' : 'clamp(26px, 3vw, 44px)',
              fontWeight: 900,
              color: G.g900,
              lineHeight: 1.1,
              letterSpacing: '-.03em',
              marginBottom: 16
            }}>
              The most trusted<br />
              <span style={{ color: G.g700 }}>House sitting</span> Network
            </h2>
            <p style={{
              fontSize: isMobile ? 14 : 16,
              color: G.s500,
              lineHeight: 1.7,
              marginBottom: 24,
              fontWeight: 500
            }}>
              We connect verified, background-checked sitters with homeowners who need peace of mind while they're away. Flexible durations, smart matching, and a global community you can trust.
            </p>

            {/* feature chips - responsive grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(120px, auto))',
              gap: 8,
              marginBottom: 24
            }}>
              {[['🛋️', 'Fully Furnished'], ['🧹', 'Housekeeping'], ['📋', 'Flex Contracts'], ['📶', 'Fast Wifi'], ['🔧', 'Maintenance'], ['🎉', 'Events & Perks'], ['🐾', 'Pet Friendly'], ['✓', 'ID Verified']].map(([ico, lbl]) => (
                <div key={lbl} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: G.wh,
                  border: `1.5px solid ${G.s200}`,
                  borderRadius: 8,
                  padding: isMobile ? '8px 10px' : '9px 14px',
                  fontSize: isMobile ? 11 : 13,
                  color: G.s700,
                  fontWeight: 700,
                  boxShadow: '0 1px 4px rgba(0,0,0,.05)'
                }}>
                  <span style={{ fontSize: isMobile ? 13 : 16 }}>{ico}</span>
                  <span style={{ whiteSpace: isMobile ? 'normal' : 'nowrap' }}>{lbl}</span>
                </div>
              ))}
            </div>

            {/* rating row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? 12 : 20,
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: isMobile ? 32 : 52, fontWeight: 900, color: G.g900, lineHeight: 1 }}>4.8</span>
                <div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(i => <span key={i} style={{ color: G.y500, fontSize: isMobile ? 12 : 15 }}>★</span>)}
                  </div>
                  <div style={{ fontSize: isMobile ? 9 : 12, color: G.s400, fontWeight: 600 }}>from 3,200+ reviews</div>
                </div>
              </div>
              {[['🏆', 'Best Platform\n2024'], ['🌍', '65+\nCountries'], ['🛡️', 'Verified\nCommunity']].map(([ico, lbl]) => (
                <div key={lbl} style={{
                  background: G.g100,
                  border: `1.5px solid ${G.g700}`,
                  borderRadius: 8,
                  padding: isMobile ? '8px 10px' : '10px 14px',
                  fontSize: isMobile ? 9 : 11,
                  fontWeight: 800,
                  color: G.g700,
                  textAlign: 'center',
                  lineHeight: 1.4,
                  whiteSpace: 'pre-line'
                }}>
                  {ico} {lbl}
                </div>
              ))}
            </div>
          </div>

          {/* right — stacked image collage - hide on mobile */}
          {!isMobile && (
            <div style={{ opacity: s1.vis ? 1 : 0, position: 'relative', transition: 'opacity 0.6s ease' }}>
              <div style={{ borderRadius: 22, overflow: 'hidden', aspectRatio: '4/3', boxShadow: '0 24px 64px rgba(0,0,0,.18)' }}>
                <img
                  src={IMGS.lifestyle[0]}
                  alt="community"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => {
                    (e.target as HTMLImageElement).src = IMGS.properties[0];
                  }}
                />
              </div>
              <div style={{
                position: 'absolute',
                bottom: -20,
                left: -24,
                background: G.wh,
                borderRadius: 16,
                padding: '16px 20px',
                boxShadow: '0 12px 40px rgba(0,0,0,.14)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                minWidth: 200
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: G.g100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>✓</div>
                <div>
                  <div style={{ fontWeight: 800, color: G.g900, fontSize: 14 }}>Verified & Trusted</div>
                  <div style={{ fontSize: 12, color: G.s400, fontWeight: 600 }}>3,200+ successful stays</div>
                </div>
              </div>
              <div style={{
                position: 'absolute',
                top: -14,
                right: -14,
                background: G.y500,
                borderRadius: 14,
                padding: '10px 18px',
                boxShadow: '0 8px 28px rgba(245,166,35,.45)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <div style={{ fontSize: 22 }}>🌍</div>
                <div>
                  <div style={{ fontWeight: 900, color: G.g900, fontSize: 13 }}>65 countries</div>
                  <div style={{ fontSize: 11, color: G.g800, fontWeight: 600 }}>worldwide network</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══ LOVE WHERE YOU LIVE — Masonry image grid ══ */}
      <section ref={s2.ref} style={{ padding: sectionPadding, background: G.wh }}>
        <div style={{ maxWidth: containerMaxWidth, margin: '0 auto' }}>
          <div style={{
            opacity: s2.vis ? 1 : 0,
            transition: 'opacity 0.6s ease',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'flex-end',
            marginBottom: 24,
            gap: isMobile ? 12 : 0
          }}>
            <div>
              <span style={{ ...pill(G.g100, G.g700, isMobile ? { fontSize: 10, padding: '3px 10px' } : {}), marginBottom: 8, display: 'inline-flex' }}>FEATURED HOMES</span>
              <div style={{ width: 40, height: 3, background: G.y500, borderRadius: 2, margin: '10px 0 16px' }} />
              <h2 style={{
                fontSize: isMobile ? 22 : 32,
                fontWeight: 900,
                color: G.g900,
                letterSpacing: '-.03em'
              }}>
                Love where you live
              </h2>
              <p style={{ color: G.s400, fontSize: isMobile ? 13 : 15, marginTop: 4, fontWeight: 500 }}>
                Handpicked homes needing trusted sitters
              </p>
            </div>
            <button
              onClick={() => nav('/properties')}
              style={{
                background: 'none',
                border: `2px solid ${G.g700}`,
                color: G.g700,
                borderRadius: 8,
                padding: isMobile ? '8px 16px' : '10px 22px',
                fontSize: isMobile ? 12 : 13,
                fontWeight: 800,
                cursor: 'pointer',
                alignSelf: isMobile ? 'flex-start' : 'auto'
              }}
            >
              View all homes →
            </button>
          </div>

          {/* Responsive masonry grid */}
          <div style={{ opacity: s2.vis ? 1 : 0, transition: 'opacity 0.6s ease' }}>
            {loading ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                gap: 12,
                height: isMobile ? 'auto' : 480
              }}>
                {[...Array(isMobile ? 4 : 5)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      borderRadius: 16,
                      height: isMobile ? 180 : (i === 0 && !isMobile ? '100%' : 240),
                      background: 'linear-gradient(90deg, #f0f0f0 0%, #e4e4e4 40%, #f0f0f0 80%)',
                      backgroundSize: '600px 100%',
                      animation: 'shimmer 1.6s infinite linear'
                    }}
                  />
                ))}
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : '2fr 1fr 1fr'),
                gridTemplateRows: isMobile ? 'auto' : '240px 240px',
                gap: 12
              }}>
                {/* Responsive grid items */}
                {isMobile ? (
                  props.slice(0, 4).map((p, i) => (
                    <PropertyThumbMobile
                      key={p.id}
                      p={p}
                      idx={i}
                      nav={nav}
                    />
                  ))
                ) : (
                  <>
                    <PropertyThumb p={props[0]} idx={0} nav={nav} style={{ gridRow: isTablet ? 'auto' : '1/3' }} />
                    {[1, 2, 3, 4].map(i => <PropertyThumb key={i} p={props[i]} idx={i} nav={nav} style={{}} />)}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══ BROWSE DEALS — card list with stay toggle ══ */}
      <section ref={s3.ref} style={{ padding: sectionPadding, background: G.s100 }}>
        <div style={{ maxWidth: containerMaxWidth, margin: '0 auto' }}>
          <div style={{ opacity: s3.vis ? 1 : 0, transition: 'opacity 0.6s ease' }}>
            {/* header row */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'flex-end',
              marginBottom: 24,
              gap: isMobile ? 16 : 0
            }}>
              <div>
                <span style={{ ...pill(G.g100, G.g700, isMobile ? { fontSize: 10, padding: '3px 10px' } : {}), marginBottom: 8, display: 'inline-flex' }}>BROWSE LISTINGS</span>
                <div style={{ width: 40, height: 3, background: G.y500, borderRadius: 2, margin: '10px 0 16px' }} />
                <h2 style={{
                  fontSize: isMobile ? 22 : 32,
                  fontWeight: 900,
                  color: G.g900,
                  letterSpacing: '-.03em'
                }}>
                  Browse the best listings
                </h2>
                <p style={{ color: G.s400, fontSize: isMobile ? 13 : 15, marginTop: 4, fontWeight: 500 }}>
                  Properties & sitters at special rates
                </p>
              </div>

              {/* tab toggle */}
              <div style={{
                display: 'flex',
                background: G.wh,
                borderRadius: 999,
                padding: 4,
                gap: 4,
                border: `1.5px solid ${G.s200}`,
                width: isMobile ? '100%' : 'auto'
              }}>
                {(['properties', 'sitters'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      flex: isMobile ? 1 : 'none',
                      padding: isMobile ? '10px 12px' : '9px 26px',
                      borderRadius: 999,
                      border: 'none',
                      background: tab === t ? G.g900 : 'transparent',
                      color: tab === t ? '#fff' : G.s500,
                      fontWeight: 700,
                      fontSize: isMobile ? 13 : 14,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer'
                    }}
                  >
                    {t === 'properties' ? '🏡 Properties' : '👤 Sitters'}
                  </button>
                ))}
              </div>
            </div>

            {/* cards */}
            {tab === 'properties' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: getPropertyGridCols(),
                gap: isMobile ? 12 : 20
              }}>
                {loading ? [...Array(isMobile ? 2 : 6)].map((_, i) => <SkeletonCard key={i} h={isMobile ? 280 : 360} />) :
                  props.length > 0 ? props.slice(0, isMobile ? 4 : undefined).map((p, i) => (
                    isMobile ? (
                      <PropertyCardMobile
                        key={p.id}
                        p={p}
                        i={i}
                        nav={nav}
                        stayMode={stayMode}
                        isMobile={isMobile}
                      />
                    ) : (
                      <PropertyCard
                        key={p.id}
                        p={p}
                        i={i}
                        nav={nav}
                        stayMode={stayMode}
                      />
                    )
                  )) : (
                    <EmptyState icon="🏡" msg="No properties at the moment" onRetry={fetchData} isMobile={isMobile} />
                  )}
              </div>
            )}

            {tab === 'sitters' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: getSitterGridCols(),
                gap: isMobile ? 12 : 20
              }}>
                {loading ? [...Array(isMobile ? 2 : 4)].map((_, i) => <SkeletonCard key={i} h={isMobile ? 240 : 320} />) :
                  sitters.length > 0 ? sitters.slice(0, isMobile ? 3 : undefined).map(s => (
                    isMobile ? (
                      <SitterCardMobile
                        key={s.id}
                        s={s}
                        nav={nav}
                        safeRating={safeRating}
                        isMobile={isMobile}
                      />
                    ) : (
                      <SitterCard
                        key={s.id}
                        s={s}
                        nav={nav}
                        safeRating={safeRating}
                      />
                    )
                  )) : (
                    <EmptyState icon="👤" msg="No sitters at the moment" onRetry={fetchData} isMobile={isMobile} />
                  )}
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button
                onClick={() => nav(tab === 'properties' ? '/properties' : '/sitters')}
                style={{
                  background: 'transparent',
                  border: `2px solid ${G.g900}`,
                  borderRadius: 999,
                  padding: isMobile ? '12px 28px' : '13px 44px',
                  fontSize: isMobile ? 14 : 14,
                  fontWeight: 800,
                  color: G.g900,
                  cursor: 'pointer'
                }}
              >
                View all {tab} →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <StatsBar stats={stats} isMobile={isMobile} />

      {/* ══ LIFESTYLE PHOTO BREAK — full bleed with responsive columns ══ */}
      <section ref={s4.ref} style={{ overflow: 'hidden' }}>
        <div style={{
          opacity: s4.vis ? 1 : 0,
          transition: 'opacity 0.6s ease',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'),
          height: isMobile ? 200 : 360
        }}>
          {IMGS.lifestyle.slice(0, isMobile ? 1 : (isTablet ? 2 : 3)).map((src, i) => (
            <div key={i} style={{ overflow: 'hidden', position: 'relative' }}>
              <img
                src={src}
                alt="lifestyle"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => {
                  (e.target as HTMLImageElement).src = IMGS.properties[i + 6];
                }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(13,61,36,.5) 100%)' }} />
              {i === (isMobile ? 0 : 1) && (
                <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center' }}>
                  <div style={{ color: '#fff', fontSize: isMobile ? 16 : 20, fontWeight: 900, letterSpacing: '-.02em' }}>
                    Live like a local
                  </div>
                  <div style={{ color: 'rgba(255,255,255,.7)', fontSize: isMobile ? 11 : 13, fontWeight: 500, marginTop: 4 }}>
                    in 65+ countries worldwide
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section ref={s5.ref} style={{ padding: sectionPadding, background: G.wh }}>
        <div style={{ maxWidth: containerMaxWidth, margin: '0 auto' }}>
          <div style={{
            opacity: s5.vis ? 1 : 0,
            transition: 'opacity 0.6s ease',
            textAlign: 'center',
            marginBottom: 32
          }}>
            <span style={{ ...pill(G.g100, G.g700, isMobile ? { fontSize: 10, padding: '3px 10px' } : {}), marginBottom: 8, display: 'inline-flex' }}>THE PROCESS</span>
            <div style={{ width: 40, height: 3, background: G.y500, borderRadius: 2, margin: '10px auto 16px' }} />
            <h2 style={{
              fontSize: isMobile ? 22 : 34,
              fontWeight: 900,
              color: G.g900,
              letterSpacing: '-.03em'
            }}>
              How house sitting works
            </h2>
            <p style={{ color: G.s400, fontSize: isMobile ? 13 : 16, marginTop: 6, fontWeight: 500 }}>
              Three simple steps from discovery to peace of mind
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'),
            gap: gridGap
          }}>
            {[
              { n: '01', ico: '🔍', title: 'Discover & Search', desc: 'Browse hundreds of verified homes and trusted sitters. Filter by location, dates, budget, pet-friendliness, and more.', img: IMGS.properties[2], delay: '0s' },
              { n: '02', ico: '🤝', title: 'Connect & Verify', desc: 'Schedule video calls, review verified IDs and references, sign digital agreements — all securely on-platform.', img: IMGS.properties[4], delay: '.12s' },
              { n: '03', ico: '🏡', title: 'Relax & Enjoy', desc: 'Your sitter moves in. Receive daily photo updates, real-time chat, and 24/7 concierge support throughout the stay.', img: IMGS.properties[6], delay: '.24s' },
            ].map(st => (
              <div
                key={st.n}
                style={{
                  background: G.s100,
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: `1.5px solid ${G.s200}`,
                  opacity: s5.vis ? 1 : 0,
                  transition: 'opacity 0.6s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                }}
              >
                <div style={{ height: isMobile ? 140 : 180, overflow: 'hidden' }}>
                  <img
                    src={st.img}
                    alt={st.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => {
                      (e.target as HTMLImageElement).src = IMGS.properties[0];
                    }}
                  />
                </div>
                <div style={{ padding: isMobile ? 20 : 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{
                      width: isMobile ? 36 : 42,
                      height: isMobile ? 36 : 42,
                      borderRadius: 10,
                      background: G.g100,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isMobile ? 18 : 22
                    }}>
                      {st.ico}
                    </div>
                    <div style={{ fontSize: isMobile ? 10 : 11, color: G.g700, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em' }}>
                      Step {st.n}
                    </div>
                  </div>
                  <h3 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, color: G.g900, marginBottom: 8 }}>
                    {st.title}
                  </h3>
                  <p style={{ fontSize: isMobile ? 13 : 14, color: G.s500, lineHeight: 1.6, fontWeight: 500 }}>
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ IMAGE GALLERY STRIP (horizontally scrollable) ══ */}
      <section ref={s6.ref} style={{ padding: isMobile ? '40px 0 40px 16px' : '80px 0 80px 40px', background: G.s100, overflow: 'hidden' }}>
        <div style={{
          maxWidth: containerMaxWidth,
          marginBottom: 24,
          paddingRight: isMobile ? 16 : 40,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          gap: isMobile ? 12 : 0
        }}>
          <div style={{ opacity: s6.vis ? 1 : 0, transition: 'opacity 0.6s ease' }}>
            <span style={{ ...pill(G.y100, '#92400E', isMobile ? { fontSize: 10, padding: '3px 10px' } : {}), marginBottom: 8, display: 'inline-flex' }}>PHOTO GALLERY</span>
            <div style={{ width: 40, height: 3, background: G.y500, borderRadius: 2, margin: '10px 0 16px' }} />
            <h2 style={{ fontSize: isMobile ? 22 : 30, fontWeight: 900, color: G.g900, letterSpacing: '-.03em' }}>
              Homes you'll love
            </h2>
          </div>
          <button
            onClick={() => nav('/properties')}
            style={{
              background: 'none',
              border: `2px solid ${G.s200}`,
              color: G.s700,
              borderRadius: 8,
              padding: isMobile ? '8px 16px' : '9px 18px',
              fontSize: isMobile ? 12 : 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Browse all →
          </button>
        </div>

        {/* horizontally scrollable gallery */}
        <div style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingRight: isMobile ? 16 : 40,
          paddingBottom: 4,
          WebkitOverflowScrolling: 'touch'
        }}>
          {IMGS.properties.slice(0, isMobile ? 6 : 12).map((src, i) => (
            <div
              key={i}
              onClick={() => props[i] && nav(`/properties/${props[i].id}`)}
              style={{
                minWidth: isMobile ? (i % 3 === 0 ? 180 : 150) : (i % 3 === 0 ? 300 : 240),
                height: isMobile ? 140 : 200,
                borderRadius: 12,
                overflow: 'hidden',
                flexShrink: 0,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,0,0,.10)',
                position: 'relative'
              }}
            >
              <img
                src={src}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => {
                  (e.target as HTMLImageElement).src = IMGS.properties[i % 6];
                }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 50%)' }} />
              {props[i] && (
                <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8 }}>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: isMobile ? 11 : 13 }}>
                    {props[i].title}
                  </div>
                  {props[i].city && (
                    <span style={{
                      ...pill('rgba(255,255,255,.15)', '#fff', {
                        fontSize: isMobile ? 9 : 11,
                        backdropFilter: 'blur(4px)',
                        padding: '2px 6px'
                      })
                    }}>
                      📍 {props[i].city}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══ WORLD MAP ══ */}
      <section ref={s7.ref} style={{ padding: sectionPadding, background: G.wh }}>
        <div style={{ maxWidth: containerMaxWidth, margin: '0 auto' }}>
          <div style={{
            opacity: s7.vis ? 1 : 0,
            transition: 'opacity 0.6s ease',
            textAlign: 'center',
            marginBottom: 24
          }}>
            <span style={{ ...pill(G.y100, '#92400E', isMobile ? { fontSize: 10, padding: '3px 10px' } : {}), marginBottom: 8, display: 'inline-flex' }}>🌍 GLOBAL NETWORK</span>
            <div style={{ width: 40, height: 3, background: G.y500, borderRadius: 2, margin: '10px auto 12px' }} />
            <h2 style={{ fontSize: isMobile ? 22 : 32, fontWeight: 900, color: G.g900, letterSpacing: '-.03em' }}>
              House sitting, everywhere
            </h2>
            <p style={{ color: G.s400, fontSize: isMobile ? 13 : 15, marginTop: 4, fontWeight: 500 }}>
              Properties and sitters across 65+ countries
            </p>
          </div>
          <div style={{
            borderRadius: 16,
            overflow: 'hidden',
            border: `1.5px solid ${G.s200}`,
            boxShadow: '0 8px 40px rgba(0,0,0,.08)',
            height: isMobile ? 240 : 460
          }}>
            <WorldMap showProperties showSitters height={isMobile ? "240px" : "460px"} />
          </div>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to="/world-map" style={{ color: G.g700, fontWeight: 800, fontSize: isMobile ? 13 : 14, textDecoration: 'none' }}>
              Explore full map →
            </Link>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section ref={s8.ref} style={{
        padding: sectionPadding,
        background: G.g900,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* decorative circles - hide on mobile */}
        {!isMobile && (
          <>
            <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(245,166,35,.06)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -80, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,.03)', pointerEvents: 'none' }} />
          </>
        )}

        <div style={{ maxWidth: containerMaxWidth, margin: '0 auto' }}>
          <div style={{
            opacity: s8.vis ? 1 : 0,
            transition: 'opacity 0.6s ease',
            textAlign: 'center',
            marginBottom: isMobile ? 24 : 52
          }}>
            <span style={{ ...pill(G.y500, G.g900, isMobile ? { fontSize: 10, padding: '3px 10px' } : {}), marginBottom: 10, display: 'inline-flex' }}>COMMUNITY STORIES</span>
            <div style={{ width: 40, height: 3, background: 'rgba(255,255,255,.2)', borderRadius: 2, margin: '10px auto 12px' }} />
            <h2 style={{ fontSize: isMobile ? 22 : 34, fontWeight: 900, color: '#fff', letterSpacing: '-.03em' }}>
              Trusted by thousands worldwide
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5].map(i => <span key={i} style={{ color: G.y500, fontSize: isMobile ? 14 : 17 }}>★</span>)}
              <span style={{ fontSize: isMobile ? 12 : 14, color: 'rgba(255,255,255,.5)', marginLeft: 4, fontWeight: 600 }}>
                4.8 · 3,200+ reviews
              </span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'),
            gap: isMobile ? 16 : 24
          }}>
            {[
              { name: 'Sarah Chen', role: 'Homeowner · Nairobi', flag: '🇰🇪', q: 'Found the perfect sitter for my 3-month trip. Daily updates gave me complete peace of mind.' },
              { name: 'James Wilson', role: 'Digital Nomad · Sydney', flag: '🇦🇺', q: 'House sitting let me live like a local in 8 countries this year. The verified community makes every arrangement feel completely safe.' },
              { name: 'Maria Rodriguez', role: 'Student · London', flag: '🇬🇧', q: 'Fully furnished, fast wifi, housekeeping included. The flexible contract meant I could focus entirely on my studies.' },
            ].slice(0, isMobile ? 1 : (isTablet ? 2 : 3)).map((t, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,.06)',
                backdropFilter: 'blur(8px)',
                borderRadius: 16,
                padding: isMobile ? 20 : 30,
                border: '1.5px solid rgba(255,255,255,.1)',
                opacity: s8.vis ? 1 : 0,
                transition: 'opacity 0.6s ease',
              }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                  {[1, 2, 3, 4, 5].map(j => <span key={j} style={{ color: G.y500, fontSize: isMobile ? 12 : 14 }}>★</span>)}
                </div>
                <p style={{ fontSize: isMobile ? 13 : 15, color: 'rgba(255,255,255,.8)', lineHeight: 1.6, marginBottom: 20, fontWeight: 500, fontStyle: 'italic' }}>
                  "{t.q}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: isMobile ? 40 : 46, height: isMobile ? 40 : 46, borderRadius: '50%', background: G.g100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? 20 : 24 }}>
                    {t.flag}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 800, fontSize: isMobile ? 13 : 14 }}>{t.name}</div>
                    <div style={{ color: 'rgba(255,255,255,.45)', fontSize: isMobile ? 11 : 12, fontWeight: 500 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══ */}
      <section style={{
        padding: isMobile ? '48px 16px' : '100px 40px',
        background: G.y500,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          maxWidth: isMobile ? '100%' : 680,
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <span style={{ ...pill('rgba(13,61,36,.12)', G.g900, isMobile ? { fontSize: 10, padding: '4px 12px' } : {}), marginBottom: 16, display: 'inline-flex' }}>
            GET STARTED
          </span>
          <h2 style={{
            fontSize: isMobile ? 'clamp(22px, 6vw, 26px)' : 'clamp(30px, 4vw, 52px)',
            fontWeight: 900,
            color: G.g900,
            marginBottom: 16,
            letterSpacing: '-.04em',
            lineHeight: 1.08
          }}>
            Ready to find your<br />perfect match?
          </h2>
          <p style={{
            fontSize: isMobile ? 14 : 17,
            color: 'rgba(13,61,36,.7)',
            marginBottom: isMobile ? 24 : 44,
            lineHeight: 1.65,
            fontWeight: 600
          }}>
            Join thousands of homeowners and sitters who trust Howsitter for secure, flexible, stress-free arrangements.
          </p>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 28
          }}>
            <button
              onClick={() => nav('/properties')}
              style={{
                background: G.g900,
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: isMobile ? '14px 28px' : '18px 44px',
                fontSize: isMobile ? 14 : 15,
                fontWeight: 900,
                boxShadow: '0 10px 32px rgba(13,61,36,.35)',
                cursor: 'pointer',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              Browse homes
            </button>
            <button
              onClick={() => nav('/register')}
              style={{
                background: '#fff',
                color: G.g900,
                border: `2px solid ${G.g900}`,
                borderRadius: 10,
                padding: isMobile ? '14px 28px' : '18px 44px',
                fontSize: isMobile ? 14 : 15,
                fontWeight: 900,
                cursor: 'pointer',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              Create free account
            </button>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: isMobile ? 24 : 48,
            flexWrap: 'wrap'
          }}>
            {[['4.8★', 'Avg Rating'], ['98%', 'Satisfaction'], ['24/7', 'Support']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, color: G.g900 }}>{v}</div>
                <div style={{ fontSize: isMobile ? 10 : 12, color: 'rgba(13,61,36,.55)', fontWeight: 700 }}>{l}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: isMobile ? 10 : 12, color: 'rgba(13,61,36,.45)', marginTop: 20, fontWeight: 600 }}>
            No credit card · Free to browse · Verified community
          </p>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: '#0A1628', padding: isMobile ? '40px 16px 20px' : '70px 40px 32px', fontFamily: G.f }}>
        <div style={{ maxWidth: containerMaxWidth, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : '2.4fr 1fr 1fr 1fr'),
            gap: isMobile ? 32 : 48,
            marginBottom: 32
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <svg width="28" height="28" viewBox="0 0 34 34" fill="none">
                  <rect width="34" height="34" rx="9" fill={G.y500} />
                  <path d="M17 7L8 14v13h6v-8h6v8h6V14z" fill={G.g900} />
                </svg>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: 15 }}>howsitter</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, lineHeight: 1.6, maxWidth: 260, marginBottom: 20, fontWeight: 500 }}>
                Connecting verified house sitters with homeowners worldwide. Flexible, secure arrangements with genuine peace of mind.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['🇰🇪', '🇬🇧', '🇺🇸', '🇦🇺', '🇸🇬', '🇿🇦'].map(f => (
                  <span key={f} style={{ fontSize: 20, cursor: 'pointer', opacity: .6 }}>{f}</span>
                ))}
              </div>
            </div>
            {!isMobile && [
              { head: 'Platform', links: ['Browse Homes', 'Find Sitters', 'List Property', 'How It Works', 'Pricing'] },
              { head: 'Company', links: ['About Us', 'Careers', 'Press', 'Blog', 'Partners'] },
              { head: 'Legal', links: ['Privacy Policy', 'Terms of Use', 'Safety', 'Cookie Policy', 'Contact'] },
            ].map(col => (
              <div key={col.head}>
                <div style={{ color: 'rgba(255,255,255,.6)', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 16 }}>
                  {col.head}
                </div>
                {col.links.map(l => (
                  <div key={l} style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, marginBottom: 10, cursor: 'pointer', fontWeight: 500 }}>
                    {l}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 16, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center', gap: isMobile ? 12 : 0 }}>
            <span style={{ color: 'rgba(255,255,255,.22)', fontSize: 12, fontWeight: 500 }}>
              © 2025 Howsitter. All rights reserved.
            </span>
            <span style={{ color: 'rgba(255,255,255,.22)', fontSize: 12, fontWeight: 500 }}>
              Made with ♥ by the Howsitter team
            </span>
          </div>
        </div>
      </footer>

      {/* FAB - hide on mobile (use bottom nav instead) */}
      {!isMobile && (
        <button
          onClick={() => nav('/list-property')}
          aria-label="List property"
          style={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: G.g700,
            color: '#fff',
            border: 'none',
            fontSize: 24,
            boxShadow: '0 6px 20px rgba(30,107,69,.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            cursor: 'pointer'
          }}
        >
          +
        </button>
      )}
      
      {/* Add global styles for animations and scroll hints */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .hs-card {
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        
        .hs-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 48px rgba(0,0,0,.13) !important;
        }
        
        /* Hide scrollbar but keep functionality */
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        /* Ensure proper spacing on mobile */
        @media (max-width: 768px) {
          .hero-search-container {
            padding-bottom: 20px !important;
            margin-bottom: 12px !important;
          }
          
          /* Add gradient fade to indicate scrolling */
          .filters-scroll-container::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 50px;
            background: linear-gradient(to right, transparent, rgba(13,61,36,.9));
            pointer-events: none;
            border-radius: 0 16px 16px 0;
          }
          
          /* Better touch targets */
          button, a, [role="button"] {
            min-height: 44px;
          }
          
          /* Improve readability */
          p, li, span {
            font-size: 16px;
            line-height: 1.6;
          }
          
          /* Better spacing for stacked elements */
          .section-content {
            padding-left: 16px;
            padding-right: 16px;
          }
        }
        
        /* Improve accessibility */
        button:focus-visible, a:focus-visible {
          outline: 3px solid ${G.y500};
          outline-offset: 2px;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Better touch feedback */
        @media (hover: none) {
          .hs-card:active {
            opacity: 0.8;
            transition: opacity 0.1s ease;
          }
          
          button:active {
            transform: scale(0.97);
            transition: transform 0.1s ease;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;