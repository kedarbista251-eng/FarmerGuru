import React from 'react';

export default function WeatherRisk() {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Live Environmental Data</span>
          <h2 className="text-2xl font-extrabold text-emerald-900">⛈️ Weather & Market Risk</h2>
        </div>
        <span className="text-4xl">🛡️</span>
      </div>

      <div className="p-6 rounded-2xl bg-emerald-600 text-white shadow-lg flex items-center justify-between">
        <div>
          <p className="text-xs uppercase font-bold tracking-wider opacity-90">Farm Health & Safety Score</p>
          <p className="text-4xl font-black mt-1">85 / 100</p>
          <span className="inline-block mt-2 bg-black/20 px-3 py-1 rounded-full text-xs font-bold">
            🟢 Low Climate & Financial Risk
          </span>
        </div>
        <div className="text-5xl">🌤️</div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-gray-800 text-sm">Active Advisories:</h3>
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex gap-3 items-start">
          <span className="text-xl">✅</span>
          <p className="text-sm text-gray-700 font-medium">Weather conditions optimal for upcoming sowing schedule. No heavy rainfall expected for 5 days.</p>
        </div>
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 items-start">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-gray-700 font-medium">Mandi prices for Paddy are stable, but consider storing harvest if local glut occurs.</p>
        </div>
      </div>
    </div>
  );
}