import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Login failed');
    }

    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (email, phone, password, fullName, role) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, phone, password, full_name: fullName, role }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Registration failed');
    }

    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const updateAccount = async (account) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${apiUrl}/auth/account`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(account),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Could not update account');
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateAccount, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
