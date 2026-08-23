import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }) {
    const [tab, setTab] = useState(defaultTab); // 'login' or 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('Farmer');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Strict email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);

        try {
            if (tab === 'login') {
                await login(email, password);
            } else {
                await register(email, password, fullName, role);
            }
            onClose();
        } catch (err) {
            setError(err.message || 'Authentication failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="auth-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '12px', background: 'rgba(21, 117, 82, 0.1)', color: '#157552', marginBottom: '0.75rem' }}>
                        <Shield size={28} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                        {tab === 'login' ? 'Welcome Back' : 'Create an Account'}
                    </h2>
                    <p style={{ color: '#628276', fontSize: '0.9rem', margin: 0 }}>
                        {tab === 'login' ? 'Sign in to access your farm advisor and tools' : 'Join thousands of farmers using FarmGuru today'}
                    </p>
                </div>

                {/* Quick Demo Buttons */}
                <div style={{ marginBottom: '1.25rem', padding: '0.75rem 0.9rem', background: 'rgba(21, 117, 82, 0.08)', borderRadius: '10px', border: '1px solid rgba(21, 117, 82, 0.2)', color: '#628276', fontSize: '0.82rem' }}>
                    Secure access for farmers, advisors, and crop specialists.
                </div>

                {/* Tab Switcher */}
                <div style={{ display: 'flex', borderBottom: '1px solid #d5e8dc', marginBottom: '1.5rem' }}>
                    <button
                        className={`tab-btn ${tab === 'login' ? 'active' : ''}`}
                        onClick={() => { setTab('login'); setError(''); }}
                        style={{ flex: 1, padding: '0.75rem', textAlign: 'center', background: 'none', border: 'none', color: tab === 'login' ? '#157552' : '#628276', borderBottom: tab === 'login' ? '2px solid #157552' : 'none', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Sign In
                    </button>
                    <button
                        className={`tab-btn ${tab === 'register' ? 'active' : ''}`}
                        onClick={() => { setTab('register'); setError(''); }}
                        style={{ flex: 1, padding: '0.75rem', textAlign: 'center', background: 'none', border: 'none', color: tab === 'register' ? '#157552' : '#628276', borderBottom: tab === 'register' ? '2px solid #157552' : 'none', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Register
                    </button>
                </div>


                {error && (
                    <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {tab === 'register' && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#628276' }} />
                                <input
                                    type="text"
                                    required
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    style={{ width: '100%', padding: '0.65rem 0.65rem 0.65rem 2.4rem', borderRadius: '8px', border: '1px solid #cfe1d7', background: '#fff', color: '#1d4034' }}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#628276' }} />
                            <input
                                type="email"
                                required
                                placeholder="name@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '0.65rem 0.65rem 0.65rem 2.4rem', borderRadius: '8px', border: '1px solid #cfe1d7', background: '#fff', color: '#1d4034' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#628276' }} />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '0.65rem 0.65rem 0.65rem 2.4rem', borderRadius: '8px', border: '1px solid #cfe1d7', background: '#fff', color: '#1d4034' }}
                            />
                        </div>
                    </div>




                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', justifyContent: 'center' }}
                    >
                        {loading ? 'Processing...' : tab === 'login' ? 'Sign In' : 'Create Account'}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>
            </div>
        </div>
    );
}
