'use client';

import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { registerUnauthorizedListener } from '../services/apiClient';

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = authService.getCurrentUser();

    Promise.resolve().then(() => {
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
      }
      setLoading(false);
    });

    registerUnauthorizedListener(() => {
      logout();
    });
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setToken(data.token);
      setUser(data.account);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerData) => {
    setLoading(true);
    try {
      const response = await authService.register(registerData);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
