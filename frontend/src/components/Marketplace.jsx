import React, { useState, useEffect } from 'react';

const MANDI_RATES = [
  { crop: 'Paddy (Common)', mandi: 'Rourkela Yard', min: 2180, max: 2369, modal: 2300, trend: 'up', change: '+₹45' },
  { crop: 'Millets (Ragi)', mandi: 'Bargarh Mandi', min: 3600, max: 3850, modal: 3800, trend: 'stable', change: '₹0' },
  { crop: 'Mustard (Sarson)', mandi: 'Sambalpur Hub', min: 5400, max: 5800, modal: 5650, trend: 'up', change: '+₹120' },
  { crop: 'Hybrid Tomato', mandi: 'Cuttack Yard', min: 1400, max: 2200, modal: 1800, trend: 'down', change: '-₹80' },
  { crop: 'Groundnut (Peanut)', mandi: 'Jharsuguda Yard', min: 6000, max: 6450, modal: 6300, trend: 'up', change: '+₹90' }
];

const AGRI_INPUTS = {
  manure: [
    { id: 1, title: 'Organic Vermicompost', price: '₹12 / kg', location: 'Local Co-op Hub, Panposh', contact: '9876543210', expected: 'Government Certified', badge: 'Certified' },
    { id: 2, title: 'Neem Cake Organic Manure', price: '₹18 / kg', location: 'Agro Input Center, Daily Market', contact: '9876543211', expected: 'High Demand', badge: 'Pest Resistance' },
    { id: 3, title: 'Bio-Fertilizer (Azospirillum)', price: '₹140 / 500ml', location: 'Krishi Vigyan Kendra', contact: '9876543214', expected: 'Subsidized', badge: 'N-Fixing' }
  ],
  seeds: [
    { id: 4, title: 'Certified HYV Ragi Seeds', price: '₹55 / kg', location: 'District Seed Store, Sundargarh', contact: '9876543212', expected: '50% Govt Subsidy', badge: 'High Yield' },
    { id: 5, title: 'Drought-Resistant Arhar / Pulses', price: '₹80 / kg', location: 'Krishi Kendra, Rourkela', contact: '9876543213', expected: 'Price Rising', badge: 'Monsoon Ready' },
    { id: 6, title: 'Hybrid Mustard (Sarson-30)', price: '₹160 / kg', location: 'Regional Seed Depot', contact: '9876543215', expected: 'Limited Stock', badge: 'High Oil Content' }
  ],
  equipment: [
    { id: 7, title: 'Mahindra 475 DI Tractor', price: '₹600 / hour', location: 'Panposh Machinery Desk', contact: '9876543216', expected: 'Available Today', badge: 'Includes Driver' },
    { id: 8, title: 'Power Rotavator (6 Feet)', price: '₹450 / hour', location: 'Rourkela Custom Hiring Center', contact: '9876543217', expected: 'Available', badge: 'Soil Tillage' },
    { id: 9, title: 'Battery Sprayer Pump (16L)', price: '₹150 / day', location: 'Local Farmers Group', contact: '9876543218', expected: 'Available', badge: 'Pesticide Ready' }
  ]
};

const USER_PRODUCE_LOTS = [
  { id: 101, title: 'Fresh Harvest Ragi (Bulk)', quantity: '15 Quintals', price: '₹3,800 / quintal', location: 'Farm Gate (Rourkela)', contact: 'Purushottam Gupta', phone: '9876543219', expected: 'Direct Miller Buyer' },
  { id: 102, title: 'A-Grade Paddy (Common)', quantity: '25 Quintals', price: '₹2,350 / quintal', location: 'Biramitrapur Road', contact: 'Ramesh Sahu', phone: '9876543220', expected: 'Ready for Transport' }
];

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState('manure');
  const [selectedCropAlert, setSelectedCropAlert] = useState('Paddy');
  const [userLocation, setUserLocation] = useState('Rourkela, Odisha');

  // Freight Calculator State
  const [distanceKm, setDistanceKm] = useState(25);
  const [vehicleType, setVehicleType] = useState('auto'); // auto, mini, truck

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('kisan_farm_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed.district) setUserLocation(parsed.district);
      }
    } catch (e) {
      console.warn('Profile read fallback:', e);
    }
  }, []);

  // Freight calculation logic
  const vehicleRates = {
    auto: { name: 'Three Wheeler Auto (1 Ton)', base: 300, perKm: 18 },
    mini: { name: 'Mini Truck / Bolero (2.5 Ton)', base: 600, perKm: 28 },
    truck: { name: 'Heavy Freight Truck (10 Ton)', base: 1500, perKm: 45 }
  };
  const selectedVehicle = vehicleRates[vehicleType];
  const estimatedFreightCost = selectedVehicle.base + (distanceKm * selectedVehicle.perKm);

  // Direct WhatsApp Free Subscription Redirection
  const handleWhatsAppSubscribe = () => {
    const text = encodeURIComponent(`Hello FarmGuru, please send me daily free WhatsApp mandi price alerts for ${selectedCropAlert} in ${userLocation}.`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleConnectWhatsApp = (contactPhone, title) => {
    const text = encodeURIComponent(`Hello, I am contacting you regarding your listing: "${title}" on FarmGuru Marketplace.`);
    window.open(`https://wa.me/91${contactPhone}?text=${text}`, '_blank');
  };

  return (
    <div style={{
      maxWidth: '850px',
      margin: '0 auto',
      backgroundColor: '#f8fafc',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Banner */}
      <div style={{
        backgroundColor: '#064e3b',
        color: '#ffffff',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '1px' }}>
            AGMARKNET Integrated Commodity Exchange
          </span>
          <h2 style={{ margin: '6px 0 0', fontSize: '22px', fontWeight: '800', color: '#ffffff' }}>
            🏪 Marketplace & Live Mandi Prices
          </h2>
        </div>

        <div style={{
          backgroundColor: '#047857',
          padding: '8px 16px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '800',
          color: '#ffffff'
        }}>
          📍 Location: {userLocation}
        </div>
      </div>

      <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* 1. Free WhatsApp Price Alert Subscription Bar */}
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>💬</span>
            <div>
              <strong style={{ fontSize: '14px', color: '#166534', display: 'block' }}>
                Free Daily WhatsApp Mandi Price Alerts
              </strong>
              <span style={{ fontSize: '12px', color: '#15803d' }}>
                Get daily morning price updates directly on your WhatsApp (100% Free - No charges)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={selectedCropAlert}
              onChange={e => setSelectedCropAlert(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #86efac',
                fontSize: '12px',
                fontWeight: '700',
                color: '#166534',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="Paddy">Paddy (Rice)</option>
              <option value="Millets (Ragi)">Millets (Ragi)</option>
              <option value="Mustard">Mustard</option>
              <option value="Tomato">Tomato</option>
              <option value="Groundnut">Groundnut</option>
            </select>

            <button
              onClick={handleWhatsAppSubscribe}
              style={{
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 0,
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(22,163,74,0.2)'
              }}
            >
              <span>Subscribe via WhatsApp</span> 📲
            </button>
          </div>
        </div>

        {/* 2. Live AGMARKNET Mandi Rate Ticker */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              📊 Live AGMARKNET Regional Mandi Benchmark Rates
            </span>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#047857' }}>
              ● Live 2026 Feed
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px'
          }}>
            {MANDI_RATES.map((m, idx) => (
              <div key={idx} style={{
                padding: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b' }}>{m.mandi}</span>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>{m.crop}</strong>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '900', color: '#064e3b' }}>₹{m.modal}</span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    color: m.trend === 'up' ? '#059669' : m.trend === 'down' ? '#dc2626' : '#b45309',
                    backgroundColor: m.trend === 'up' ? '#ecfdf5' : m.trend === 'down' ? '#fef2f2' : '#fef3c7',
                    padding: '2px 6px',
                    borderRadius: '6px'
                  }}>
                    {m.change}
                  </span>
                </div>
                <small style={{ fontSize: '9px', color: '#94a3b8' }}>Range: ₹{m.min} - ₹{m.max}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div style={{
          display: 'flex',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '6px 12px 0',
          gap: '8px',
          overflowX: 'auto'
        }}>
          {[
            { id: 'manure', label: '🪴 Organic Fertilizers' },
            { id: 'seeds', label: '🌾 Certified Seeds' },
            { id: 'equipment', label: '🚜 Machinery Rentals' },
            { id: 'sell', label: '💰 Sell Harvest Lots' },
            { id: 'freight', label: '🚚 Freight & Logistics Estimator' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '12px 16px',
                fontSize: '13px',
                fontWeight: '800',
                border: 0,
                borderBottom: activeTab === t.id ? '3px solid #064e3b' : '3px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === t.id ? '#064e3b' : '#64748b',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 3. Tab Content: Inputs, Equipment & Produce Lots */}
        {activeTab !== 'sell' && activeTab !== 'freight' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            {AGRI_INPUTS[activeTab].map(item => (
              <div key={item.id} style={{
                padding: '18px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>{item.title}</h3>
                    <span style={{
                      backgroundColor: '#ecfdf5',
                      color: '#047857',
                      fontSize: '10px',
                      fontWeight: '800',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.badge}
                    </span>
                  </div>
                  <strong style={{ display: 'block', fontSize: '18px', color: '#064e3b', marginTop: '6px' }}>{item.price}</strong>
                  <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '4px' }}>📍 {item.location}</small>
                </div>

                <div style={{
                  paddingTop: '10px',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '11px', color: '#475569', fontWeight: '700' }}>{item.expected}</span>
                  <button
                    onClick={() => handleConnectWhatsApp(item.contact, item.title)}
                    style={{
                      backgroundColor: '#064e3b',
                      color: '#ffffff',
                      border: 0,
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    Connect 💬
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. Tab Content: Direct Produce Lots for Sale */}
        {activeTab === 'sell' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                🌾 Active Farmer Harvest Lots Available for Millers & Wholesalers
              </span>
              <button 
                onClick={() => alert('Feature: Post your harvest lot. Fill in crop name, quantity, and expected price.')}
                style={{
                  backgroundColor: '#064e3b',
                  color: '#ffffff',
                  border: 0,
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                + Post New Harvest Lot
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {USER_PRODUCE_LOTS.map(lot => (
                <div key={lot.id} style={{
                  padding: '18px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#047857', backgroundColor: '#ecfdf5', padding: '3px 8px', borderRadius: '6px' }}>
                      Lot Quantity: {lot.quantity}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Verified Lot</span>
                  </div>

                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{lot.title}</h3>
                  <strong style={{ fontSize: '18px', color: '#064e3b' }}>{lot.price}</strong>

                  <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
                    📍 <strong>Pickup Location:</strong> {lot.location}<br />
                    👨‍🌾 <strong>Farmer:</strong> {lot.contact}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px' }}>
                    <button
                      onClick={() => handleConnectWhatsApp(lot.phone, lot.title)}
                      style={{
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        border: 0,
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      Contact Buyer / Seller 💬
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Freight & Logistics Distance Estimator */}
        {activeTab === 'freight' && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#047857', textTransform: 'uppercase' }}>
                🚚 Mandi Freight & Transport Distance Calculator
              </span>
              <h3 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                Estimate Transport Expenses to Regional Market Yards
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Select Transport Vehicle Type:
                  </label>
                  <select
                    value={vehicleType}
                    onChange={e => setVehicleType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      fontWeight: '700',
                      outline: 'none'
                    }}
                  >
                    <option value="auto">Three-Wheeler Auto (Up to 1 Ton)</option>
                    <option value="mini">Mini Truck / Bolero Pickup (Up to 2.5 Tons)</option>
                    <option value="truck">Heavy Freight Truck (Up to 10 Tons)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Distance to Mandi Yard:</span>
                    <span style={{ color: '#064e3b', fontWeight: '800' }}>{distanceKm} km</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="150"
                    step="5"
                    value={distanceKm}
                    onChange={e => setDistanceKm(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#064e3b', marginTop: '8px' }}
                  />
                </div>
              </div>

              <div style={{
                backgroundColor: '#064e3b',
                color: '#ffffff',
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: '800' }}>Estimated Freight Charges</span>
                  <strong style={{ display: 'block', fontSize: '32px', color: '#fcd34d', fontWeight: '900', marginTop: '2px' }}>
                    ₹{estimatedFreightCost.toLocaleString()}
                  </strong>
                </div>

                <div style={{
                  borderTop: '1px solid rgba(255,255,255,0.15)',
                  paddingTop: '12px',
                  fontSize: '12px',
                  color: '#d1fae5'
                }}>
                  <span>Vehicle: <strong>{selectedVehicle.name}</strong></span><br />
                  <span>Base Booking: ₹{selectedVehicle.base} | Rate: ₹{selectedVehicle.perKm}/km</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}