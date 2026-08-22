import React, { useState } from 'react';
import FarmProfile from './components/FarmProfile';
import VoiceRadio from './components/VoiceRadio';
import WeatherRisk from './components/WeatherRisk';
import CropAdvisor from './components/CropAdvisor';
import Marketplace from './components/Marketplace';
import SpecialistCommunity from './components/SpecialistCommunity';
import LoanSchemes from './components/LoanSchemes';
import './App.css';

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
  const [activePage, setActivePage] = useState('home');
  const activeModule = modules.find((module) => module.id === activePage);
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
        <button className="brand" onClick={() => setActivePage('home')} aria-label="Go to FarmGuru dashboard">
          <span className="brand-mark">FG</span>
          <span><strong>FarmGuru</strong><small>your field companion</small></span>
        </button>
        <div className="header-status"><span className="status-dot" /> Farm status: steady</div>
        {activePage !== 'home' && (
          <button className="back-button" onClick={() => setActivePage('home')}>← Dashboard</button>
        )}
      </header>
      <main className="app-main">
        {activePage === 'home' ? (
          <div className="dashboard page-enter">
            <section className="dashboard-hero">
              <div className="hero-copy">
                <p className="eyebrow">A smarter day in the field</p>
                <h1>Good farming starts with a clear next step.</h1>
                <p>Weather, crops, market decisions and expert help, all gathered around your farm.</p>
                <button className="hero-action" onClick={() => setActivePage('radio')}>Ask Kisan Mitra <span>→</span></button>
              </div>
              <div className="hero-weather">
                <span className="weather-icon">☀️</span>
                <p>Field outlook</p>
                <strong>Clear &amp; calm</strong>
                <small>Good day for field work</small>
              </div>
            </section>

            <section className="quick-strip">
              <div><span>🌾</span><p><strong>5.5 acres</strong><small>Farm area</small></p></div>
              <div><span>💧</span><p><strong>Water stable</strong><small>Irrigation check</small></p></div>
              <div><span>📈</span><p><strong>85 / 100</strong><small>Farm readiness</small></p></div>
            </section>

            <section className="module-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Your workbench</p>
                  <h2>Choose what you want to do</h2>
                </div>
                <span>7 tools ready</span>
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
    </div>
  );
}