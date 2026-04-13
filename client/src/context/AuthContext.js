import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ SAFE PARSE
  const safeParse = (data) => {
    try {
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error("Invalid JSON in localStorage");
      return null;
    }
  };

  // ✅ LOAD USER ON REFRESH
 

  // ✅ LOGIN
  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });

    const { token, user } = res.data;

    // ✅ store properly
    localStorage.setItem('mm_token', token);
    localStorage.setItem('mm_user', JSON.stringify(user));

    setUser(user);
    return res.data;
  }, []);

   useEffect(() => {
    const token = localStorage.getItem('mm_token');
    const storedUser = localStorage.getItem('mm_user');

    const parsedUser = safeParse(storedUser);

    if (token && parsedUser) {
      setUser(parsedUser);

      // ✅ verify token with backend
      api.get('/auth/me')
        .then(res => {
          setUser(res.data.user);
          localStorage.setItem('mm_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          logout(); // invalid token
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ✅ REGISTER
  const register = useCallback(async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });

    const { token, user } = res.data;

    // ✅ store properly
    localStorage.setItem('mm_token', token);
    localStorage.setItem('mm_user', JSON.stringify(user));

    setUser(user);
    return res.data;
  }, []);

  // ✅ LOGOUT
  const logout = useCallback(() => {
    localStorage.removeItem('mm_token');
    localStorage.removeItem('mm_user');
    setUser(null);
  }, []);

  // ✅ UPDATE USER
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('mm_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ HOOK
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};