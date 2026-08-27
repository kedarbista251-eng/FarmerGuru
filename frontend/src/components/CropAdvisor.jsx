import React, { useState, useEffect } from 'react';

const CROP_DATABASE = [
  {
    id: 'ragi',
    name: 'Millets (Ragi)',
    season: 'Kharif / Monsoon',
    suitableMonths: ['June', 'July', 'August', 'September'],
    soilType: 'Alluvial & Loamy',
    idealPh: { min: 5.5, max: 7.5 },
    npkReq: { n: 'Med', p: 'Low', k: 'Med' },
    waterReq: 'Low (300-450mm)',
    estCostPerAcre: 12000,
    estYieldQuintal: 14,
    marketPricePerQuintal: 3800,
    companionCrop: 'Pigeon Pea (Arhar)',
    monthlyPrices: [3400, 3500, 3650, 3800, 3950, 4100, 3800],
    productivitySteps: [
      'Row Spacing: Plant in 30cm rows with 10cm plant-to-plant distance.',
      'Nitrogen Fixation: Intercrop 4 rows of Ragi with 1 row of Pigeon Pea.',
      'Irrigation: 2 critical irrigations during flowering and grain formation stages.',
      'Bio-Fertilizer: Treat seeds with Azospirillum and Aspergillus prior to sowing.'
    ]
  },
  {
    id: 'mustard',
    name: 'Mustard (Sarson)',
    season: 'Rabi / Winter',
    suitableMonths: ['October', 'November', 'December'],
    soilType: 'Sandy Loam & Alluvial',
    idealPh: { min: 6.0, max: 7.5 },
    npkReq: { n: 'High', p: 'Med', k: 'High' },
    waterReq: 'Moderate (250-400mm)',
    estCostPerAcre: 14500,
    estYieldQuintal: 8,
    marketPricePerQuintal: 5650,
    companionCrop: 'Chickpea / Gram',
    monthlyPrices: [5100, 5250, 5400, 5650, 5800, 6000, 5650],
    productivitySteps: [
      'Row Spacing: Maintain 45cm line spacing and 15cm plant spacing.',
      'Thinning: Perform 15 days after germination to avoid crowding.',
      'Pest Guard: Watch for aphids during pod formation; apply neem oil 3% at first sign.',
      'Fertilizer: Apply Sulfur @ 20 kg/acre to boost oil content.'
    ]
  },
  {
    id: 'tomato',
    name: 'Hybrid Tomato',
    season: 'All Season / Zaid',
    suitableMonths: ['January', 'February', 'August', 'September'],
    soilType: 'Well-Drained Red & Loamy',
    idealPh: { min: 6.0, max: 7.0 },
    npkReq: { n: 'High', p: 'High', k: 'High' },
    waterReq: 'High (600-800mm)',
    estCostPerAcre: 35000,
    estYieldQuintal: 160,
    marketPricePerQuintal: 1800,
    companionCrop: 'Marigold (Nematode Defense)',
    monthlyPrices: [1400, 1600, 2100, 1800, 2400, 1900, 1800],
    productivitySteps: [
      'Staking: Use bamboo stakes to elevate branches and prevent soil rot.',
      'Drip Irrigation: Irrigate every 2 days; avoid overhead leaf wetting.',
      'Border Crop: Plant Marigold along edges to repel root nematodes.',
      'Pruning: Remove lower sucker shoots up to 30cm from soil level.'
    ]
  },
  {
    id: 'groundnut',
    name: 'Groundnut (Peanut)',
    season: 'Kharif / Summer',
    suitableMonths: ['May', 'June', 'July'],
    soilType: 'Sandy Loam & Red Soil',
    idealPh: { min: 5.8, max: 6.8 },
    npkReq: { n: 'Low', p: 'High', k: 'Med' },
    waterReq: 'Moderate (500-600mm)',
    estCostPerAcre: 22000,
    estYieldQuintal: 12,
    marketPricePerQuintal: 6300,
    companionCrop: 'Sunflower',
    monthlyPrices: [5800, 6000, 6150, 6300, 6500, 6700, 6300],
    productivitySteps: [
      'Gypsum Application: Apply 200 kg/acre Gypsum during pegging stage for pod fill.',
      'Soil Loosening: Keep soil friable so pegs can easily penetrate the earth.',
      'Seed Treatment: Apply Trichoderma viride @ 4g/kg seed to prevent collar rot.',
      'Spacing: Maintain 30cm x 10cm spacing.'
    ]
  }
];

const WATER_SOURCES = [
  { id: 'rainfed', name: 'Rainfed (Monsoon)', costMultiplier: 0 },
  { id: 'canal', name: 'Canal Irrigation', costMultiplier: 1200 },
  { id: 'borewell', name: 'Borewell Drip System', costMultiplier: 3500 },
  { id: 'well', name: 'Open Dug Well', costMultiplier: 2200 }
];

export default function CropAdvisor() {
  const [cropDatabase, setCropDatabase] = useState(CROP_DATABASE);
  const [loading, setLoading] = useState(true);
  const [selectedCropId, setSelectedCropId] = useState('ragi');
  const [farmAcres, setFarmAcres] = useState(2);
  const [selectedWaterSource, setSelectedWaterSource] = useState('rainfed');
  const [currentMonth, setCurrentMonth] = useState('');
  const [liveWeather, setLiveWeather] = useState({ temp: '--', rainProb: '--', humidity: '--' });

  // Soil health tester state
  const [soilPh, setSoilPh] = useState(6.5);
  const [soilNitrogen, setSoilNitrogen] = useState('Med');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/advisory/crops`).then(response => response.ok ? response.json() : []).then(rows => {
      if (rows.length) setCropDatabase(rows.map(crop => ({ ...crop, suitableMonths: JSON.parse(crop.suitable_months || '[]'), idealPh: { min: crop.ideal_ph_min, max: crop.ideal_ph_max }, npkReq: JSON.parse(crop.npk_req || '{}'), estCostPerAcre: crop.est_cost_per_acre, estYieldQuintal: crop.est_yield_quintal, marketPricePerQuintal: crop.market_price_per_quintal, companionCrop: crop.companion_crop, monthlyPrices: JSON.parse(crop.monthly_prices || '[]'), productivitySteps: JSON.parse(crop.productivity_steps || '[]') })));
    }).catch(() => {});
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    setCurrentMonth(monthNames[now.getMonth()]);

    async function fetchLiveTelemetry() {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=22.2604&longitude=84.8536&current=temperature_2m,relative_humidity_2m&daily=precipitation_probability_max&timezone=auto'
        );
        const data = await res.json();
        if (data.current) {
          setLiveWeather({
            temp: `${Math.round(data.current.temperature_2m)}°C`,
            humidity: `${data.current.relative_humidity_2m}%`,
            rainProb: `${data.daily?.precipitation_probability_max?.[0] || 10}%`
          });
        }
      } catch (e) {
        console.warn('Telemetry fetch error:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveTelemetry();
  }, []);

  const activeCrop = cropDatabase.find(c => c.id === selectedCropId) || cropDatabase[0];
  const waterSourceObj = WATER_SOURCES.find(w => w.id === selectedWaterSource);

  const waterCostTotal = waterSourceObj.costMultiplier * farmAcres;
  const totalInputCost = (activeCrop.estCostPerAcre * farmAcres) + waterCostTotal;
  const totalRevenue = activeCrop.estYieldQuintal * activeCrop.marketPricePerQuintal * farmAcres;
  const netProfit = totalRevenue - totalInputCost;
  const roiPercentage = ((netProfit / totalInputCost) * 100).toFixed(0);

  const isMonthSuitable = activeCrop.suitableMonths.includes(currentMonth);
  const isPhSuitable = soilPh >= activeCrop.idealPh.min && soilPh <= activeCrop.idealPh.max;

  const handlePrintPlan = () => {
    window.print();
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
        <div>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Agri-Economics & Agronomy Intelligence
          </span>
          <h2 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '800', color: '#ffffff' }}>
            🌱 Smart Crop Advisor & Profit Engine
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={handlePrintPlan}
            style={{
              backgroundColor: '#ffffff',
              color: '#064e3b',
              border: 0,
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            📄 Print Field Plan
          </button>
          <div style={{
            backgroundColor: '#047857',
            padding: '8px 14px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: '800',
            color: '#ffffff'
          }}>
            📅 {currentMonth} Window
          </div>
        </div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Real-time Environmental Sync Bar */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#047857' }}>
              📡 Telemetry Sync:
            </span>
            <span style={{ fontSize: '12px', color: '#334155', fontWeight: '700' }}>
              🌡️ {liveWeather.temp}
            </span>
            <span style={{ fontSize: '12px', color: '#334155', fontWeight: '700' }}>
              💧 {liveWeather.humidity}
            </span>
            <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: '700' }}>
              🌧️ Rain Chance: {liveWeather.rainProb}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Farm Land Size:</label>
            <select
              value={farmAcres}
              onChange={e => setFarmAcres(Number(e.target.value))}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                fontWeight: '700',
                outline: 'none'
              }}
            >
              {[1, 2, 3, 5, 10, 15].map(a => (
                <option key={a} value={a}>{a} Acre{a > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 1. Soil Health & Irrigation Parameter Widget */}
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '14px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#166534', textTransform: 'uppercase' }}>
            🧪 Field Soil Parameters & Irrigation Setup
          </span>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {/* pH Slider */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#166534', display: 'flex', justifyContent: 'space-between' }}>
                <span>Soil pH Level:</span>
                <span style={{ color: isPhSuitable ? '#047857' : '#dc2626' }}>{soilPh} pH ({isPhSuitable ? 'Optimal' : 'Sub-optimal'})</span>
              </label>
              <input 
                type="range" 
                min="4.5" 
                max="8.5" 
                step="0.1" 
                value={soilPh} 
                onChange={e => setSoilPh(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#047857', marginTop: '6px' }}
              />
            </div>

            {/* Irrigation Source Selector */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#166534', display: 'block', marginBottom: '4px' }}>
                Water & Irrigation Source:
              </label>
              <select
                value={selectedWaterSource}
                onChange={e => setSelectedWaterSource(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #86efac',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#166534',
                  outline: 'none'
                }}
              >
                {WATER_SOURCES.map(w => (
                  <option key={w.id} value={w.id}>{w.name} (+₹{w.costMultiplier}/acre)</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Candidate Crop Cards */}
        <div>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
            Select Candidate Crop for Profitability Analysis
          </span>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}>
            {cropDatabase.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCropId(c.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: selectedCropId === c.id ? '2px solid #064e3b' : '1px solid #e2e8f0',
                  backgroundColor: selectedCropId === c.id ? '#ecfdf5' : '#ffffff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a', fontWeight: '800' }}>{c.name}</strong>
                <small style={{ color: '#047857', fontSize: '11px', fontWeight: '700' }}>
                  {c.season}
                </small>
              </button>
            ))}
          </div>
        </div>

        {/* Financial Projection Card */}
        <div style={{
          backgroundColor: '#064e3b',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '20px 24px',
          boxShadow: '0 10px 25px rgba(6,78,59,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ backgroundColor: '#f59e0b', color: '#0f172a', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>
                RECOMMENDED STRATEGY
              </span>
              <h3 style={{ margin: '8px 0 0', fontSize: '22px', fontWeight: '900', color: '#ffffff' }}>
                Primary: <span style={{ color: '#fef08a' }}>{activeCrop.name}</span> + Companion: <span style={{ color: '#ffffff' }}>{activeCrop.companionCrop}</span>
              </h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: '#d1fae5', textTransform: 'uppercase', fontWeight: '800' }}>Est. ROI</span>
              <strong style={{ display: 'block', fontSize: '28px', color: '#fcd34d', lineHeight: 1 }}>+{roiPercentage}%</strong>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div>
              <span style={{ fontSize: '11px', color: '#d1fae5', textTransform: 'uppercase', fontWeight: '700' }}>Total Input Cost ({farmAcres} Acre)</span>
              <strong style={{ display: 'block', fontSize: '18px', marginTop: '2px', color: '#ffffff' }}>₹{totalInputCost.toLocaleString()}</strong>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#d1fae5', textTransform: 'uppercase', fontWeight: '700' }}>Current Market Price</span>
              <strong style={{ display: 'block', fontSize: '18px', marginTop: '2px', color: '#fde047' }}>₹{activeCrop.marketPricePerQuintal} / qtl</strong>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#d1fae5', textTransform: 'uppercase', fontWeight: '700' }}>Projected Net Profit</span>
              <strong style={{ display: 'block', fontSize: '20px', marginTop: '2px', color: '#4ade80', fontWeight: '900' }}>₹{netProfit.toLocaleString()}</strong>
            </div>
          </div>

          <div style={{ fontSize: '13px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <span>{isMonthSuitable && isPhSuitable ? '✅' : '⚠️'}</span>
            <span>
              {isMonthSuitable && isPhSuitable 
                ? `Optimal Conditions: ${currentMonth} sowing window and ${soilPh} pH are suitable for ${activeCrop.name}.` 
                : `Caution: Verify seasonal sowing timing (${activeCrop.suitableMonths.join(', ')}) or pH range (${activeCrop.idealPh.min}-${activeCrop.idealPh.max}).`}
            </span>
          </div>
        </div>

        {/* 3. Historical Mandi Price Trend Graph */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '16px'
        }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
            📊 7-Month Historical Mandi Price Trend for {activeCrop.name} (₹/qtl)
          </span>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', height: '90px', paddingTop: '10px' }}>
            {activeCrop.monthlyPrices.map((price, idx) => {
              const maxPrice = Math.max(...activeCrop.monthlyPrices);
              const heightPct = Math.round((price / maxPrice) * 100);
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '9px', fontWeight: '800', color: '#047857' }}>₹{price}</span>
                  <div style={{
                    width: '70%',
                    backgroundColor: idx === 6 ? '#f59e0b' : '#047857',
                    borderRadius: '4px 4px 0 0',
                    height: `${heightPct}%`
                  }} />
                  <span style={{ fontSize: '9px', fontWeight: '700', color: '#64748b' }}>M{idx + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step-by-Step Productivity Planting Guide */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              ⚡ High-Yield Productivity Execution Guide
            </span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#047857', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '6px' }}>
              Soil: {activeCrop.soilType}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeCrop.productivitySteps.map((step, idx) => (
              <div key={idx} style={{
                padding: '10px 14px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                borderLeft: '3px solid #047857',
                fontSize: '13px',
                color: '#1e293b',
                fontWeight: '600'
              }}>
                <span style={{ color: '#047857', fontWeight: '800', marginRight: '8px' }}>Step {idx + 1}:</span>
                {step}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}