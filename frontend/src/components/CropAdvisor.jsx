import React from 'react';

export default function CropAdvisor() {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-6 border border-emerald-100 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase">Soil & Market Analytics</span>
          <h2 className="text-2xl font-extrabold text-emerald-950">🌱 What to Plant & Eco-Farming</h2>
        </div>
        <span className="text-4xl">🌾</span>
      </div>

      <div className="p-6 rounded-2xl bg-emerald-900 text-white shadow-lg space-y-2">
        <span className="bg-amber-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">Optimal Sustainable Combo</span>
        <h3 className="text-xl font-black">Primary: Millets (Ragi) + Companion: Pigeon Pea</h3>
        <p className="text-emerald-200 text-xs leading-relaxed">
          Based on your Alluvial soil properties, historical demand, and area climate. Fixes soil nitrogen naturally and uses 70% less water while avoiding local paddy market saturation.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border bg-gray-50">
          <p className="text-xs text-gray-500 font-semibold">Peer Farmer Saturation</p>
          <p className="text-sm font-bold text-gray-800 mt-1">Paddy (65% - High Risk)</p>
        </div>
        <div className="p-4 rounded-xl border bg-gray-50">
          <p className="text-xs text-gray-500 font-semibold">Seed Availability</p>
          <p className="text-sm font-bold text-emerald-700 mt-1">High Stock in Local Hub</p>
        </div>
      </div>
    </div>
  );
}   