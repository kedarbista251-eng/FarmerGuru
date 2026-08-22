import React, { useState } from 'react';

export default function SpecialistCommunity() {
  const [posts, setPosts] = useState([
    { id: 1, author: 'Dr. Ramesh Rao (Agronomist)', q: 'How to control leaf blight in late-season maize?', a: 'Apply copper-based organic fungicide and maintain proper row spacing.' },
    { id: 2, author: 'Sunil Kumar (Farmer Peer)', q: 'What is the current mandi support price for pulses in Odisha?', a: 'Modal price is averaging around ₹6,800 per quintal.' }
  ]);
  const [newQ, setNewQ] = useState('');

  const handlePost = (e) => {
    e.preventDefault();
    if (!newQ) return;
    setPosts([{ id: Date.now(), author: 'You (Registered Farmer)', q: newQ, a: 'Specialist reviewing your query. Expect response in 2 hours.' }, ...posts]);
    setNewQ('');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-6 border border-emerald-100 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase">Expert Guidance & Quora</span>
          <h2 className="text-2xl font-extrabold text-emerald-950">👨‍🌾 Specialist & Community Forum</h2>
        </div>
        <span className="text-4xl">💬</span>
      </div>

      <form onSubmit={handlePost} className="space-y-2">
        <textarea value={newQ} onChange={e=>setNewQ(e.target.value)} placeholder="Ask agricultural specialists or peer farmers..." className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-emerald-600 h-20 resize-none" />
        <button type="submit" className="bg-emerald-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow">Post Question</button>
      </form>

      <div className="space-y-4">
        {posts.map(p => (
          <div key={p.id} className="p-4 rounded-2xl border bg-gray-50 space-y-2">
            <p className="text-xs font-bold text-emerald-800">{p.author}</p>
            <p className="text-sm font-semibold text-gray-900">Q: {p.q}</p>
            <p className="text-xs text-gray-600 bg-white p-3 rounded-xl border">💡 Answer: {p.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}