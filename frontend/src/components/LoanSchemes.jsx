import React from 'react';

export default function LoanSchemes() {
  const schemes = [
    { title: 'PM-Kisan Samman Nidhi', benefit: '₹6,000 annual direct income support', eligibility: 'All landholding farmer families' },
    { title: 'Kisan Credit Card (KCC)', benefit: 'Low-interest institutional credit up to ₹3 Lakhs', eligibility: 'Farmers, cultivators & sharecroppers' },
    { title: 'Soil Health Card Subsidy Grant', benefit: 'Free soil testing & customized fertilizer subsidy', eligibility: 'Registered agricultural property owners' }
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-6 border border-emerald-100 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase">Government Subsidies</span>
          <h2 className="text-2xl font-extrabold text-emerald-950">🏛️ Loan & Scheme Suggestions</h2>
        </div>
        <span className="text-4xl">📜</span>
      </div>

      <div className="space-y-4">
        {schemes.map((s, i) => (
          <div key={i} className="p-4 rounded-2xl border bg-emerald-50/40 space-y-2">
            <h3 className="font-bold text-emerald-950 text-base">{s.title}</h3>
            <p className="text-xs text-gray-700">🎁 <strong className="text-emerald-800">Benefit:</strong> {s.benefit}</p>
            <p className="text-xs text-gray-700">📋 <strong className="text-gray-900">Eligibility:</strong> {s.eligibility}</p>
            <button className="mt-2 bg-emerald-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow">Apply / Enquire</button>
          </div>
        ))}
      </div>
    </div>
  );
}