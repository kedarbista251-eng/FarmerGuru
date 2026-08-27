import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, Maximize, Sprout, Droplet, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

const DEFAULT_PROFILE = {
  name: 'Farmer',
  profilePic: null,
  acreage: 1.0,
  soilType: 'Alluvial Loam',
  soilPh: 6.5,
  irrigation: '',
  district: '',
  activeCrop: '',
  sowingDate: '',
  expectedHarvest: ''
};

const toApiProfile = (profile) => ({
  name: profile.name,
  profile_pic: profile.profilePic,
  acreage: profile.acreage,
  soil_type: profile.soilType,
  soil_ph: profile.soilPh,
  irrigation: profile.irrigation,
  district: profile.district,
  active_crop: profile.activeCrop,
  sowing_date: profile.sowingDate,
  expected_harvest: profile.expectedHarvest
});

export default function OnboardingWizard({ onClose }) {
  const { user, token } = useAuth();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    ...DEFAULT_PROFILE,
    name: user?.full_name || user?.email || 'Farmer'
  });

  const [locationSearch, setLocationSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Search Indian Districts/Villages via Nominatim API
  useEffect(() => {
    if (!locationSearch.trim() || locationSearch.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&q=${encodeURIComponent(locationSearch)}&limit=6`
        );
        const data = await res.json();
        setSuggestions(data || []);
      } catch (err) {
        console.warn('Location search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [locationSearch]);

  const handleSelectLocation = (item) => {
    const parts = item.display_name.split(',');
    const shortName = `${parts[0].trim()}, ${parts[parts.length - 2]?.trim() || 'India'}`;
    setProfile(prev => ({ ...prev, district: shortName }));
    setLocationSearch('');
    setSuggestions([]);
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const addr = data.address || {};
          const villageOrCity = addr.village || addr.town || addr.city || addr.suburb || addr.county || 'Detected Area';
          const state = addr.state || '';
          const fullPlace = `${villageOrCity}${state ? `, ${state}` : ''}`;
          
          setProfile(prev => ({ ...prev, district: fullPlace }));
        } catch {
          alert('Could not resolve your location name. Please type it manually.');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        alert('Permission denied or location unavailable.');
        setIsLocating(false);
      }
    );
  };

  const handleNext = () => setStep(s => Math.min(s + 1, 4));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleFinish = async () => {
    setSaving(true);
    if (token) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(toApiProfile(profile))
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.detail || 'Could not save farm profile');
        }
      } catch (err) {
        console.error("Failed to save profile", err);
        alert('Your farm profile could not be saved. Please try again.');
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    if (onClose) onClose();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="wizard-step">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#157552' }}>
              <MapPin size={48} />
            </div>
            <h2 style={{ textAlign: 'center', color: '#164b37', marginBottom: '8px' }}>Where is your farm located?</h2>
            <p style={{ textAlign: 'center', color: '#628276', marginBottom: '24px', fontSize: '14px' }}>
              This helps us provide accurate weather and market advisories for your region.
            </p>
            
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input 
                  type="text" 
                  placeholder="Type district or village name..."
                  value={locationSearch}
                  onChange={e => setLocationSearch(e.target.value)}
                  style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #cfe1d7', fontSize: '15px', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={isLocating}
                  style={{ backgroundColor: '#047857', color: 'white', border: 'none', padding: '0 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {isLocating ? '...' : 'GPS'}
                </button>
              </div>

              {suggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '50px', left: 0, right: '70px', backgroundColor: '#fff', border: '1px solid #cfe1d7', borderRadius: '8px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  {suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectLocation(item)}
                      style={{ padding: '10px 14px', borderBottom: '1px solid #f0f5f2', cursor: 'pointer', fontSize: '13px' }}
                    >
                      {item.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {profile.district && (
              <div style={{ padding: '12px', backgroundColor: '#e8f6ee', borderRadius: '8px', color: '#157552', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={18} /> Selected: {profile.district}
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="wizard-step">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#157552' }}>
              <Maximize size={48} />
            </div>
            <h2 style={{ textAlign: 'center', color: '#164b37', marginBottom: '8px' }}>How large is your farm?</h2>
            <p style={{ textAlign: 'center', color: '#628276', marginBottom: '24px', fontSize: '14px' }}>
              Enter the total acreage you are currently managing.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <input 
                type="number" 
                step="0.1"
                min="0"
                value={profile.acreage}
                onChange={e => setProfile({...profile, acreage: parseFloat(e.target.value) || 0})}
                style={{ width: '120px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cfe1d7', fontSize: '20px', textAlign: 'center', outline: 'none' }}
              />
              <span style={{ fontSize: '20px', color: '#164b37', fontWeight: 'bold' }}>Acres</span>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="wizard-step">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#157552' }}>
              <Sprout size={48} />
            </div>
            <h2 style={{ textAlign: 'center', color: '#164b37', marginBottom: '8px' }}>Tell us about your soil</h2>
            <p style={{ textAlign: 'center', color: '#628276', marginBottom: '24px', fontSize: '14px' }}>
              This helps crop advisors recommend the right fertilizers.
            </p>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#164b37' }}>Soil Classification</label>
              <select 
                value={profile.soilType}
                onChange={e => setProfile({...profile, soilType: e.target.value})}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cfe1d7', fontSize: '15px', backgroundColor: '#fff', outline: 'none' }}
              >
                <option value="Alluvial Loam">Alluvial Loam</option>
                <option value="Black Cotton Soil">Black Cotton Soil</option>
                <option value="Red & Yellow Soil">Red & Yellow Soil</option>
                <option value="Laterite Clay">Laterite Clay</option>
                <option value="Sandy Loam">Sandy Loam</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#164b37' }}>Estimated Soil pH (Optional)</label>
              <input 
                type="number" 
                step="0.1"
                min="4.5"
                max="8.5"
                value={profile.soilPh}
                onChange={e => setProfile({...profile, soilPh: parseFloat(e.target.value) || 6.5})}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cfe1d7', fontSize: '15px', outline: 'none' }}
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="wizard-step">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#157552' }}>
              <Droplet size={48} />
            </div>
            <h2 style={{ textAlign: 'center', color: '#164b37', marginBottom: '8px' }}>Irrigation Setup</h2>
            <p style={{ textAlign: 'center', color: '#628276', marginBottom: '24px', fontSize: '14px' }}>
              How do you water your crops?
            </p>
            
            <input 
              type="text" 
              placeholder="e.g. Borewell, Canal, Rainfed..."
              value={profile.irrigation}
              onChange={e => setProfile({...profile, irrigation: e.target.value})}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cfe1d7', fontSize: '15px', outline: 'none' }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '32px', maxWidth: '450px', width: '95%', margin: '0 auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
      
      {/* Progress Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
        {[1, 2, 3, 4].map(idx => (
          <div 
            key={idx}
            style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: step === idx ? '#157552' : '#cfe1d7',
              transition: 'background-color 0.3s'
            }}
          />
        ))}
      </div>

      <div style={{ minHeight: '260px' }}>
        {renderStep()}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
        <button 
          onClick={handlePrev} 
          style={{ visibility: step > 1 ? 'visible' : 'hidden', background: 'transparent', border: 'none', color: '#628276', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        
        {step < 4 ? (
          <button 
            onClick={handleNext} 
            disabled={step === 1 && !profile.district}
            style={{ backgroundColor: '#157552', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 'bold', opacity: (step === 1 && !profile.district) ? 0.5 : 1 }}
          >
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button 
            onClick={handleFinish} 
            disabled={saving}
            style={{ backgroundColor: '#fbbf24', color: '#164b37', border: 'none', padding: '10px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {saving ? 'Saving...' : 'Finish Setup'} <CheckCircle size={16} />
          </button>
        )}
      </div>

    </div>
  );
}
