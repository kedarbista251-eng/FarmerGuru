import React, { useState } from 'react';

export default function FarmProfile({ onSave }) {
  const [profile, setProfile] = useState({
    name: 'Ramesh Kumar',
    acreage: 5.5,
    soilType: 'Alluvial Loam',
    soilPh: 6.5,
    irrigation: 'Borewell & Canal',
    district: 'Rourkela, Odisha'
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    if (onSave) onSave(profile);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-6 border border-emerald-100">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">📝</span>
        <div>
          <h2 className="text-xl font-extrabold text-emerald-950">Farm Property Profile</h2>
          <p className="text-xs text-gray-500">Provide property data for tailored AI estimations & suggestions.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Farmer Name</label>
            <input type="text" value={profile.name} onChange={e=>setProfile({...profile, name: e.target.value})} className="w-full p-3 border rounded-xl text-sm focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Acreage (Acres)</label>
            <input type="number" value={profile.acreage} onChange={e=>setProfile({...profile, acreage: e.target.value})} className="w-full p-3 border rounded-xl text-sm focus:border-emerald-600 focus:outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Soil Type</label>
            <select value={profile.soilType} onChange={e=>setProfile({...profile, soilType: e.target.value})} className="w-full p-3 border rounded-xl text-sm focus:border-emerald-600 focus:outline-none bg-white">
              <option>Alluvial Loam</option>
              <option>Black Soil</option>
              <option>Red Soil</option>
              <option>Clay</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Soil pH Level</label>
            <input type="number" step="0.1" value={profile.soilPh} onChange={e=>setProfile({...profile, soilPh: e.target.value})} className="w-full p-3 border rounded-xl text-sm focus:border-emerald-600 focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Irrigation Source</label>
          <input type="text" value={profile.irrigation} onChange={e=>setProfile({...profile, irrigation: e.target.value})} className="w-full p-3 border rounded-xl text-sm focus:border-emerald-600 focus:outline-none" />
        </div>

        <button type="submit" className="w-full bg-emerald-800 hover:bg-emerald-900 text-white p-3 rounded-xl font-bold text-sm shadow-md transition-all">
          {saved ? '✅ Profile Saved Successfully!' : 'Save Farm Properties'}
        </button>
      </form>
    </div>
  );
}