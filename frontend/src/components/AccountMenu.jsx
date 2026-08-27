import React, { useState } from 'react';
import { LogOut, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AccountMenu({ onClose, onSignedOut }) {
  const { user, updateAccount, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateAccount({ full_name: fullName, email, phone });
      setMessage('Account details updated');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <section className="modal-content account-modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close account settings"><X size={20} /></button>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ margin: '0 auto 10px', width: 58, height: 58, borderRadius: '50%', background: '#d1fae5', color: '#065f46', display: 'grid', placeItems: 'center' }}><UserRound size={28} /></div>
          <h2 style={{ margin: 0 }}>Your account</h2>
          <p style={{ color: '#628276', fontSize: 13 }}>{user?.email}</p>
        </div>
        {message && <p style={{ color: message.includes('updated') ? '#047857' : '#b91c1c', fontSize: 13 }}>{message}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label className="account-field">Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} required /></label>
          <label className="account-field">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label className="account-field">Phone number<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required /></label>
          <button className="btn btn-primary account-save" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
        </form>
        <button onClick={() => { logout(); onClose(); onSignedOut(); }} style={{ marginTop: 16, width: '100%', background: 'transparent', border: '1px solid #cbd5e1', color: '#334155', padding: 10, borderRadius: 8, cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: 8 }}><LogOut size={16} /> Sign out</button>
      </section>
    </div>
  );
}
