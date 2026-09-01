import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      const data = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  const storeAuth = useCallback((u) => {
    setUser(u);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    storeAuth(data.user);
    return data.user;
  }, [storeAuth]);

  const signup = useCallback(async (name, email, password) => {
    const data = await api.post('/auth/signup', { name, email, password });
    storeAuth(data.user);
    return data.user;
  }, [storeAuth]);

  const logout = useCallback(async () => {
    await api.post('/auth/logout');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}