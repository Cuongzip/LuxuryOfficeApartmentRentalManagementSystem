'use client';

import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { registerUnauthorizedListener } from '../services/apiClient';
import { LoginModal } from '../components/auth/LoginModal';
import { RegisterModal } from '../components/auth/RegisterModal';
import toast from 'react-hot-toast';

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  openLogin: () => {},
  openRegister: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleURLParams = () => {
        const params = new URLSearchParams(window.location.search);
        const isVerified = params.get('verified') === 'true';
        const showLogin = params.get('showLogin') === 'true';
        const showRegister = params.get('showRegister') === 'true';
        if (isVerified) {
          toast.success('Xác thực tài khoản thành công! Vui lòng đăng nhập.');
          setIsLoginOpen(true);
          window.history.replaceState(null, '', `${window.location.pathname}?showLogin=true`);
        } else if (showLogin) {
          setIsLoginOpen(true);
        } else if (showRegister) {
          setIsRegisterOpen(true);
        }
      };

      handleURLParams();
      window.addEventListener('popstate', handleURLParams);
      return () => window.removeEventListener('popstate', handleURLParams);
    }
  }, []);

  const updateURLOnClose = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.delete('showLogin');
      params.delete('showRegister');
      const query = params.toString();
      window.history.replaceState(null, '', query ? `${window.location.pathname}?${query}` : window.location.pathname);
    }
  };

  const closeLogin = () => {
    setIsLoginOpen(false);
    updateURLOnClose();
  };

  const closeRegister = () => {
    setIsRegisterOpen(false);
    updateURLOnClose();
  };

  const switchToLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${window.location.pathname}?showLogin=true`);
    }
  };

  const switchToRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${window.location.pathname}?showRegister=true`);
    }
  };

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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        openLogin: () => setIsLoginOpen(true),
        openRegister: () => setIsRegisterOpen(true),
      }}
    >
      {children}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={closeLogin}
        onSwitchToRegister={switchToRegister}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={closeRegister}
        onSwitchToLogin={switchToLogin}
      />
    </AuthContext.Provider>
  );
};
