import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
const DEFAULT_PROFILE = {
  name: 'Purushottam Gupta',
  profilePic: null,
  acreage: 5.5,
  soilType: 'Alluvial Loam',
  soilPh: 6.5,
  irrigation: 'Borewell & Canal',
  district: 'Rourkela, Odisha',
  activeCrop: 'Millets (Ragi)',
  sowingDate: '2026-06-15',
  expectedHarvest: '2026-10-10'
};

export default function FarmProfile({ onSave }) {
  const { token } = useAuth();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  const [saved, setSaved] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setProfile(prev => ({ ...prev, ...data }));
          }
        })
        .catch(err => console.warn('Failed to fetch profile:', err));
    }
  }, [token]);

  // Profile Picture Upload Handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, profilePic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfile(prev => ({ ...prev, profilePic: null }));
  };

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

  // GPS Live Location Detection
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
          alert('Could not resolve your location name. Setting default.');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (token) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(profile)
        });
      } catch (err) {
        console.error("Failed to save profile", err);
      }
    }
    setSaved(true);
    if (onSave) onSave(profile);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{
      maxWidth: '850px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      border: '1px solid #d1fae5',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Banner */}
      <div style={{
        backgroundColor: '#064e3b',
        color: '#ffffff',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Header Avatar Container */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#047857',
              border: '2px solid #a7f3d0',
              overflow: 'hidden',
              display: 'grid',
              placeItems: 'center',
              fontSize: '22px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}>
              {profile.profilePic ? (
                <img 
                  src={profile.profilePic} 
                  alt="Farmer Avatar" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                '👨‍🌾'
              )}
            </div>
            <label 
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                backgroundColor: '#fbbf24',
                color: '#1e293b',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
              title="Upload Profile Picture"
            >
              📷
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Central Farmer Registry
            </span>
            <h2 style={{ margin: '2px 0 0', fontSize: '20px', fontWeight: '800', color: '#ffffff' }}>
              Farm Property & Soil Profile
            </h2>
          </div>
        </div>

        <div style={{
          backgroundColor: '#047857',
          padding: '8px 14px',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: '800',
          color: '#ffffff'
        }}>
          📍 {profile.district}
        </div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Quick Overview Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px'
        }}>
          <div style={{
            padding: '14px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#e2e8f0',
                overflow: 'hidden',
                display: 'grid',
                placeItems: 'center',
                fontSize: '20px'
              }}>
                {profile.profilePic ? (
                  <img src={profile.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  '👤'
                )}
              </div>
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{profile.name}</strong>
              <small style={{ fontSize: '10px', color: '#047857', fontWeight: '700' }}>Verified Farmer</small>
            </div>
          </div>

          {[
            { label: 'Total Acreage', val: `${profile.acreage} Acres`, icon: '📐', sub: 'Active Farmland' },
            { label: 'Primary Soil Type', val: profile.soilType, icon: '🌱', sub: `pH: ${profile.soilPh}` },
            { label: 'Irrigation Setup', val: profile.irrigation, icon: '💧', sub: 'Dual Source' }
          ].map((item, idx) => (
            <div key={idx} style={{
              padding: '14px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <strong style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{item.val}</strong>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#334155' }}>{item.label}</span>
              <small style={{ fontSize: '10px', color: '#047857', fontWeight: '700' }}>{item.sub}</small>
            </div>
          ))}
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} style={{
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
            ✏️ Update Farm Telemetry & Profile
          </span>

          {/* Photo Management Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#cbd5e1',
                overflow: 'hidden',
                display: 'grid',
                placeItems: 'center',
                fontSize: '18px'
              }}>
                {profile.profilePic ? (
                  <img src={profile.profilePic} alt="Uploaded Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  '🖼️'
                )}
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '12px', color: '#1e293b' }}>Farmer Profile Picture</strong>
                <small style={{ fontSize: '11px', color: '#64748b' }}>Upload a clear photo for official registry cards</small>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <label style={{
                backgroundColor: '#064e3b',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}>
                Upload Photo
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>

              {profile.profilePic && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  style={{
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    border: 0,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Farmer Name
              </label>
              <input 
                type="text" 
                value={profile.name} 
                onChange={e => setProfile({ ...profile, name: e.target.value })} 
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none'
                }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Total Farmland Acreage
              </label>
              <input 
                type="number" 
                step="0.1" 
                value={profile.acreage} 
                onChange={e => setProfile({ ...profile, acreage: parseFloat(e.target.value) || 0 })} 
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none'
                }} 
              />
            </div>
          </div>

          {/* Location Picker Section */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Location (Search District, Village, Town in India or Use GPS)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Type village or district name (e.g. Bargarh, Sambalpur)..."
                value={locationSearch}
                onChange={e => setLocationSearch(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isLocating}
                style={{
                  backgroundColor: '#047857',
                  color: '#ffffff',
                  border: 0,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                🎯 {isLocating ? 'Locating...' : 'Set GPS Location'}
              </button>
            </div>

            {/* Location Autocomplete Dropdown */}
            {suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                marginTop: '4px',
                zIndex: 10,
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectLocation(item)}
                    style={{
                      padding: '10px 14px',
                      fontSize: '12px',
                      color: '#1e293b',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    📍 {item.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Soil Classification
              </label>
              <select 
                value={profile.soilType} 
                onChange={e => setProfile({ ...profile, soilType: e.target.value })} 
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  outline: 'none'
                }}
              >
                <option value="Alluvial Loam">Alluvial Loam</option>
                <option value="Black Cotton Soil">Black Cotton Soil</option>
                <option value="Red & Yellow Soil">Red & Yellow Soil</option>
                <option value="Laterite Clay">Laterite Clay</option>
                <option value="Sandy Loam">Sandy Loam</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Soil pH Level (4.5 - 8.5)
              </label>
              <input 
                type="number" 
                step="0.1" 
                min="4.5" 
                max="8.5" 
                value={profile.soilPh} 
                onChange={e => setProfile({ ...profile, soilPh: parseFloat(e.target.value) || 6.5 })} 
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none'
                }} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Irrigation Infrastructure
              </label>
              <input 
                type="text" 
                value={profile.irrigation} 
                onChange={e => setProfile({ ...profile, irrigation: e.target.value })} 
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none'
                }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Saved District / Village
              </label>
              <input 
                type="text" 
                value={profile.district} 
                readOnly
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  fontWeight: '700',
                  outline: 'none'
                }} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            style={{
              backgroundColor: saved ? '#059669' : '#064e3b',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '14px',
              border: 0,
              cursor: 'pointer',
              marginTop: '8px',
              transition: 'background-color 0.3s'
            }}
          >
            {saved ? '✅ Profile Saved Successfully!' : 'Save Farm Properties'}
          </button>
        </form>

      </div>
    </div>
  );
}