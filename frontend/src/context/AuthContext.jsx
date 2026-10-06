import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('careerai_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('careerai_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  // If we already have both token and cached user, don't show full-screen blocking loader
  const [loading, setLoading] = useState(() => {
    const storedToken = localStorage.getItem('careerai_token');
    const storedUser = localStorage.getItem('careerai_user');
    return !!(storedToken && !storedUser);
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('careerai_token');
      if (storedToken) {
        try {
          const res = await userService.getMe();
          if (res && res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('careerai_user', JSON.stringify(res.data));
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session validation check:', err);
          // Only log out if definitely rejected with 401 (not transient network delay)
          if (err?.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res && res.success && res.data) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('careerai_token', receivedToken);
      localStorage.setItem('careerai_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return res.data;
    }
    throw new Error(res?.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res && res.success && res.data) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('careerai_token', receivedToken);
      localStorage.setItem('careerai_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return res.data;
    }
    throw new Error(res?.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('careerai_token');
    localStorage.removeItem('careerai_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('careerai_user', JSON.stringify(updatedUserData));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
