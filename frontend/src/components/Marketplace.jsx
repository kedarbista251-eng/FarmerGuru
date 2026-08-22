import React, { useState } from 'react';

export default function Marketplace() {
  const [tab, setTab] = useState('manure');
  const items = {
    manure: [
      { title: 'Organic Vermicompost', price: '₹12 / kg', location: 'Local Co-op', contact: '9876543210', expected: 'Stable Trend' },
      { title: 'Neem Cake Manure', price: '₹18 / kg', location: 'Agro Hub', contact: '9876543211', expected: 'High Demand' }
    ],
    seeds: [
      { title: 'Certified HYV Ragi Seeds', price: '₹55 / kg', location: 'District Seed Store', contact: '9876543212', expected: 'Government Subsidized' },
      { title: 'Drought-Resistant Pulses', price: '₹80 / kg', location: 'Krishi Kendra', contact: '9876543213', expected: 'Price Rising' }
    ],
    sell: [
      { title: 'Fresh Harvest Ragi (Bulk)', price: '₹3,200 / quintal', location: 'Farm Gate', contact: 'Direct Buyer', expected: 'Expected Peak Next Week' }
    ]
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-6 border border-emerald-100 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase">Trading & Expected Pricing</span>
          <h2 className="text-2xl font-extrabold text-emerald-950">🏪 Marketplace & Expected Price</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>setTab('manure')} className={`px-4 py-2 rounded-xl text-xs font-bold ${tab==='manure'?'bg-emerald-900 text-white':'bg-gray-100'}`}>Manure</button>
          <button onClick={()=>setTab('seeds')} className={`px-4 py-2 rounded-xl text-xs font-bold ${tab==='seeds'?'bg-emerald-900 text-white':'bg-gray-100'}`}>Seeds</button>
          <button onClick={()=>setTab('sell')} className={`px-4 py-2 rounded-xl text-xs font-bold ${tab==='sell'?'bg-emerald-900 text-white':'bg-gray-100'}`}>Sell Produce</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items[tab].map((item, i) => (
          <div key={i} className="p-4 rounded-2xl border bg-emerald-50/40 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <span className="bg-emerald-200 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md">{item.expected}</span>
              </div>
              <p className="text-emerald-900 font-black text-lg mt-1">{item.price}</p>
              <p className="text-xs text-gray-500 mt-1">📍 {item.location}</p>
            </div>
            <div className="mt-4 pt-3 border-t flex justify-between items-center">
              <span className="text-xs text-gray-600 font-semibold">Contact: {item.contact}</span>
              <button className="bg-emerald-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow">Connect</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}