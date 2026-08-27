import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const INITIAL_CLANS = [
  { id: 'agronomy', name: 'Agronomy Specialists', icon: '🔬', members: 12, topic: 'Crop Health & Soil', tag: 'Crop Health', joined: false },
  { id: 'mandi', name: 'Odisha Mandi Guild', icon: '📈', members: 480, topic: 'Price Trends & Logistics', tag: 'Mandi Prices', joined: false },
  { id: 'organic', name: 'Organic Farming Clan', icon: '🌱', members: 210, topic: 'Bio-pesticides & Compost', tag: 'Organic', joined: false }
];

const TICKER_ALERTS = [
  "📢 Odisha Mandi: Paddy rates up by ₹150/quintal today across Sambalpur & Bargarh yards",
  "⚠️ Pest Warning: Fall armyworm spotted in maize fields; inspect leaves early morning",
  "🌦️ Weather Update: Scattered rain expected across coastal belts over next 48 hours"
];

const INITIAL_POSTS = [
  {
    id: 1,
    author: 'Dr. Ramesh Rao',
    role: 'Agronomist',
    badgeColor: '#047857',
    q: 'How to control leaf blight in late-season maize?',
    a: 'Apply copper-based organic fungicide and maintain proper row spacing to optimize air circulation.',
    likes: 14,
    time: '2h ago',
    tag: 'Crop Health',
    clanId: 'agronomy',
    image: null,
    replies: [
      { id: 101, author: 'Suresh Das', text: 'Does copper oxychloride work well for this?', time: '1h ago' }
    ]
  },
  {
    id: 2,
    author: 'Sunil Kumar',
    role: 'Lead Farmer',
    badgeColor: '#b45309',
    q: 'What is the current mandi support price for pulses in Odisha?',
    a: 'Modal price is averaging around ₹6,800 per quintal across major yard markets today.',
    likes: 8,
    time: '5h ago',
    tag: 'Mandi Prices',
    clanId: 'mandi',
    image: null,
    replies: []
  }
];

export default function SpecialistCommunity() {
  const { user } = useAuth();
  const [clans, setClans] = useState(INITIAL_CLANS);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [tickerAlerts, setTickerAlerts] = useState(TICKER_ALERTS);
  const [newQ, setNewQ] = useState('');
  const [selectedExpert, setSelectedExpert] = useState('agronomy');
  const [activeFilter, setActiveFilter] = useState('All');
  const [likedPosts, setLikedPosts] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [replyInputs, setReplyInputs] = useState({});
  const [openReplyBox, setOpenReplyBox] = useState({});
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState(null);

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    Promise.all([fetch(`${api}/api/community/clans`), fetch(`${api}/api/community/alerts`), fetch(`${api}/api/community/posts`)]).then(async ([clanResponse, alertResponse, postResponse]) => {
      if (clanResponse.ok) setClans(await clanResponse.json());
      if (alertResponse.ok) setTickerAlerts((await alertResponse.json()).map(alert => alert.text));
      if (postResponse.ok) setPosts((await postResponse.json()).map(post => ({ ...post, author: post.author_name, role: post.author_role, badgeColor: post.badge_color, clanId: post.clan_id, replies: post.replies.map(reply => ({ ...reply, author: reply.author_name })) })));
    }).catch(() => {});
  }, []);

  const toggleClanJoin = (clanId) => {
    setClans(prev => prev.map(c => {
      if (c.id === clanId) {
        return {
          ...c,
          joined: !c.joined,
          members: !c.joined ? c.members + 1 : c.members - 1
        };
      }
      return c;
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePost = (e) => {
    e.preventDefault();
    if (!newQ.trim()) return;

    const chosenClan = clans.find(c => c.id === selectedExpert);

    const newEntry = {
      id: Date.now(),
      author: user?.full_name || user?.email || 'Registered Farmer',
      role: 'Registered Farmer',
      badgeColor: '#0284c7',
      q: newQ.trim(),
      a: `Routed to ${chosenClan?.name || 'Specialists'}. Reviewing query, expected response within 2 hours.`,
      likes: 0,
      time: 'Just now',
      tag: chosenClan?.tag || 'General Inquiry',
      clanId: selectedExpert,
      image: imagePreview,
      replies: []
    };

    setPosts([newEntry, ...posts]);
    setNewQ('');
    setImagePreview(null);
  };

  const toggleLike = (id) => {
    setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, likes: likedPosts[id] ? p.likes - 1 : p.likes + 1 };
      }
      return p;
    }));
  };

  const handleAddReply = (postId) => {
    const text = replyInputs[postId];
    if (!text || !text.trim()) return;

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          replies: [...p.replies, { id: Date.now(), author: user?.full_name || user?.email || 'Registered Farmer', text: text.trim(), time: 'Just now' }]
        };
      }
      return p;
    }));

    setReplyInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const speakAnswer = (postId, text) => {
    if (!('speechSynthesis' in window)) return;

    if (currentlySpeakingId === postId) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';

    utterance.onend = () => setCurrentlySpeakingId(null);
    utterance.onerror = () => setCurrentlySpeakingId(null);

    setCurrentlySpeakingId(postId);
    window.speechSynthesis.speak(utterance);
  };

  const filteredPosts = posts.filter(p => {
    if (activeFilter === 'All') return true;
    return p.tag === activeFilter || p.clanId === activeFilter;
  });

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
        gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Expert Guidance & Peer Forum
          </span>
          <h2 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '800' }}>
            💬 Specialist & Community Hub
          </h2>
        </div>
        <div style={{
          backgroundColor: '#047857',
          padding: '8px 14px',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: '700',
          color: '#d1fae5'
        }}>
          ● 24 Experts Active
        </div>
      </div>

      {/* Live Regional Alert Ticker */}
      <div style={{
        backgroundColor: '#fef3c7',
        borderBottom: '1px solid #fde68a',
        padding: '8px 16px',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
      }}>
        <div style={{
          display: 'inline-block',
          animation: 'marquee 22s linear infinite',
          fontSize: '12px',
          fontWeight: '700',
          color: '#78350f'
        }}>
          {tickerAlerts.join('   •••   ')}
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </div>

      {/* Featured Clans Strip */}
      <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
          Featured Specialist Clans
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
          {clans.map(clan => (
            <div key={clan.id} style={{
              padding: '12px 14px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: activeFilter === clan.id ? '2px solid #047857' : '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <div 
                onClick={() => setActiveFilter(activeFilter === clan.id ? 'All' : clan.id)} 
                style={{ cursor: 'pointer', flex: 1 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{clan.icon}</span>
                  <strong style={{ fontSize: '13px', color: '#1e293b' }}>{clan.name}</strong>
                </div>
                <small style={{ color: '#047857', fontSize: '10px', fontWeight: '700', display: 'block', marginTop: '2px' }}>
                  {clan.members} Members • {clan.topic}
                </small>
              </div>
              <button
                onClick={() => toggleClanJoin(clan.id)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '800',
                  border: 0,
                  cursor: 'pointer',
                  backgroundColor: clan.joined ? '#e2e8f0' : '#064e3b',
                  color: clan.joined ? '#334155' : '#ffffff'
                }}
              >
                {clan.joined ? 'Joined' : '+ Join'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Post Form */}
        <form onSubmit={handlePost} style={{
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '14px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <textarea 
            value={newQ} 
            onChange={e => setNewQ(e.target.value)} 
            placeholder="Ask agricultural specialists or peer farmers a question..." 
            style={{
              width: '100%',
              minHeight: '70px',
              border: 0,
              outline: 'none',
              resize: 'none',
              fontSize: '14px',
              fontFamily: 'inherit',
              color: '#1e293b'
            }} 
          />

          {imagePreview && (
            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
              <img src={imagePreview} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
              <button 
                type="button" 
                onClick={() => setImagePreview(null)}
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  border: 0,
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                📷 <span>Attach Photo</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>

              <select 
                value={selectedExpert} 
                onChange={e => setSelectedExpert(e.target.value)}
                style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
              >
                {clans.map(c => (
                  <option key={c.id} value={c.id}>Route to: {c.name}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              disabled={!newQ.trim()} 
              style={{
                backgroundColor: '#064e3b',
                color: '#ffffff',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                border: 0,
                cursor: 'pointer',
                opacity: !newQ.trim() ? 0.5 : 1
              }}
            >
              Post Question
            </button>
          </div>
        </form>

        {/* Filter Badges */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', overflowX: 'auto' }}>
          {['All', 'Crop Health', 'Mandi Prices', 'Organic', 'General Inquiry'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: '5px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                border: '1px solid',
                borderColor: activeFilter === filter ? '#064e3b' : '#cbd5e1',
                backgroundColor: activeFilter === filter ? '#064e3b' : '#ffffff',
                color: activeFilter === filter ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Thread List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredPosts.map(p => (
            <div key={p.id} style={{
              padding: '18px',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    backgroundColor: p.badgeColor,
                    color: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: '800',
                    textTransform: 'uppercase'
                  }}>
                    {p.role}
                  </span>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>{p.author}</strong>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>• {p.time}</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#047857', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '12px' }}>
                  {p.tag}
                </span>
              </div>

              <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b', lineHeight: '1.4' }}>
                Q: {p.q}
              </p>

              {p.image && (
                <img src={p.image} alt="Crop query attachment" style={{ maxWidth: '240px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              )}

              {/* Answer Box */}
              <div style={{
                backgroundColor: '#f8fafc',
                borderLeft: '3px solid #047857',
                padding: '12px 14px',
                borderRadius: '0 8px 8px 0',
                fontSize: '13px',
                color: '#334155',
                lineHeight: '1.5',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ color: '#047857', fontSize: '11px', textTransform: 'uppercase' }}>
                    💡 Verified Answer
                  </strong>
                  <button 
                    onClick={() => speakAnswer(p.id, p.a)}
                    style={{
                      background: 'none',
                      border: 0,
                      color: currentlySpeakingId === p.id ? '#dc2626' : '#047857',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {currentlySpeakingId === p.id ? '⏹ Stop Audio' : '🔊 Listen Answer'}
                  </button>
                </div>
                {p.a}
              </div>

              {/* Thread Actions & Nested Comments */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12px', color: '#64748b', paddingTop: '4px' }}>
                <button 
                  onClick={() => toggleLike(p.id)}
                  style={{
                    background: 'none',
                    border: 0,
                    cursor: 'pointer',
                    color: likedPosts[p.id] ? '#dc2626' : '#64748b',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  {likedPosts[p.id] ? '❤️' : '🤍'} {p.likes} Helpful
                </button>
                <button 
                  onClick={() => setOpenReplyBox(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                  style={{ background: 'none', border: 0, cursor: 'pointer', color: '#64748b', fontWeight: '700' }}
                >
                  💬 Replies ({p.replies.length})
                </button>
              </div>

              {/* Nested Reply Section */}
              {openReplyBox[p.id] && (
                <div style={{ marginTop: '8px', paddingLeft: '12px', borderLeft: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {p.replies.map(r => (
                    <div key={r.id} style={{ backgroundColor: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', fontSize: '12px' }}>
                      <strong style={{ color: '#0f172a' }}>{r.author}</strong> <span style={{ color: '#94a3b8', fontSize: '10px' }}>• {r.time}</span>
                      <p style={{ margin: '2px 0 0', color: '#334155' }}>{r.text}</p>
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <input 
                      type="text" 
                      placeholder="Write a follow-up reply..." 
                      value={replyInputs[p.id] || ''}
                      onChange={e => setReplyInputs({ ...replyInputs, [p.id]: e.target.value })}
                      style={{ flex: 1, padding: '6px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
                    />
                    <button 
                      onClick={() => handleAddReply(p.id)}
                      style={{ backgroundColor: '#064e3b', color: '#fff', border: 0, borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}