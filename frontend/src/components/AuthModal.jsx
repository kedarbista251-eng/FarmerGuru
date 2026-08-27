import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, defaultTab = 'login', onRegisterSuccess }) {
    const [tab, setTab] = useState(defaultTab); // 'login' or 'register'
    const [identifier, setIdentifier] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('Farmer');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [forgot, setForgot] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const { login, register } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (forgot) return;

        setLoading(true);

        try {
            if (forgot) {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
                const endpoint = otpSent ? 'verify' : 'request';
                const body = otpSent ? { phone: identifier, otp, new_password: newPassword } : { phone: identifier };
                const response = await fetch(`${apiUrl}/auth/password-reset/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                const data = await response.json();
                if (!response.ok) throw new Error(data.detail || 'Password reset failed');
                if (!otpSent) setOtpSent(true); else { setForgot(false); setOtpSent(false); setError('Password updated. Sign in with your new password.'); }
            } else if (tab === 'login') {
                await login(identifier, password);
                onClose();
            } else {
                await register(email, phone, password, fullName, role);
                if (onRegisterSuccess) {
                    onRegisterSuccess();
                }
                onClose();
            }
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
                    <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '12px', background: 'rgba(21, 117, 82, 0.1)', color: '#157552', marginBottom: '0.75rem' }}><Shield size={28} /></div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{forgot ? 'Reset your password' : tab === 'login' ? 'Welcome Back' : 'Create an Account'}</h2>
                    <p style={{ color: '#628276', fontSize: '0.9rem', margin: 0 }}>{forgot ? 'Verify your phone number to continue' : tab === 'login' ? 'Sign in with your email or phone number' : 'Join FarmGuru with a verified phone number'}</p>
                </div>

                {/* Quick Demo Buttons */}
                <div style={{ marginBottom: '1.25rem', padding: '0.75rem 0.9rem', background: 'rgba(21, 117, 82, 0.08)', borderRadius: '10px', border: '1px solid rgba(21, 117, 82, 0.2)', color: '#628276', fontSize: '0.82rem' }}>
                    Secure access for farmers, advisors, and crop specialists.
                </div>

                {!forgot && <>
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
                </div></>}


                {error && (
                    <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {forgot ? <>
                        <label>Phone number<input type="tel" required placeholder="+91 9876543210" value={identifier} onChange={(e) => setIdentifier(e.target.value)} /></label>
                        {otpSent && <label>Verification code<input inputMode="numeric" required value={otp} onChange={(e) => setOtp(e.target.value)} /></label>}
                        {otpSent && <label>New password<input type="password" required minLength="6" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></label>}
                    </> : <>
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

                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem' }}>{tab === 'login' ? 'Email or phone number' : 'Email Address'}</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#628276' }} />
                            <input
                                type={tab === 'login' ? 'text' : 'email'}
                                required
                                placeholder={tab === 'login' ? 'name@domain.com or +91 9876543210' : 'name@domain.com'}
                                value={tab === 'login' ? identifier : email}
                                onChange={(e) => tab === 'login' ? setIdentifier(e.target.value) : setEmail(e.target.value)}
                                style={{ width: '100%', padding: '0.65rem 0.65rem 0.65rem 2.4rem', borderRadius: '8px', border: '1px solid #cfe1d7', background: '#fff', color: '#1d4034' }}
                            />
                        </div>
                    {tab === 'register' && <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500 }}>Phone number<input type="tel" required placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>}

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




                    </>}
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', justifyContent: 'center' }}>
                        {loading ? 'Processing...' : forgot ? (otpSent ? 'Update password' : 'Send verification code') : tab === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
                    </button>
                </form>
                {!forgot && tab === 'login' && <button onClick={() => { setForgot(true); setError(''); }} style={{ marginTop: 14, background: 'none', border: 0, color: '#157552', cursor: 'pointer' }}>Forgot password?</button>}
                {forgot && <button onClick={() => { setForgot(false); setOtpSent(false); setError(''); }} style={{ marginTop: 14, background: 'none', border: 0, color: '#157552', cursor: 'pointer' }}>Back to sign in</button>}
            </div>
        </div>
    );
}
