'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;

const AuthContext = createContext(null);

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  return res;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refreshingRef = useRef(false);

  const fetchMe = useCallback(async () => {
    try {
      const res = await apiFetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      }
      if (res.status === 401 && !refreshingRef.current) {
        refreshingRef.current = true;
        const refreshRes = await apiFetch('/api/auth/refresh', { method: 'POST' });
        refreshingRef.current = false;
        if (refreshRes.ok) {
          const retry = await apiFetch('/api/auth/me');
          if (retry.ok) {
            const data = await retry.json();
            setUser(data.user);
            return true;
          }
        }
      }
      setUser(null);
      return false;
    } catch {
      setUser(null);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchMe().finally(() => setLoading(false));
  }, [fetchMe]);

  const login = useCallback(async (email, password) => {
    setError(null);
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data?.message || 'فشل تسجيل الدخول';
      setError(msg);
      return { ok: false, message: msg };
    }
    setUser(data.user);
    return { ok: true };
  }, []);

  const register = useCallback(async (fields) => {
    setError(null);
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(fields),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data?.message || 'فشل إنشاء الحساب';
      setError(msg);
      return { ok: false, message: msg, errors: data?.errors };
    }
    if (data.user?.isApproved) {
      setUser(data.user);
    }
    return { ok: true, user: data.user };
  }, []);

  const logout = useCallback(async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setError(null);
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, error, isAuthenticated, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
