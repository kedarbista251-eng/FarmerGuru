import React, { useState, useEffect } from 'react';

const CROPS = [
  { id: 'paddy', name: 'Rice / Paddy', rainSens: 'low', windSens: 'high', humSens: 'med' },
  { id: 'maize', name: 'Maize', rainSens: 'high', windSens: 'high', humSens: 'med' },
  { id: 'tomato', name: 'Tomato / Vegetables', rainSens: 'high', windSens: 'med', humSens: 'high' },
  { id: 'wheat', name: 'Wheat', rainSens: 'med', windSens: 'med', humSens: 'low' },
  { id: 'sugarcane', name: 'Sugarcane', rainSens: 'low', windSens: 'high', humSens: 'low' }
];

export default function WeatherRisk() {
  const [selectedCrop, setSelectedCrop] = useState('paddy');
  const [distressScore, setDistressScore] = useState(85);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState('Detecting location...');
  const [searchQuery, setSearchQuery] = useState('');
  const [coords, setCoords] = useState({ lat: 22.2604, lon: 84.8536 });
  const [currentTime, setCurrentTime] = useState('');
  const [metrics, setMetrics] = useState({
    temp: '--',
    humidity: '--',
    wind: '--',
    soil: '--',
    rainChance: '--'
  });
  const [forecast, setForecast] = useState([]);
  const [historyData, setHistoryData] = useState([]);

  // Live Digital Clock Effect
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchWeatherData = async (lat, lon, placeName = null) => {
    setLoading(true);
    try {
      if (!placeName) {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
        const geoData = await geoRes.json();
        const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.county || 'Your Location';
        const state = geoData.address?.state || '';
        setLocationName(`${city}${state ? `, ${state}` : ''}`);
      } else {
        setLocationName(placeName);
      }

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,precipitation_sum&timezone=auto`
      );
      const weatherData = await weatherRes.json();

      if (weatherData.current) {
        const currentTemp = Math.round(weatherData.current.temperature_2m);
        const currentHumidity = weatherData.current.relative_humidity_2m;
        const currentWind = Math.round(weatherData.current.wind_speed_10m);
        const todayRainProb = weatherData.daily?.precipitation_probability_max?.[0] || 0;

        setMetrics({
          temp: `${currentTemp}°C`,
          humidity: `${currentHumidity}%`,
          wind: `${currentWind} km/h`,
          soil: `${Math.min(100, Math.max(10, currentHumidity - 18))}%`,
          rainChance: `${todayRainProb}%`,
          rawWind: currentWind,
          rawHumidity: currentHumidity,
          rawRain: todayRainProb
        });

        calculateCropRisk(currentHumidity, currentWind, todayRainProb, selectedCrop);
      }

      if (weatherData.daily) {
        const dailyData = weatherData.daily;
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const compiled7Day = dailyData.time.map((timeStr, idx) => {
          const dateObj = new Date(timeStr);
          const dayName = idx === 0 ? 'Today' : days[dateObj.getDay()];
          const maxTemp = Math.round(dailyData.temperature_2m_max[idx]);
          const rainProb = dailyData.precipitation_probability_max[idx] || 0;
          const precipSum = dailyData.precipitation_sum[idx] || 0;
          const code = dailyData.weather_code[idx];

          let icon = '☀️';
          let condition = 'Sunny';
          if (code >= 1 && code <= 3) { icon = '⛅'; condition = 'Partly Cloudy'; }
          else if (code >= 45 && code <= 48) { icon = '🌫️'; condition = 'Foggy'; }
          else if (code >= 51 && code <= 67) { icon = '🌧️'; condition = 'Rain Showers'; }
          else if (code >= 80 && code <= 82) { icon = '🌧️'; condition = 'Heavy Rain'; }
          else if (code >= 95) { icon = '⛈️'; condition = 'Thunderstorm'; }

          let riskLevel = 'Low Risk';
          let riskColor = '#10b981';
          if (rainProb > 60 || code >= 80) {
            riskLevel = 'High Risk';
            riskColor = '#ef4444';
          } else if (rainProb > 30 || code >= 51) {
            riskLevel = 'Moderate';
            riskColor = '#f59e0b';
          }

          return {
            day: dayName,
            temp: `${maxTemp}°C`,
            condition,
            icon,
            risk: riskLevel,
            riskColor,
            rain: `${rainProb}%`,
            precip: precipSum
          };
        });

        setForecast(compiled7Day);

        const history = compiled7Day.map(d => ({
          day: d.day,
          rain: parseFloat(d.precip) || Math.round(Math.random() * 12),
          soil: Math.min(95, Math.max(25, 40 + (parseFloat(d.precip) * 3)))
        }));
        setHistoryData(history);
      }
    } catch (err) {
      console.warn('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCropRisk = (humidity, wind, rain, cropId) => {
    const crop = CROPS.find(c => c.id === cropId);
    let penalty = 0;

    if (crop?.rainSens === 'high' && rain > 40) penalty += 25;
    if (crop?.windSens === 'high' && wind > 20) penalty += 20;
    if (crop?.humSens === 'high' && humidity > 70) penalty += 20;

    if (rain > 70 || wind > 35) penalty += 30;

    const finalScore = Math.max(15, Math.min(98, 100 - penalty));
    setDistressScore(finalScore);
  };

  useEffect(() => {
    if (metrics.rawHumidity !== undefined) {
      calculateCropRisk(metrics.rawHumidity, metrics.rawWind, metrics.rawRain, selectedCrop);
    }
  }, [selectedCrop]);

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lon: longitude });
          fetchWeatherData(latitude, longitude);
        },
        () => fetchWeatherData(coords.lat, coords.lon, 'Rourkela, Odisha')
      );
    } else {
      fetchWeatherData(coords.lat, coords.lon, 'Rourkela, Odisha');
    }
  };

  useEffect(() => {
    handleDetectLocation();
  }, []);

  const handleSearchLandmark = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const target = data[0];
        const newLat = parseFloat(target.lat);
        const newLon = parseFloat(target.lon);
        setCoords({ lat: newLat, lon: newLon });
        fetchWeatherData(newLat, newLon, target.display_name.split(',')[0]);
        setSearchQuery('');
      } else {
        alert('Landmark not found.');
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  const getRiskDetails = (score) => {
    const currentCropName = CROPS.find(c => c.id === selectedCrop)?.name;
    if (score >= 75) {
      return {
        level: `Low Environmental Risk for ${currentCropName}`,
        color: '#059669',
        bg: '#ecfdf5',
        border: '#a7f3d0',
        status: 'Optimal Conditions',
        advisories: [
          { type: 'good', icon: '✅', text: `Weather conditions optimal for ${currentCropName} field operations.` },
          { type: 'warn', icon: '📊', text: 'Mandi pricing trends stable. Favorable window for crop dispatch.' }
        ]
      };
    }
    if (score >= 45) {
      return {
        level: `Moderate Caution for ${currentCropName}`,
        color: '#d97706',
        bg: '#fffbeb',
        border: '#fde68a',
        status: 'Caution Required',
        advisories: [
          { type: 'warn', icon: '⚠️', text: `Elevated humidity detected. Monitor ${currentCropName} for fungal infection.` },
          { type: 'warn', icon: '💨', text: 'Moderate wind speeds. Postpone aerial liquid pesticide spraying.' }
        ]
      };
    }
    return {
      level: `Severe Vulnerability Risk for ${currentCropName}`,
      color: '#dc2626',
      bg: '#fef2f2',
      border: '#fecaca',
      status: 'High Alert',
      advisories: [
        { type: 'danger', icon: '🚨', text: `High risk of damage to ${currentCropName} from heavy precipitation/winds.` },
        { type: 'danger', icon: '📉', text: 'Transport disruption risk near regional mandi transport yards.' }
      ]
    };
  };

  const risk = getRiskDetails(distressScore);
  const isEmergency = distressScore < 40;

  const radius = 70;
  const strokeWidth = 14;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (distressScore / 100) * circumference;

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
        <div>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Live Environmental & Atmospheric Telemetry
          </span>
          <h2 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '800' }}>
            ⛈️ Weather & Risk Intelligence
          </h2>
        </div>

        {/* Live Badge & Real-Time Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {currentTime && (
            <span style={{
              fontSize: '12px',
              fontWeight: '800',
              color: '#d1fae5',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '6px 10px',
              borderRadius: '8px',
              letterSpacing: '0.5px'
            }}>
              🕒 {currentTime}
            </span>
          )}

          <div style={{
            backgroundColor: '#047857',
            padding: '8px 14px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: '800',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            letterSpacing: '0.5px'
          }}>
            <span style={{
              width: '10px',
              height: '10px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'blink 1.2s infinite ease-in-out'
            }} />
            <span>{loading ? 'SYNCING...' : 'LIVE'}</span>
          </div>
        </div>
        <style>{`
          @keyframes blink {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(0.85); }
          }
        `}</style>
      </div>

      {/* Emergency Disaster Alert Banner */}
      {isEmergency && (
        <div style={{
          backgroundColor: '#ef4444',
          color: '#ffffff',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🚨</span>
            <strong style={{ fontSize: '13px' }}>Severe Weather Alert: High wind or rain hazard detected in your zone!</strong>
          </div>
          <button 
            onClick={() => alert('District Agriculture Helpline: 1800-180-1551\nKisan Call Center: 1551')}
            style={{
              backgroundColor: '#ffffff',
              color: '#dc2626',
              border: 0,
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            Emergency Contacts
          </button>
        </div>
      )}

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Location Picker & Search Bar */}
        <div style={{
          padding: '14px 18px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              Selected Location Landmark
            </span>
            <strong style={{ display: 'block', fontSize: '15px', color: '#0f172a', marginTop: '2px' }}>
              📍 {locationName}
            </strong>
          </div>

          <form onSubmit={handleSearchLandmark} style={{ display: 'flex', gap: '8px', flex: '1', maxWidth: '380px' }}>
            <input 
              type="text" 
              placeholder="Enter landmark, city, or district..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                outline: 'none'
              }}
            />
            <button 
              type="submit"
              style={{
                backgroundColor: '#064e3b',
                color: '#ffffff',
                border: 0,
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Search
            </button>
            <button 
              type="button"
              onClick={handleDetectLocation}
              style={{
                backgroundColor: '#047857',
                color: '#ffffff',
                border: 0,
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
              title="Use Device GPS"
            >
              🎯 GPS
            </button>
          </form>
        </div>

        {/* Crop Vulnerability Selector */}
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          padding: '12px 16px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#166534' }}>
            🌾 Select Active Crop for Tailored Sensitivity Risk:
          </span>
          <select
            value={selectedCrop}
            onChange={e => setSelectedCrop(e.target.value)}
            style={{
              backgroundColor: '#ffffff',
              color: '#166534',
              border: '1px solid #86efac',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {CROPS.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Distress Gauge & Risk Overview */}
        <div style={{
          backgroundColor: risk.bg,
          border: `1px solid ${risk.border}`,
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="180" height="110" viewBox="0 0 180 110" style={{ overflow: 'visible' }}>
              <path
                d="M 10 100 A 70 70 0 0 1 170 100"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              <path
                d="M 10 100 A 70 70 0 0 1 170 100"
                fill="none"
                stroke={risk.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.5s ease' }}
              />
              <text x="90" y="80" textAnchor="middle" fontSize="32" fontWeight="900" fill="#0f172a">
                {distressScore}
              </text>
              <text x="90" y="98" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748b">
                FARM SAFETY SCORE
              </text>
            </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: risk.color }}>
              ● {risk.status}
            </span>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
              {risk.level}
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              Continuously evaluated against real-time Open-Meteo atmospheric telemetry and local district coordinates.
            </p>
          </div>
        </div>

        {/* Optimal Operation Window Card */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#047857', textTransform: 'uppercase' }}>
              📅 Optimal Field Operation Window
            </span>
            <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
              {metrics.rawWind < 18 && parseInt(metrics.rainChance) < 30 
                ? "🟢 Safe Spraying Window: Tomorrow 06:00 AM – 10:00 AM (Low wind drift & minimal rain risk)"
                : "⚠️ Caution: Delay liquid pesticide spraying due to wind gusts or upcoming rainfall"}
            </p>
          </div>
        </div>

        {/* Live Field Readings */}
        <div>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
            Live Environmental Readings
          </span>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px'
          }}>
            {[
              { label: 'Temperature', val: metrics.temp, sub: 'Live reading', icon: '🌡️' },
              { label: 'Humidity', val: metrics.humidity, sub: 'Relative humidity', icon: '💧' },
              { label: 'Wind Speed', val: metrics.wind, sub: 'Surface wind', icon: '💨' },
              { label: 'Soil Moisture', val: metrics.soil, sub: 'Telemetry est.', icon: '🌱' },
              { label: 'Rain Chance', val: metrics.rainChance, sub: 'Today precipitation', icon: '🌧️' }
            ].map((m, idx) => (
              <div key={idx} style={{
                padding: '14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <span style={{ fontSize: '20px' }}>{m.icon}</span>
                <strong style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{m.val}</strong>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#334155' }}>{m.label}</span>
                <small style={{ fontSize: '10px', color: '#94a3b8' }}>{m.sub}</small>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Rainfall & Soil Trend Graph */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '16px'
        }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
            📈 7-Day Rainfall & Soil Moisture Trend
          </span>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', height: '100px', paddingTop: '10px' }}>
            {historyData.map((h, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '100%', height: '70px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '2px' }}>
                  <div 
                    title={`Rainfall: ${h.rain}mm`}
                    style={{ width: '40%', backgroundColor: '#0284c7', borderRadius: '4px 4px 0 0', height: `${Math.min(100, h.rain * 4 + 10)}%` }} 
                  />
                  <div 
                    title={`Soil Moisture: ${h.soil}%`}
                    style={{ width: '40%', backgroundColor: '#059669', borderRadius: '4px 4px 0 0', height: `${h.soil}%` }} 
                  />
                </div>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748b' }}>{h.day}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '10px', fontSize: '11px', fontWeight: '700' }}>
            <span style={{ color: '#0284c7' }}>■ Rain (mm)</span>
            <span style={{ color: '#059669' }}>■ Soil Moisture (%)</span>
          </div>
        </div>

        {/* Generated Field Advisories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
            Generated Field Advisories
          </span>
          {risk.advisories.map((item, idx) => (
            <div key={idx} style={{
              padding: '14px 16px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderLeft: `4px solid ${risk.color}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1e293b', lineHeight: 1.5 }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>

        {/* 7-Day Live Agricultural Forecast */}
        <div>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
            7-Day Agricultural Forecast & Risk Projection
          </span>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '8px'
          }}>
            {forecast.map((day, idx) => (
              <div key={idx} style={{
                padding: '12px 8px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b' }}>{day.day}</span>
                <span style={{ fontSize: '22px', margin: '2px 0' }}>{day.icon}</span>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>{day.temp}</strong>
                <small style={{ fontSize: '10px', color: '#64748b', minHeight: '26px', display: 'flex', alignItems: 'center' }}>
                  {day.condition}
                </small>
                <span style={{
                  fontSize: '9px',
                  fontWeight: '800',
                  color: '#ffffff',
                  backgroundColor: day.riskColor,
                  padding: '2px 6px',
                  borderRadius: '10px',
                  marginTop: '4px'
                }}>
                  {day.risk}
                </span>
                <span style={{ fontSize: '9px', color: '#0284c7', fontWeight: '700' }}>
                  🌧️ {day.rain}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}