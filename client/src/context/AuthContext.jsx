import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const data = await api.get('/auth/me');
        if (mounted) setUser(data.user);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  const storeAuth = useCallback((u, t) => {
    if (t) setToken(t);
    setUser(u);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    storeAuth(data.user, data.token);
    return data.user;
  }, [storeAuth]);

  const signup = useCallback(async (name, email, password) => {
    const data = await api.post('/auth/signup', { name, email, password });
    storeAuth(data.user, data.token);
    return data.user;
  }, [storeAuth]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore network errors on logout
    } finally {
      setToken(null);
      setUser(null);
    }
  }, []);

  const loginWithToken = useCallback(async (newToken) => {
    setToken(newToken);
    const data = await api.get('/auth/me');
    storeAuth(data.user, newToken);
    return data.user;
  }, [storeAuth]);

  return (
    <AuthContext.Provider value={{ user, token: user ? localStorage.getItem('resume_token') : null, loading, login, signup, logout, loginWithToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}