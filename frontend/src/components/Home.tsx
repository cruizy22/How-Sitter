/*
 * HowSitter — Home Page
 * Design language: Cove.sg (exact layout, spacing, animation patterns)
 * Font: Nunito via Google Fonts (Cove uses Circular — Nunito is the open equiv)
 * Palette: Forest Green #1E6B45 · Amber #F5A623 · Slate grays
 * Images: Unsplash (real, high-quality property/lifestyle photos)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, Property, Sitter } from '../services/api';
import { WorldMap } from './WorldMap';

/* ─── inject Nunito + global keyframes once ─── */
(() => {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('hs-font')) {
    const l = document.createElement('link');
    l.id = 'hs-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap';
    document.head.appendChild(l);
  }
  if (!document.getElementById('hs-css')) {
    const s = document.createElement('style'); s.id = 'hs-css';
    s.textContent = `
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Nunito',sans-serif}
      @keyframes hsUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
      @keyframes hsLeft{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:translateX(0)}}
      @keyframes hsFadeIn{from{opacity:0}to{opacity:1}}
      @keyframes hsScale{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}
      @keyframes hsTick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      @keyframes hsShimmer{from{background-position:-600px 0}to{background-position:600px 0}}
      @keyframes hsPulse{0%,100%{opacity:1}50%{opacity:.5}}
      @keyframes hsHeroPan{0%{transform:scale(1.08) translateX(0)}100%{transform:scale(1) translateX(-2%)}}
      .hs-up{animation:hsUp .65s cubic-bezier(.22,1,.36,1) both}
      .hs-left{animation:hsLeft .65s cubic-bezier(.22,1,.36,1) both}
      .hs-fade{animation:hsFadeIn .5s ease both}
      .hs-scale{animation:hsScale .55s cubic-bezier(.22,1,.36,1) both}
      .hs-d1{animation-delay:.08s}.hs-d2{animation-delay:.16s}.hs-d3{animation-delay:.24s}.hs-d4{animation-delay:.32s}
      .hs-card{transition:transform .22s ease,box-shadow .22s ease;cursor:pointer}
      .hs-card:hover{transform:translateY(-5px);box-shadow:0 20px 48px rgba(0,0,0,.13)!important}
      .hs-img-wrap img{transition:transform .55s ease}
      .hs-img-wrap:hover img{transform:scale(1.07)}
      .hs-btn{transition:all .18s ease;cursor:pointer;border:none;font-family:'Nunito',sans-serif}
      .hs-btn:hover{filter:brightness(1.06);transform:translateY(-1px)}
      .hs-btn:active{transform:translateY(0);filter:brightness(.97)}
      .hs-nav-link{background:none;border:none;font-family:'Nunito',sans-serif;cursor:pointer;transition:all .15s ease}
      .hs-nav-link:hover{color:#fff!important;background:rgba(255,255,255,.1)!important}
      .hs-shimmer{background:linear-gradient(90deg,#f0f0f0 0%,#e4e4e4 40%,#f0f0f0 80%);background-size:600px 100%;animation:hsShimmer 1.6s infinite linear}
      .hs-ticker{display:inline-block;animation:hsTick 32s linear infinite;white-space:nowrap}
      .hs-hero-img{animation:hsHeroPan 18s ease-in-out infinite alternate}
      input,select{font-family:'Nunito',sans-serif}
      input:focus,select:focus{outline:none}
      ::-webkit-scrollbar{width:6px;height:6px}
      ::-webkit-scrollbar-track{background:#f1f1f1}
      ::-webkit-scrollbar-thumb{background:#c1c1c1;border-radius:3px}
    `;
    document.head.appendChild(s);
  }
})();

/* ─── tokens ─── */
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
  f:    "'Nunito', sans-serif",
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
    const el = ref.current; if (!el) return;
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); ob.disconnect(); }
    }, { threshold });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return { ref, vis };
}

/* ─── tiny helpers ─── */
const pill = (bg: string, col: string, x: React.CSSProperties = {}): React.CSSProperties => ({
  background: bg, color: col, borderRadius: 999, padding: '4px 12px',
  fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center',
  gap: 5, whiteSpace: 'nowrap' as const, letterSpacing: '.02em', ...x,
});
const divider: React.CSSProperties = { width: 48, height: 3, background: G.y500, borderRadius: 2, margin: '12px 0 20px' };
type Stats = { properties: number; sitters: number; countries: number; stays: number };

/* ══════════════════════════════════════════
   HOME
══════════════════════════════════════════ */
export const Home: React.FC = () => {
  const nav = useNavigate();
  const [props,    setProps]    = useState<Property[]>([]);
  const [sitters,  setSitters]  = useState<Sitter[]>([]);
  const [stats,    setStats]    = useState<Stats | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<'properties'|'sitters'>('properties');
  const [stayMode, setStayMode] = useState<'monthly'|'nightly'>('monthly');
  const [location, setLocation] = useState('');
  const [budget,   setBudget]   = useState('');
  const [heroIdx,  setHeroIdx]  = useState(0);
  const [heroAnim, setHeroAnim] = useState(true);

  /* auto-advance hero */
  useEffect(() => {
    const t = setInterval(() => {
      setHeroAnim(false);
      setTimeout(() => { setHeroIdx(i => (i + 1) % IMGS.hero.length); setHeroAnim(true); }, 60);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pR, sR] = await Promise.all([
        api.getProperties({ limit: 8 }),
        api.getSitters({ limit: 6 }),
      ]);
      setProps(pR.data || []);
      setSitters(sR.data || []);
      countUp({ properties: pR.pagination?.total || 1500, sitters: sR.pagination?.total || 850, countries: 65, stays: 3200 });
    } catch {
      setStats({ properties: 1500, sitters: 850, countries: 65, stays: 3200 });
    } finally { setLoading(false); }
  };

  const countUp = (t: Stats) => {
    let step = 0; const steps = 60;
    const id = setInterval(() => {
      step++;
      const p = step / steps;
      setStats({ properties: Math.min(Math.round(t.properties*p), t.properties), sitters: Math.min(Math.round(t.sitters*p), t.sitters), countries: Math.min(Math.round(t.countries*p), t.countries), stays: Math.min(Math.round(t.stays*p), t.stays) });
      if (step >= steps) clearInterval(id);
    }, 30);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    nav(`/properties?search=${encodeURIComponent(location)}&budget=${budget}&mode=${stayMode}`);
  };

  const safeRating = (r: any) => { const n = parseFloat(r); return isNaN(n) ? 4.5 : n; };

  /* section hooks */
  const s1 = useInView(); const s2 = useInView(); const s3 = useInView();
  const s4 = useInView(); const s5 = useInView(); const s6 = useInView();
  const s7 = useInView(); const s8 = useInView();

  return (
    <div style={{ fontFamily: G.f, background: G.wh, color: G.s900, minHeight: '100vh' }}>

      {/* ══ NAV ══ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 300, height: 64,
        background: G.g900, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 40px',
        boxShadow: '0 2px 16px rgba(0,0,0,.25)',
      }}>
        {/* Logo */}
        <div onClick={() => nav('/')} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', flexShrink:0 }}>
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <rect width="34" height="34" rx="9" fill={G.y500}/>
            <path d="M17 7L8 14v13h6v-8h6v8h6V14z" fill={G.g900} strokeWidth="0"/>
          </svg>
          <span style={{ color:'#fff', fontWeight:900, fontSize:19, letterSpacing:'-.5px' }}>howsitter</span>
        </div>

        {/* Links */}
        <div style={{ display:'flex', alignItems:'center', gap:2 }}>
          {[['view homes','/properties'],['find sitters','/sitters'],['how it works','/how-it-works'],['community','/community'],['corporate','/corporate']].map(([l,p])=>(
            <button key={l} className="hs-nav-link" onClick={()=>nav(p)}
              style={{ color:'rgba(255,255,255,.7)', padding:'8px 13px', fontSize:13.5, fontWeight:600, borderRadius:7 }}>{l}</button>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display:'flex', gap:10 }}>
          <button className="hs-btn" onClick={()=>nav('/list-property')} style={{ background:'rgba(255,255,255,.1)', border:'1.5px solid rgba(255,255,255,.22)', color:'#fff', borderRadius:9, padding:'9px 18px', fontSize:13, fontWeight:700 }}>List my home</button>
          <button className="hs-btn" onClick={()=>nav('/register')} style={{ background:G.y500, border:'none', color:G.g900, borderRadius:9, padding:'9px 20px', fontSize:13, fontWeight:900, boxShadow:'0 4px 14px rgba(245,166,35,.4)' }}>Sign up free</button>
        </div>
      </nav>

      {/* ══ HERO — Full-bleed with search overlay ══ */}
      <section style={{ position:'relative', height:640, overflow:'hidden' }}>
        {/* background image */}
        <div className="hs-img-wrap" style={{ position:'absolute', inset:0 }}>
          <img key={heroIdx} src={IMGS.hero[heroIdx]} alt="hero"
            className={`hs-hero-img ${heroAnim ? 'hs-fade' : ''}`}
            style={{ width:'100%', height:'100%', objectFit:'cover', opacity: heroAnim ? 1 : 0, transition:'opacity .8s ease' }}
            onError={e=>{(e.target as HTMLImageElement).src=IMGS.hero[0];}}
          />
        </div>
        {/* deep gradient overlay — dark green at bottom */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(13,61,36,.55) 0%, rgba(13,61,36,.72) 55%, rgba(13,61,36,.92) 100%)' }}/>

        {/* content */}
        <div style={{ position:'relative', zIndex:2, maxWidth:1180, margin:'0 auto', padding:'0 40px', height:'100%', display:'flex', flexDirection:'column', justifyContent:'center' }}>
          {/* sub-label */}
          <div className="hs-fade" style={{ marginBottom:16 }}>
            <span style={{ ...pill('rgba(245,166,35,.2)', G.y500), border:'1.5px solid rgba(245,166,35,.45)', fontSize:12, letterSpacing:'.06em' }}>
              ✦ TRUSTED HOUSE SITTING · 65+ COUNTRIES
            </span>
          </div>

          {/* headline */}
          <h1 className="hs-up" style={{ fontSize:'clamp(38px,5.5vw,68px)', fontWeight:900, color:'#fff', lineHeight:1.06, letterSpacing:'-.04em', maxWidth:720, marginBottom:20 }}>
            Your home,<br/>
            <span style={{ color:G.y500 }}>beautifully</span> cared for.
          </h1>

          <p className="hs-up hs-d1" style={{ fontSize:17, color:'rgba(255,255,255,.72)', maxWidth:500, lineHeight:1.65, marginBottom:36, fontWeight:500 }}>
            Connect with verified house sitters worldwide. Secure, flexible arrangements — monthly or nightly.
          </p>

          {/* ── search card ── */}
          <div className="hs-up hs-d2" style={{ maxWidth:820 }}>
            {/* stay toggle */}
            <div style={{ display:'flex', marginBottom:0 }}>
              {(['monthly','nightly'] as const).map(m=>(
                <button key={m} onClick={()=>setStayMode(m)} className="hs-btn" style={{
                  padding:'10px 24px', borderRadius:'12px 12px 0 0', fontSize:13, fontWeight:700,
                  background: stayMode===m ? '#fff' : 'rgba(255,255,255,.15)',
                  color: stayMode===m ? G.g800 : 'rgba(255,255,255,.75)',
                  border:'none', marginRight:4,
                }}>{m}</button>
              ))}
            </div>

            <form onSubmit={handleSearch} style={{
              background:'#fff', borderRadius:'0 16px 16px 16px', overflow:'hidden',
              display:'grid', gridTemplateColumns:'1fr 1fr auto',
              boxShadow:'0 16px 64px rgba(0,0,0,.35)',
            }}>
              {/* location */}
              <div style={{ padding:'16px 24px', borderRight:`1px solid ${G.s200}` }}>
                <div style={{ fontSize:10, fontWeight:800, color:G.s400, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:4 }}>Location</div>
                <select value={location} onChange={e=>setLocation(e.target.value)}
                  style={{ width:'100%', border:'none', fontSize:15, color:G.s900, fontWeight:700, background:'transparent' }}>
                  <option value="">Select location</option>
                  {['Nairobi','London','Sydney','New York','Dubai','Singapore','Cape Town','Paris','Toronto','Tokyo'].map(l=><option key={l}>{l}</option>)}
                </select>
              </div>
              {/* budget */}
              <div style={{ padding:'16px 24px', borderRight:`1px solid ${G.s200}` }}>
                <div style={{ fontSize:10, fontWeight:800, color:G.s400, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:4 }}>
                  {stayMode==='monthly'?'Monthly budget':'Nightly rate'}
                </div>
                <select value={budget} onChange={e=>setBudget(e.target.value)}
                  style={{ width:'100%', border:'none', fontSize:15, color:G.s900, fontWeight:700, background:'transparent' }}>
                  <option value="">Set budget</option>
                  {(stayMode==='monthly'
                    ?['Under $1,000','$1,000–$1,500','$1,500–$2,000','$2,000–$3,000','$3,000+']
                    :['Under $80','$80–$120','$120–$180','$180–$250','$250+']
                  ).map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
              <button type="submit" className="hs-btn" style={{
                background:G.g700, color:'#fff', border:'none',
                padding:'0 36px', fontSize:14, fontWeight:900, letterSpacing:'.01em',
              }}>
                Check availability
              </button>
            </form>

            {/* quick filters */}
            <div style={{ display:'flex', gap:10, marginTop:18, flexWrap:'wrap' }}>
              <span style={{ color:'rgba(255,255,255,.45)', fontSize:13, fontWeight:600, lineHeight:'32px' }}>Browse:</span>
              {[['🌟 Premium','premium'],['🐾 Pet friendly','pet-friendly'],['📅 Long term','long-term'],['✓ Verified','verified'],['🏙️ City centre','city']].map(([l,f])=>(
                <button key={f} className="hs-btn" onClick={()=>nav(`/properties?filter=${f}`)} style={{
                  background:'rgba(255,255,255,.1)', border:'1.5px solid rgba(255,255,255,.22)',
                  color:'rgba(255,255,255,.85)', borderRadius:999, padding:'6px 16px', fontSize:13, fontWeight:600,
                }}>{l}</button>
              ))}
            </div>
          </div>

          {/* hero dots */}
          <div style={{ display:'flex', gap:8, marginTop:32 }}>
            {IMGS.hero.map((_,i)=>(
              <button key={i} onClick={()=>{setHeroIdx(i);setHeroAnim(true);}} style={{
                width: heroIdx===i?28:8, height:8, borderRadius:999, border:'none', cursor:'pointer', padding:0,
                background: heroIdx===i ? G.y500 : 'rgba(255,255,255,.35)',
                transition:'all .35s ease',
              }}/>
            ))}
          </div>
        </div>

        {/* scroll hint */}
        <div style={{ position:'absolute', bottom:24, right:48, color:'rgba(255,255,255,.4)', fontSize:12, fontWeight:600, letterSpacing:'.1em', transform:'rotate(90deg)', transformOrigin:'right center' }}>SCROLL ↓</div>
      </section>

      {/* ══ TICKER STRIP ══ */}
      <div style={{ background:G.y500, padding:'11px 0', overflow:'hidden' }}>
        <div className="hs-ticker">
          {[...Array(2)].map((_,ri)=>(
            <span key={ri}>
              {['🏡 Fully Furnished','✓ Verified Sitters','📋 Flexible Contracts','🐾 Pet Friendly','📶 Fast Wifi','🔧 Maintenance Support','🎉 Community Events','🌍 65+ Countries','⭐ 4.8 Rating'].map(item=>(
                <span key={item} style={{ marginRight:52, fontSize:12, fontWeight:800, color:G.g900, letterSpacing:'.06em', textTransform:'uppercase' }}>{item}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ══ HERO TAGLINE + FEATURE CHIPS ══ */}
      <section ref={s1.ref} style={{ padding:'80px 40px', background:G.s100 }}>
        <div style={{ maxWidth:1180, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>

          {/* left */}
          <div className={s1.vis?'hs-up':''} style={{ opacity:s1.vis?1:0 }}>
            <span style={{ ...pill(G.g100, G.g700), marginBottom:12, display:'inline-flex' }}>ABOUT HOWSITTER</span>
            <div style={divider}/>
            <h2 style={{ fontSize:'clamp(26px,3vw,44px)', fontWeight:900, color:G.g900, lineHeight:1.1, letterSpacing:'-.03em', marginBottom:20 }}>
              The most trusted<br/>
              <span style={{ color:G.g700 }}>house sitting</span> network
            </h2>
            <p style={{ fontSize:16, color:G.s500, lineHeight:1.75, marginBottom:28, fontWeight:500 }}>
              We connect verified, background-checked sitters with homeowners who need peace of mind while they're away. Flexible durations, smart matching, and a global community you can trust.
            </p>

            {/* feature chips */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:32 }}>
              {[['🛋️','Fully Furnished'],['🧹','Housekeeping'],['📋','Flex Contracts'],['📶','Fast Wifi'],['🔧','Maintenance'],['🎉','Events & Perks'],['🐾','Pet Friendly'],['✓','ID Verified']].map(([ico,lbl])=>(
                <div key={lbl} className="hs-card" style={{ display:'flex', alignItems:'center', gap:7, background:G.wh, border:`1.5px solid ${G.s200}`, borderRadius:10, padding:'9px 14px', fontSize:13, color:G.s700, fontWeight:700, boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}>
                  <span style={{ fontSize:16 }}>{ico}</span>{lbl}
                </div>
              ))}
            </div>

            {/* rating row */}
            <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
                <span style={{ fontSize:52, fontWeight:900, color:G.g900, lineHeight:1 }}>4.8</span>
                <div>
                  <div style={{ display:'flex', gap:2 }}>{[1,2,3,4,5].map(i=><span key={i} style={{ color:G.y500, fontSize:15 }}>★</span>)}</div>
                  <div style={{ fontSize:12, color:G.s400, fontWeight:600 }}>from 3,200+ reviews</div>
                </div>
              </div>
              {[['🏆','Best Platform\n2024'],['🌍','65+\nCountries'],['🛡️','Verified\nCommunity']].map(([ico,lbl])=>(
                <div key={lbl} style={{ background:G.g100, border:`1.5px solid ${G.g700}`, borderRadius:10, padding:'10px 14px', fontSize:11, fontWeight:800, color:G.g700, textAlign:'center', lineHeight:1.5, whiteSpace:'pre-line' }}>{ico} {lbl}</div>
              ))}
            </div>
          </div>

          {/* right — stacked image collage */}
          <div className={s1.vis?'hs-left':''}  style={{ opacity:s1.vis?1:0, position:'relative' }}>
            {/* main big image */}
            <div className="hs-img-wrap" style={{ borderRadius:22, overflow:'hidden', aspectRatio:'4/3', boxShadow:'0 24px 64px rgba(0,0,0,.18)' }}>
              <img src={IMGS.lifestyle[0]} alt="community" style={{ width:'100%', height:'100%', objectFit:'cover' }}
                onError={e=>{(e.target as HTMLImageElement).src=IMGS.properties[0];}}/>
            </div>
            {/* floating card bottom-left */}
            <div style={{ position:'absolute', bottom:-20, left:-24, background:G.wh, borderRadius:16, padding:'16px 20px', boxShadow:'0 12px 40px rgba(0,0,0,.14)', display:'flex', alignItems:'center', gap:12, minWidth:200 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:G.g100, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>✓</div>
              <div>
                <div style={{ fontWeight:800, color:G.g900, fontSize:14 }}>Verified & Trusted</div>
                <div style={{ fontSize:12, color:G.s400, fontWeight:600 }}>3,200+ successful stays</div>
              </div>
            </div>
            {/* floating pill top-right */}
            <div style={{ position:'absolute', top:-14, right:-14, background:G.y500, borderRadius:14, padding:'10px 18px', boxShadow:'0 8px 28px rgba(245,166,35,.45)', display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ fontSize:22 }}>🌍</div>
              <div>
                <div style={{ fontWeight:900, color:G.g900, fontSize:13 }}>65 countries</div>
                <div style={{ fontSize:11, color:G.g800, fontWeight:600 }}>worldwide network</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ LOVE WHERE YOU LIVE — Masonry image grid ══ */}
      <section ref={s2.ref} style={{ padding:'72px 40px', background:G.wh }}>
        <div style={{ maxWidth:1180, margin:'0 auto' }}>

          <div className={s2.vis?'hs-up':''} style={{ opacity:s2.vis?1:0, display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:36 }}>
            <div>
              <span style={{ ...pill(G.g100, G.g700), marginBottom:10, display:'inline-flex' }}>FEATURED HOMES</span>
              <div style={divider}/>
              <h2 style={{ fontSize:32, fontWeight:900, color:G.g900, letterSpacing:'-.03em' }}>love where you live</h2>
              <p style={{ color:G.s400, fontSize:15, marginTop:6, fontWeight:500 }}>Handpicked homes needing trusted sitters</p>
            </div>
            <button className="hs-btn" onClick={()=>nav('/properties')} style={{ background:'none', border:`2px solid ${G.g700}`, color:G.g700, borderRadius:10, padding:'10px 22px', fontSize:13, fontWeight:800 }}>View all homes →</button>
          </div>

          {/* ── 5-tile masonry grid (exact Cove layout) ── */}
          <div className={s2.vis?'hs-scale':''} style={{ opacity:s2.vis?1:0 }}>
            {loading ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, height:480 }}>
                {[...Array(5)].map((_,i)=><div key={i} className="hs-shimmer" style={{ borderRadius:16, height: i===0?'100%':240 }}/>)}
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gridTemplateRows:'240px 240px', gap:12 }}>
                {/* big left */}
                <PropertyThumb p={props[0]} idx={0} nav={nav} style={{ gridRow:'1/3' }}/>
                {/* 4 small */}
                {[1,2,3,4].map(i=><PropertyThumb key={i} p={props[i]} idx={i} nav={nav} style={{}}/>)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══ BROWSE DEALS — card list with stay toggle + tier filters ══ */}
      <section ref={s3.ref} style={{ padding:'72px 40px', background:G.s100 }}>
        <div style={{ maxWidth:1180, margin:'0 auto' }}>
          <div className={s3.vis?'hs-up':''} style={{ opacity:s3.vis?1:0 }}>

            {/* header row */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:28, flexWrap:'wrap', gap:16 }}>
              <div>
                <span style={{ ...pill(G.g100, G.g700), marginBottom:10, display:'inline-flex' }}>BROWSE LISTINGS</span>
                <div style={divider}/>
                <h2 style={{ fontSize:32, fontWeight:900, color:G.g900, letterSpacing:'-.03em' }}>browse the best listings</h2>
                <p style={{ color:G.s400, fontSize:15, marginTop:6, fontWeight:500 }}>Properties & sitters at special rates</p>
              </div>

              {/* tab toggle */}
              <div style={{ display:'flex', background:G.wh, borderRadius:999, padding:4, gap:4, border:`1.5px solid ${G.s200}` }}>
                {(['properties','sitters'] as const).map(t=>(
                  <button key={t} onClick={()=>setTab(t)} className="hs-btn" style={{
                    padding:'9px 26px', borderRadius:999, border:'none',
                    background: tab===t ? G.g900 : 'transparent',
                    color: tab===t ? '#fff' : G.s500,
                    fontWeight:700, fontSize:14,
                  }}>{t==='properties'?'🏡 Properties':'👤 Sitters'}</button>
                ))}
              </div>
            </div>

            {/* cards */}
            {tab==='properties' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:18 }}>
                {loading ? [...Array(6)].map((_,i)=><SkeletonCard key={i} h={360}/>) :
                  props.length>0 ? props.map((p,i)=><PropertyCard key={p.id} p={p} i={i} nav={nav} stayMode={stayMode}/>) :
                  <EmptyState icon="🏡" msg="No properties at the moment" onRetry={fetchData}/>}
              </div>
            )}
            {tab==='sitters' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:18 }}>
                {loading ? [...Array(4)].map((_,i)=><SkeletonCard key={i} h={320}/>) :
                  sitters.length>0 ? sitters.map(s=><SitterCard key={s.id} s={s} nav={nav} safeRating={safeRating}/>) :
                  <EmptyState icon="👤" msg="No sitters at the moment" onRetry={fetchData}/>}
              </div>
            )}

            <div style={{ textAlign:'center', marginTop:44 }}>
              <button className="hs-btn" onClick={()=>nav(tab==='properties'?'/properties':'/sitters')} style={{
                background:'transparent', border:`2px solid ${G.g900}`, borderRadius:999,
                padding:'13px 44px', fontSize:14, fontWeight:800, color:G.g900,
              }}>View all {tab} →</button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <StatsBar stats={stats}/>

      {/* ══ LIFESTYLE PHOTO BREAK — full bleed with 3-col images ══ */}
      <section ref={s4.ref} style={{ overflow:'hidden' }}>
        <div className={s4.vis?'hs-scale':''} style={{ opacity:s4.vis?1:0, display:'grid', gridTemplateColumns:'repeat(3,1fr)', height:360 }}>
          {IMGS.lifestyle.map((src,i)=>(
            <div key={i} className="hs-img-wrap" style={{ overflow:'hidden', position:'relative' }}>
              <img src={src} alt="lifestyle" style={{ width:'100%', height:'100%', objectFit:'cover' }}
                onError={e=>{(e.target as HTMLImageElement).src=IMGS.properties[i+6];}}/>
              <div style={{ position:'absolute', inset:0, background:`linear-gradient(to bottom, transparent 40%, rgba(13,61,36,.5) 100%)` }}/>
              {i===1 && (
                <div style={{ position:'absolute', bottom:24, left:0, right:0, textAlign:'center' }}>
                  <div style={{ color:'#fff', fontSize:20, fontWeight:900, letterSpacing:'-.02em' }}>Live like a local</div>
                  <div style={{ color:'rgba(255,255,255,.7)', fontSize:13, fontWeight:500, marginTop:4 }}>in 65+ countries worldwide</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section ref={s5.ref} style={{ padding:'80px 40px', background:G.wh }}>
        <div style={{ maxWidth:1180, margin:'0 auto' }}>
          <div className={s5.vis?'hs-up':''} style={{ opacity:s5.vis?1:0, textAlign:'center', marginBottom:56 }}>
            <span style={{ ...pill(G.g100, G.g700), marginBottom:12, display:'inline-flex' }}>THE PROCESS</span>
            <div style={{ ...divider, margin:'12px auto 20px' }}/>
            <h2 style={{ fontSize:34, fontWeight:900, color:G.g900, letterSpacing:'-.03em' }}>How house sitting works</h2>
            <p style={{ color:G.s400, fontSize:16, marginTop:10, fontWeight:500 }}>Three simple steps from discovery to peace of mind</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
            {[
              { n:'01', ico:'🔍', title:'Discover & Search', desc:'Browse hundreds of verified homes and trusted sitters. Filter by location, dates, budget, pet-friendliness, and more.', img:IMGS.properties[2], delay:'0s' },
              { n:'02', ico:'🤝', title:'Connect & Verify',  desc:'Schedule video calls, review verified IDs and references, sign digital agreements — all securely on-platform.', img:IMGS.properties[4], delay:'.12s' },
              { n:'03', ico:'🏡', title:'Relax & Enjoy',     desc:'Your sitter moves in. Receive daily photo updates, real-time chat, and 24/7 concierge support throughout the stay.', img:IMGS.properties[6], delay:'.24s' },
            ].map(st=>(
              <div key={st.n} className={`hs-card ${s5.vis?'hs-up':''}`} style={{
                background:G.s100, borderRadius:20, overflow:'hidden',
                border:`1.5px solid ${G.s200}`, opacity:s5.vis?1:0, animationDelay:st.delay,
                boxShadow:'0 2px 8px rgba(0,0,0,.06)',
              }}>
                <div className="hs-img-wrap" style={{ height:180, overflow:'hidden' }}>
                  <img src={st.img} alt={st.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    onError={e=>{(e.target as HTMLImageElement).src=IMGS.properties[0];}}/>
                </div>
                <div style={{ padding:28 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                    <div style={{ width:42, height:42, borderRadius:12, background:G.g100, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{st.ico}</div>
                    <div style={{ fontSize:11, color:G.g700, fontWeight:800, textTransform:'uppercase', letterSpacing:'.1em' }}>Step {st.n}</div>
                    <div style={{ marginLeft:'auto', fontSize:48, fontWeight:900, color:'rgba(0,0,0,.04)', lineHeight:1 }}>{st.n}</div>
                  </div>
                  <h3 style={{ fontSize:18, fontWeight:800, color:G.g900, marginBottom:10 }}>{st.title}</h3>
                  <p style={{ fontSize:14, color:G.s500, lineHeight:1.7, fontWeight:500 }}>{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ IMAGE GALLERY STRIP (6-wide scroll) ══ */}
      <section ref={s6.ref} style={{ padding:'60px 0 60px 40px', background:G.s100, overflow:'hidden' }}>
        <div style={{ maxWidth:1180, marginBottom:28, paddingRight:40, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
          <div className={s6.vis?'hs-up':''} style={{ opacity:s6.vis?1:0 }}>
            <span style={{ ...pill(G.y100, '#92400E'), marginBottom:10, display:'inline-flex' }}>PHOTO GALLERY</span>
            <div style={divider}/>
            <h2 style={{ fontSize:30, fontWeight:900, color:G.g900, letterSpacing:'-.03em' }}>Homes you'll love</h2>
          </div>
          <button className="hs-btn" onClick={()=>nav('/properties')} style={{ background:'none', border:`2px solid ${G.s200}`, color:G.s700, borderRadius:10, padding:'9px 18px', fontSize:13, fontWeight:700 }}>Browse all →</button>
        </div>

        {/* horizontally scrollable gallery */}
        <div style={{ display:'flex', gap:14, overflowX:'auto', paddingRight:40, paddingBottom:8 }}>
          {IMGS.properties.map((src,i)=>(
            <div key={i} className="hs-img-wrap hs-card"
              onClick={()=>props[i]&&nav(`/properties/${props[i].id}`)}
              style={{ minWidth: i%3===0?280:220, height:200, borderRadius:16, overflow:'hidden', flexShrink:0, cursor:'pointer', boxShadow:'0 4px 16px rgba(0,0,0,.10)', position:'relative' }}>
              <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}
                onError={e=>{(e.target as HTMLImageElement).src=IMGS.properties[i%6];}}/>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 50%)' }}/>
              {props[i] && (
                <div style={{ position:'absolute', bottom:12, left:12, right:12 }}>
                  <div style={{ color:'#fff', fontWeight:800, fontSize:13 }}>{props[i].title}</div>
                  {props[i].city && <span style={{ ...pill('rgba(255,255,255,.15)','#fff',{ fontSize:11, backdropFilter:'blur(4px)' }) }}>📍 {props[i].city}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══ WORLD MAP ══ */}
      <section ref={s7.ref} style={{ padding:'72px 40px', background:G.wh }}>
        <div style={{ maxWidth:1180, margin:'0 auto' }}>
          <div className={s7.vis?'hs-up':''} style={{ opacity:s7.vis?1:0, textAlign:'center', marginBottom:36 }}>
            <span style={{ ...pill(G.y100,'#92400E'), marginBottom:12, display:'inline-flex' }}>🌍 GLOBAL NETWORK</span>
            <div style={{ ...divider, margin:'12px auto 16px' }}/>
            <h2 style={{ fontSize:32, fontWeight:900, color:G.g900, letterSpacing:'-.03em' }}>House sitting, everywhere</h2>
            <p style={{ color:G.s400, fontSize:15, marginTop:8, fontWeight:500 }}>Properties and sitters across 65+ countries</p>
          </div>
          <div style={{ borderRadius:22, overflow:'hidden', border:`1.5px solid ${G.s200}`, boxShadow:'0 8px 40px rgba(0,0,0,.08)' }}>
            <WorldMap showProperties showSitters height="460px"/>
          </div>
          <div style={{ textAlign:'center', marginTop:20 }}>
            <Link to="/world-map" style={{ color:G.g700, fontWeight:800, fontSize:14, textDecoration:'none' }}>Explore full map →</Link>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section ref={s8.ref} style={{ padding:'80px 40px', background:G.g900, position:'relative', overflow:'hidden' }}>
        {/* decorative circles */}
        <div style={{ position:'absolute', top:-100, right:-100, width:400, height:400, borderRadius:'50%', background:'rgba(245,166,35,.06)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-80, left:-60, width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,.03)', pointerEvents:'none' }}/>

        <div style={{ maxWidth:1180, margin:'0 auto' }}>
          <div className={s8.vis?'hs-up':''} style={{ opacity:s8.vis?1:0, textAlign:'center', marginBottom:52 }}>
            <span style={{ ...pill(G.y500, G.g900), marginBottom:14, display:'inline-flex' }}>COMMUNITY STORIES</span>
            <div style={{ ...divider, margin:'12px auto 18px', background:'rgba(255,255,255,.2)' }}/>
            <h2 style={{ fontSize:34, fontWeight:900, color:'#fff', letterSpacing:'-.03em' }}>Trusted by thousands worldwide</h2>
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:6, marginTop:10 }}>
              {[1,2,3,4,5].map(i=><span key={i} style={{ color:G.y500, fontSize:17 }}>★</span>)}
              <span style={{ fontSize:14, color:'rgba(255,255,255,.5)', marginLeft:6, fontWeight:600 }}>4.8 · 3,200+ reviews</span>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {[
              { name:'Sarah Chen',      role:'Homeowner · Nairobi',    flag:'🇰🇪', q:'Found the perfect sitter for my 3-month trip. Daily updates gave me complete peace of mind. Howsitter is genuinely different from anything else out there.',  delay:'0s'   },
              { name:'James Wilson',    role:'Digital Nomad · Sydney',  flag:'🇦🇺', q:'House sitting let me live like a local in 8 countries this year. The verified community makes every arrangement feel completely safe and professional.',         delay:'.1s'  },
              { name:'Maria Rodriguez', role:'Student · London',        flag:'🇬🇧', q:'Fully furnished, fast wifi, housekeeping included. The flexible contract meant I could focus entirely on my studies without any of the usual rental headaches.',    delay:'.2s'  },
            ].map((t,i)=>(
              <div key={i} className={`hs-card ${s8.vis?'hs-up':''}`} style={{
                background:'rgba(255,255,255,.06)', backdropFilter:'blur(8px)',
                borderRadius:20, padding:30, border:'1.5px solid rgba(255,255,255,.1)',
                opacity:s8.vis?1:0, animationDelay:t.delay,
              }}>
                <div style={{ display:'flex', gap:2, marginBottom:14 }}>
                  {[1,2,3,4,5].map(j=><span key={j} style={{ color:G.y500, fontSize:14 }}>★</span>)}
                </div>
                <p style={{ fontSize:15, color:'rgba(255,255,255,.8)', lineHeight:1.72, marginBottom:24, fontWeight:500, fontStyle:'italic' }}>
                  "{t.q}"
                </p>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:46, height:46, borderRadius:'50%', background:G.g100, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{t.flag}</div>
                  <div>
                    <div style={{ color:'#fff', fontWeight:800, fontSize:14 }}>{t.name}</div>
                    <div style={{ color:'rgba(255,255,255,.45)', fontSize:12, fontWeight:500 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══ */}
      <section style={{ padding:'88px 40px', background:G.y500, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-80, left:-80, width:320, height:320, borderRadius:'50%', background:'rgba(255,255,255,.14)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-100, right:-60, width:360, height:360, borderRadius:'50%', background:'rgba(255,255,255,.08)', pointerEvents:'none' }}/>
        <div style={{ maxWidth:660, margin:'0 auto', textAlign:'center', position:'relative', zIndex:1 }}>
          <span style={{ ...pill('rgba(13,61,36,.12)', G.g900), marginBottom:16, display:'inline-flex' }}>GET STARTED</span>
          <h2 style={{ fontSize:'clamp(28px,4vw,52px)', fontWeight:900, color:G.g900, marginBottom:16, letterSpacing:'-.04em', lineHeight:1.08 }}>
            Ready to find your<br/>perfect match?
          </h2>
          <p style={{ fontSize:17, color:'rgba(13,61,36,.7)', marginBottom:44, lineHeight:1.65, fontWeight:600 }}>
            Join thousands of homeowners and sitters who trust Howsitter for secure, flexible, stress-free arrangements.
          </p>
          <div style={{ display:'flex', justifyContent:'center', gap:14, flexWrap:'wrap', marginBottom:36 }}>
            <button className="hs-btn" onClick={()=>nav('/properties')} style={{
              background:G.g900, color:'#fff', border:'none', borderRadius:12,
              padding:'17px 44px', fontSize:15, fontWeight:900,
              boxShadow:'0 10px 32px rgba(13,61,36,.35)',
            }}>Browse homes</button>
            <button className="hs-btn" onClick={()=>nav('/register')} style={{
              background:'#fff', color:G.g900, border:`2px solid ${G.g900}`,
              borderRadius:12, padding:'17px 44px', fontSize:15, fontWeight:900,
            }}>Create free account</button>
          </div>
          <div style={{ display:'flex', justifyContent:'center', gap:40 }}>
            {[['4.8★','Avg Rating'],['98%','Satisfaction'],['24/7','Support']].map(([v,l])=>(
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ fontSize:24, fontWeight:900, color:G.g900 }}>{v}</div>
                <div style={{ fontSize:12, color:'rgba(13,61,36,.55)', fontWeight:700 }}>{l}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize:12, color:'rgba(13,61,36,.45)', marginTop:24, fontWeight:600 }}>No credit card · Free to browse · Verified community</p>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background:'#0A1628', padding:'56px 40px 28px', fontFamily:G.f }}>
        <div style={{ maxWidth:1180, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2.4fr 1fr 1fr 1fr', gap:48, marginBottom:44 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
                <svg width="30" height="30" viewBox="0 0 34 34" fill="none"><rect width="34" height="34" rx="9" fill={G.y500}/><path d="M17 7L8 14v13h6v-8h6v8h6V14z" fill={G.g900}/></svg>
                <span style={{ color:'#fff', fontWeight:900, fontSize:16 }}>howsitter</span>
              </div>
              <p style={{ color:'rgba(255,255,255,.35)', fontSize:13, lineHeight:1.72, maxWidth:260, marginBottom:22, fontWeight:500 }}>
                Connecting verified house sitters with homeowners worldwide. Flexible, secure arrangements with genuine peace of mind.
              </p>
              <div style={{ display:'flex', gap:8 }}>
                {['🇰🇪','🇬🇧','🇺🇸','🇦🇺','🇸🇬','🇿🇦'].map(f=>(
                  <span key={f} style={{ fontSize:20, cursor:'pointer', opacity:.6, transition:'opacity .2s' }}
                    onMouseEnter={e=>(e.currentTarget.style.opacity='1')}
                    onMouseLeave={e=>(e.currentTarget.style.opacity='.6')}
                  >{f}</span>
                ))}
              </div>
            </div>
            {[
              { head:'Platform', links:['Browse Homes','Find Sitters','List Property','How It Works','Pricing'] },
              { head:'Company',  links:['About Us','Careers','Press','Blog','Partners'] },
              { head:'Legal',    links:['Privacy Policy','Terms of Use','Safety','Cookie Policy','Contact'] },
            ].map(col=>(
              <div key={col.head}>
                <div style={{ color:'rgba(255,255,255,.6)', fontWeight:800, fontSize:11, textTransform:'uppercase', letterSpacing:'.12em', marginBottom:16 }}>{col.head}</div>
                {col.links.map(l=>(
                  <div key={l} style={{ color:'rgba(255,255,255,.35)', fontSize:13, marginBottom:10, cursor:'pointer', fontWeight:500, transition:'color .15s' }}
                    onMouseEnter={e=>(e.currentTarget.style.color='rgba(255,255,255,.8)')}
                    onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,.35)')}
                  >{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,.07)', paddingTop:22, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ color:'rgba(255,255,255,.22)', fontSize:12, fontWeight:500 }}>© 2025 Howsitter. All rights reserved.</span>
            <span style={{ color:'rgba(255,255,255,.22)', fontSize:12, fontWeight:500 }}>Made with ♥ by the Howsitter team</span>
          </div>
        </div>
      </footer>

      {/* FAB */}
      <button className="hs-btn" onClick={()=>nav('/list-property')} aria-label="List property"
        style={{ position:'fixed', bottom:28, right:28, width:52, height:52, borderRadius:'50%', background:G.g700, color:'#fff', border:'none', fontSize:22, boxShadow:'0 6px 20px rgba(30,107,69,.5)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900 }}>
        +
      </button>
    </div>
  );
};

/* ══ PropertyThumb — for the masonry grid ══ */
const PropertyThumb: React.FC<{ p: Property|undefined; idx: number; nav: any; style: React.CSSProperties }> = ({ p, idx, nav, style }) => {
  const src = p?.primary_image || IMGS.properties[idx % IMGS.properties.length];
  return (
    <div className="hs-img-wrap hs-card"
      onClick={()=>p&&nav(`/properties/${p.id}`)}
      style={{ borderRadius:18, overflow:'hidden', position:'relative', boxShadow:'0 4px 20px rgba(0,0,0,.12)', ...style }}>
      <img src={src} alt={p?.title||'Property'}
        style={{ width:'100%', height:'100%', objectFit:'cover' }}
        onError={e=>{(e.target as HTMLImageElement).src=IMGS.properties[idx%IMGS.properties.length];}}/>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,.62) 0%, transparent 55%)' }}/>
      <div style={{ position:'absolute', bottom:16, left:16, right:16 }}>
        <div style={{ color:'#fff', fontWeight:800, fontSize:15, marginBottom:5 }}>{p?.title||`Property ${idx+1}`}</div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          {p?.city && <span style={{ ...pill('rgba(255,255,255,.18)','#fff',{ fontSize:11, backdropFilter:'blur(4px)' }) }}>📍 {p.city}</span>}
          {p?.status==='available' && <span style={{ ...pill('rgba(46,213,115,.25)','#86EFAC',{ fontSize:11 }) }}>● available</span>}
          {p?.price_per_month && <span style={{ ...pill('rgba(245,166,35,.25)', G.y500, { fontSize:11 }) }}>${p.price_per_month.toLocaleString()}/mo</span>}
        </div>
      </div>
    </div>
  );
};

/* ══ PropertyCard — horizontal listing card ══ */
const PropertyCard: React.FC<{ p: Property; i: number; nav: any; stayMode: string }> = ({ p, i, nav, stayMode }) => {
  const [saved, setSaved] = useState(false);
  const [imgI,  setImgI]  = useState(0);
  const allImgs = p.primary_image ? [p.primary_image, ...IMGS.properties.slice(0,3)] : IMGS.properties.slice(i%8, i%8+4);
  const price = stayMode==='nightly' ? Math.round(p.price_per_month/30) : p.price_per_month;
  const orig  = Math.round(price*1.08);

  return (
    <div className="hs-card" style={{ background:G.wh, borderRadius:18, border:`1.5px solid ${G.s200}`, overflow:'hidden', boxShadow:'0 2px 10px rgba(0,0,0,.06)' }}
      onClick={()=>nav(`/properties/${p.id}`)}>
      {/* image + thumbs */}
      <div className="hs-img-wrap" style={{ position:'relative', height:210, overflow:'hidden' }}>
        <img src={allImgs[imgI]} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}
          onError={e=>{(e.target as HTMLImageElement).src=IMGS.properties[i%IMGS.properties.length];}}/>
        {/* tier badge */}
        <div style={{ ...pill(p.price_per_month>2000?'#7C3AED':p.price_per_month>1400?G.g700:G.s500,'#fff'), position:'absolute', top:12, left:12 }}>
          {p.price_per_month>2000?'premium':p.price_per_month>1400?'standard':'basic'}
        </div>
        {/* save btn */}
        <button onClick={e=>{e.stopPropagation();setSaved(!saved);}} className="hs-btn"
          style={{ position:'absolute', top:10, right:10, background:'rgba(255,255,255,.88)', border:'none', borderRadius:'50%', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>
          {saved?'❤️':'🤍'}
        </button>
        {/* thumb strip */}
        <div style={{ position:'absolute', bottom:8, left:8, display:'flex', gap:4 }}>
          {allImgs.slice(0,4).map((src,j)=>(
            <div key={j} onClick={e=>{e.stopPropagation();setImgI(j);}}
              style={{ width:34, height:25, borderRadius:5, overflow:'hidden', border: imgI===j?'2px solid #fff':'1.5px solid rgba(255,255,255,.4)', cursor:'pointer', flexShrink:0 }}>
              <img src={src} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                onError={e=>{(e.target as HTMLImageElement).src=IMGS.properties[j%IMGS.properties.length];}}/>
            </div>
          ))}
        </div>
      </div>

      {/* content */}
      <div style={{ padding:'18px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
          <h3 style={{ fontSize:16, fontWeight:800, color:G.g900, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</h3>
          <div style={{ textAlign:'right', flexShrink:0, marginLeft:12 }}>
            <div style={{ fontSize:19, fontWeight:900, color:G.g900 }}>${price.toLocaleString()}</div>
            <div style={{ fontSize:11, color:G.s400, textDecoration:'line-through' }}>${orig.toLocaleString()}</div>
          </div>
        </div>
        <div style={{ fontSize:13, color:G.s400, marginBottom:10, fontWeight:500 }}>{p.bedrooms}bd · {p.bathrooms}ba · {p.city}</div>
        <div style={{ display:'flex', gap:7, marginBottom:12, flexWrap:'wrap' }}>
          <span style={{ ...pill(G.g100,G.g700,{fontSize:11}) }}>📍 {p.location||p.city}</span>
          {p.status==='available'&&<span style={{ ...pill('#DCFCE7','#166534',{fontSize:11}) }}>● available</span>}
        </div>
        <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
          {(p.amenities||['WiFi','Furnished','Pets OK']).slice(0,3).map(a=>(
            <span key={a} style={{ fontSize:11, color:G.s500, background:G.s100, border:`1px solid ${G.s200}`, borderRadius:6, padding:'3px 9px', fontWeight:600 }}>{a}</span>
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:14, borderTop:`1px solid ${G.s200}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:30, height:30, borderRadius:'50%', background:G.g100, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:G.g700 }}>{(p.homeowner_name||'H')[0]}</div>
            <div>
              <div style={{ fontSize:10, color:G.s400, fontWeight:600 }}>Hosted by</div>
              <div style={{ fontSize:12, fontWeight:700, color:G.g900 }}>{p.homeowner_name||'Homeowner'}</div>
            </div>
          </div>
          <button className="hs-btn" onClick={e=>{e.stopPropagation();nav(`/properties/${p.id}`);}} style={{ background:G.g900, color:'#fff', border:'none', borderRadius:9, padding:'8px 18px', fontSize:12, fontWeight:800 }}>View →</button>
        </div>
      </div>
    </div>
  );
};

/* ══ SitterCard ══ */
const SitterCard: React.FC<{ s: Sitter; nav: any; safeRating: (r:any)=>number }> = ({ s, nav, safeRating }) => {
  const [saved, setSaved] = useState(false);
  const rating = safeRating(s.avg_rating);
  return (
    <div className="hs-card" onClick={()=>nav(`/sitters/${s.id}`)}
      style={{ background:G.wh, borderRadius:18, border:`1.5px solid ${G.s200}`, padding:24, position:'relative', boxShadow:'0 2px 10px rgba(0,0,0,.05)' }}>
      <button onClick={e=>{e.stopPropagation();setSaved(!saved);}} className="hs-btn"
        style={{ position:'absolute', top:12, right:12, background:'none', border:'none', fontSize:16 }}>
        {saved?'❤️':'🤍'}
      </button>
      <div style={{ display:'flex', gap:12, marginBottom:14 }}>
        <div style={{ position:'relative', flexShrink:0 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', overflow:'hidden', border:`2.5px solid ${G.s200}` }}>
            {s.avatar
              ?<img src={s.avatar} alt={s.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                  onError={e=>{(e.target as HTMLImageElement).src=`https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=1E6B45&color=fff`;}}/>
              :<div style={{ width:'100%', height:'100%', background:`linear-gradient(135deg,${G.g700},${G.g800})`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:22 }}>{s.name[0]}</div>
            }
          </div>
          {s.is_online&&<div style={{ position:'absolute', bottom:1, right:1, width:12, height:12, borderRadius:'50%', background:'#10B981', border:'2px solid #fff' }}/>}
        </div>
        <div style={{ paddingTop:2 }}>
          <div style={{ fontWeight:800, color:G.g900, fontSize:15 }}>{s.name}</div>
          {s.is_verified&&<span style={{ ...pill(G.g100,G.g700,{fontSize:11,padding:'2px 9px',marginTop:4,display:'inline-flex'}) }}>✓ Verified</span>}
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:10 }}>
        {[1,2,3,4,5].map(j=><span key={j} style={{ color:j<=Math.floor(rating)?G.y500:G.s200, fontSize:13 }}>★</span>)}
        <span style={{ fontSize:13, fontWeight:800, color:G.g900 }}>{rating.toFixed(1)}</span>
        <span style={{ fontSize:12, color:G.s400, fontWeight:500 }}>({s.total_reviews||0})</span>
      </div>
      {s.experience_years&&<div style={{ fontSize:12, color:G.s500, marginBottom:3, fontWeight:500 }}>📅 {s.experience_years} yrs experience</div>}
      {s.location&&<div style={{ fontSize:12, color:G.s500, marginBottom:12, fontWeight:500 }}>📍 {s.location}</div>}
      {s.skills?.length>0&&(
        <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:14 }}>
          {s.skills.slice(0,3).map((sk,i)=>(
            <span key={i} style={{ fontSize:11, background:G.s100, color:G.s700, borderRadius:5, padding:'3px 8px', fontWeight:600 }}>{sk}</span>
          ))}
        </div>
      )}
      <button className="hs-btn" style={{ width:'100%', padding:10, background:'transparent', border:`2px solid ${G.g900}`, borderRadius:9, fontSize:13, fontWeight:800, color:G.g900 }}
        onMouseEnter={e=>{e.currentTarget.style.background=G.g900;e.currentTarget.style.color='#fff';}}
        onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=G.g900;}}>
        View profile →
      </button>
    </div>
  );
};

/* ══ StatsBar ══ */
const StatsBar: React.FC<{ stats: Stats|null }> = ({ stats }) => {
  const { ref, vis } = useInView();
  return (
    <section ref={ref} style={{ background:G.g900, padding:'44px 40px' }}>
      <div style={{ maxWidth:1180, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', textAlign:'center' }}>
        {(stats?[
          { v:`${stats.properties.toLocaleString()}+`, l:'Homes listed' },
          { v:`${stats.sitters.toLocaleString()}+`,    l:'Verified sitters' },
          { v:`${stats.countries}`,                    l:'Countries' },
          { v:`${stats.stays.toLocaleString()}+`,      l:'Successful stays' },
        ]:[{},{},{},{}]).map((s:any,i)=>(
          <div key={i} className={vis?`hs-up`:''} style={{ padding:8, borderRight:i<3?`1px solid rgba(255,255,255,.09)`:'none', opacity:vis?1:0, animationDelay:`${i*.1}s` }}>
            {s.v?<>
              <div style={{ fontSize:42, fontWeight:900, color:G.y500, lineHeight:1, marginBottom:6 }}>{s.v}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.45)', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:700 }}>{s.l}</div>
            </>:<div className="hs-shimmer" style={{ height:60, borderRadius:8 }}/>}
          </div>
        ))}
      </div>
    </section>
  );
};

/* ── micro helpers ── */
const SkeletonCard: React.FC<{ h: number }> = ({ h }) => (
  <div className="hs-shimmer" style={{ height:h, borderRadius:18 }}/>
);
const EmptyState: React.FC<{ icon:string; msg:string; onRetry:()=>void }> = ({ icon, msg, onRetry }) => (
  <div style={{ textAlign:'center', padding:60, color:G.s500, gridColumn:'1/-1' }}>
    <div style={{ fontSize:44, marginBottom:14 }}>{icon}</div>
    <p style={{ marginBottom:18, fontWeight:600 }}>{msg}</p>
    <button className="hs-btn" onClick={onRetry} style={{ background:G.g700, color:'#fff', border:'none', borderRadius:10, padding:'10px 28px', fontWeight:800 }}>Refresh</button>
  </div>
);

export default Home;
