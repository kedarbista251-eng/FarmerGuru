import React, { useState, useEffect } from 'react';
import FarmProfile from './components/FarmProfile';
import VoiceRadio from './components/VoiceRadio';
import WeatherRisk from './components/WeatherRisk';
import CropAdvisor from './components/CropAdvisor';
import Marketplace from './components/Marketplace';
import SpecialistCommunity from './components/SpecialistCommunity';
import LoanSchemes from './components/LoanSchemes';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import './App.css';

const FARMING_TIPS = [
  { text: "Good farming starts with a clear next step.", sub: "Weather, crops, market decisions and expert help, all gathered around your farm." },
  { text: "Odisha Tip: Intercrop Ragi with Pigeon Pea for natural Nitrogen fixation.", sub: "Saves up to 70% water compared to paddy while preventing soil degradation." },
  { text: "National Fact: PM-KISAN direct transfers reach over 9.4 Crore farmer families.", sub: "Ensure your e-KYC is updated on pmkisan.gov.in for direct bank disbursements." },
  { text: "Weather Insight: Delay pesticide spray if surface wind exceeds 18 km/h.", sub: "High winds drift chemical sprays and reduce foliar absorption efficiency." },
  { text: "Soil Health Tip: Apply Gypsum during groundnut pegging stage.", sub: "Enhances pod development and oil content in sandy loam soil." }
];

const WEATHER_WALLPAPERS = {
  sunny: {
    bg: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop',
    icon: '☀️',
    outlook: 'Clear & Calm',
    detail: 'Optimal day for field work & spraying'
  },
  rainy: {
    bg: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1200&auto=format&fit=crop',
    icon: '🌧️',
    outlook: 'Rain Showers Likely',
    detail: 'Ensure field drainage channels are clear'
  },
  thunderstorm: {
    bg: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80&w=1200&auto=format&fit=crop',
    icon: '⛈️',
    outlook: 'Storm Warning',
    detail: 'Secure livestock & halt field machinery'
  },
  cloudy: {
    bg: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1200&auto=format&fit=crop',
    icon: '⛅',
    outlook: 'Partly Cloudy',
    detail: 'Favorable for land preparation & sowing'
  }
};

const modules = [
  { id: 'profile', icon: '🧑‍🌾', title: 'Farm Profile', copy: 'Keep farm details ready for better advice.', image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=900&auto=format&fit=crop', tone: 'leaf' },
  { id: 'radio', icon: '🎙️', title: 'Kisan Mitra', copy: 'Speak or type for quick farm guidance.', image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=900&auto=format&fit=crop', tone: 'sun' },
  { id: 'weather', icon: '⛅', title: 'Weather & Risk', copy: 'Plan around conditions and price signals.', image: 'https://images.unsplash.com/photo-1561484930-998b6a7b22e8?q=80&w=900&auto=format&fit=crop', tone: 'sky' },
  { id: 'crops', icon: '🌱', title: 'Crop Advisor', copy: 'Find crops that suit your land and season.', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=900&auto=format&fit=crop', tone: 'leaf' },
  { id: 'market', icon: '🛒', title: 'Marketplace', copy: 'Buy inputs and follow local price movement.', image: 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?q=80&w=900&auto=format&fit=crop', tone: 'sun' },
  { id: 'specialist', icon: '💬', title: 'Community', copy: 'Ask specialists and learn from farmers.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=900&auto=format&fit=crop', tone: 'sky' },
  { id: 'loans', icon: '📋', title: 'Schemes & Loans', copy: 'Explore support made for farm households.', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=900&auto=format&fit=crop', tone: 'leaf' },
];

export default function App() {
  const { user, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [tipIndex, setTipIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [weatherCondition, setWeatherCondition] = useState('sunny');

  // Dynamic Rotating Tagline & Tip Interval (Smooth In-and-Out Animation)
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Trigger fade out
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % FARMING_TIPS.length);
        setFade(true); // Trigger fade in
      }, 500);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Fetch Real Live Weather to Set Background Wallpaper Dynamically
  useEffect(() => {
    async function fetchAtmosphere() {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=22.2604&longitude=84.8536&current=weather_code&daily=precipitation_probability_max&timezone=auto'
        );
        const data = await res.json();
        const code = data.current?.weather_code || 0;
        const rainProb = data.daily?.precipitation_probability_max?.[0] || 0;

        if (code >= 95) setWeatherCondition('thunderstorm');
        else if (code >= 51 || rainProb > 60) setWeatherCondition('rainy');
        else if (code >= 1 && code <= 3) setWeatherCondition('cloudy');
        else setWeatherCondition('sunny');
      } catch (e) {
        console.warn('Weather wallpaper sync fallback:', e);
      }
    }

    fetchAtmosphere();
  }, []);

  const activeModule = modules.find((module) => module.id === activePage);
  const currentWallpaper = WEATHER_WALLPAPERS[weatherCondition] || WEATHER_WALLPAPERS.sunny;
  const currentTip = FARMING_TIPS[tipIndex];

  const pages = { 
    profile: <FarmProfile />, 
    radio: <VoiceRadio />, 
    weather: <WeatherRisk />, 
    crops: <CropAdvisor />, 
    market: <Marketplace />, 
    specialist: <SpecialistCommunity />, 
    loans: <LoanSchemes /> 
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand" onClick={() => setActivePage('home')} aria-label="Go to FarmGuru dashboard">
            <span className="brand-mark">FG</span>
            <span className="brand-text">
              <strong>FarmGuru</strong>
              <small>your field companion</small>
            </span>
          </button>
          
          <div className="header-actions">
            <div className="header-status" style={{ display: 'flex', alignItems: 'center' }}>
              <span className="status-dot" /> 
              <span className="status-text">Farm status: steady</span>
              {user ? (
                <div className="user-profile-menu" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginLeft: '15px' }}>
                  <span className="user-name-tag" style={{ color: '#d1fae5', fontSize: '12px' }}>{user.full_name || user.email}</span>
                  <button className="btn-logout" onClick={logout} style={{ background: 'transparent', border: '1px solid #d1fae5', color: '#d1fae5', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Sign Out</button>
                </div>
              ) : (
                <button className="btn-signin" onClick={() => setIsAuthOpen(true)} style={{ marginLeft: '15px', background: '#fbbf24', color: '#064e3b', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Sign In</button>
              )}
            </div>
            {activePage !== 'home' && (
              <button className="back-button" onClick={() => setActivePage('home')}>
                ← <span className="back-text">Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        {activePage === 'home' ? (
          <div className="dashboard page-enter">
            
            {/* Weather-Aware Hero Banner with Dynamic Rotating Tagline */}
            <section 
              className="dashboard-hero"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(6,78,59,0.88), rgba(4,120,87,0.78)), url('${currentWallpaper.bg}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'background-image 1s ease-in-out',
                borderRadius: '24px',
                padding: '36px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.12)'
              }}
            >
              <div className="hero-copy">
                <p className="eyebrow" style={{ color: '#a7f3d0', fontWeight: '800' }}>
                  A smarter day in the field • Odisha & India Telemetry
                </p>

                {/* Animated Dynamic Text Container */}
                <div style={{
                  minHeight: '120px',
                  opacity: fade ? 1 : 0,
                  transform: fade ? 'translateY(0px)' : 'translateY(-8px)',
                  transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out'
                }}>
                  <h1 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '900', lineHeight: 1.3, margin: '8px 0' }}>
                    {currentTip.text}
                  </h1>
                  <p style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: 1.5 }}>
                    {currentTip.sub}
                  </p>
                </div>

                <button className="hero-action" onClick={() => setActivePage('radio')}>
                  Ask Kisan Mitra <span>→</span>
                </button>
              </div>

              {/* Weather-Aware Telemetry Widget */}
              <div className="hero-weather" style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '16px', padding: '16px' }}>
                <span className="weather-icon" style={{ fontSize: '32px' }}>{currentWallpaper.icon}</span>
                <p style={{ color: '#d1fae5', margin: '4px 0 0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '800' }}>Live Field Outlook</p>
                <strong style={{ color: '#ffffff', fontSize: '18px' }}>{currentWallpaper.outlook}</strong>
                <small style={{ color: '#fef08a', fontSize: '11px', fontWeight: '700' }}>{currentWallpaper.detail}</small>
              </div>
            </section>

            <section className="quick-strip">
              <div className="quick-item">
                <span className="quick-icon">🌾</span>
                <p><strong>5.5 acres</strong><small>Farm area</small></p>
              </div>
              <div className="quick-item">
                <span className="quick-icon">💧</span>
                <p><strong>Water stable</strong><small>Irrigation check</small></p>
              </div>
              <div className="quick-item">
                <span className="quick-icon">📈</span>
                <p><strong>85 / 100</strong><small>Farm readiness</small></p>
              </div>
            </section>

            <section className="module-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Your workbench</p>
                  <h2>Choose what you want to do</h2>
                </div>
                <span className="badge">7 tools ready</span>
              </div>
              <div className="module-grid">
                {modules.map((module, index) => (
                  <button 
                    key={module.id} 
                    onClick={() => setActivePage(module.id)} 
                    className={`module-card ${module.tone}`} 
                    style={{ '--delay': `${index * 65}ms` }}
                  >
                    <img src={module.image} alt="" />
                    <span className="module-overlay" />
                    <span className="module-icon">{module.icon}</span>
                    <span className="module-content">
                      <strong>{module.title}</strong>
                      <small>{module.copy}</small>
                    </span>
                    <span className="module-arrow">↗</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="feature-stage page-enter">
            <div className="feature-intro">
              <p className="eyebrow">FarmGuru workspace</p>
              <h1>{activeModule?.title}</h1>
              <p>{activeModule?.copy}</p>
            </div>
            {pages[activePage]}
          </div>
        )}
      </main>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}