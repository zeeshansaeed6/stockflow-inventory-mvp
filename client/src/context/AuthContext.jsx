/**
 * Auth context: holds current user + token in state and localStorage,
 * and exposes login/signup/logout helpers.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

const TOKEN_KEY = 'stockflow_token';
const USER_KEY = 'stockflow_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  // If a token exists on mount, verify it by fetching /auth/me.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && !user) {
      api
        .get('/auth/me')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem(USER_KEY, JSON.stringify(res.data));
        })
        .catch(() => logout());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persist(token, u) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  }

  async function login(email, password) {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      persist(data.token, data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }

  async function signup(email, password, organizationName) {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', {
        email,
        password,
        organizationName,
      });
      persist(data.token, data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
