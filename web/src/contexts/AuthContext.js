'use client';

import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { registerUnauthorizedListener } from '../services/apiClient';
import { LoginModal } from '../components/auth/LoginModal';
import { RegisterModal } from '../components/auth/RegisterModal';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => { },
  register: async () => { },
  logout: async () => { },
  openLogin: () => { },
  openRegister: () => { },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);

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
        const email = params.get('email');

        if (isVerified) {
          setIsVerifiedSuccess(true);
          if (email) {
            setLoginEmail(email);
          }
          try {
            const channel = new BroadcastChannel('auth_channel');
            channel.postMessage({ type: 'EMAIL_VERIFIED', email });
            channel.close();
          } catch (e) {
            console.error('Broadcast error:', e);
          }

          toast.success('Xác thực tài khoản thành công! Vui lòng đăng nhập.');
          window.history.replaceState(null, '', `${window.location.pathname}`);
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const channel = new BroadcastChannel('auth_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'EMAIL_VERIFIED') {
            const email = event.data?.email;
            if (email) {
              setLoginEmail(email);
            }
            setIsRegisterOpen(false);
            setIsVerifiedSuccess(true);
            toast.success('Tài khoản đã được xác thực thành công! Vui lòng đăng nhập.');

            const originalTitle = document.title;
            document.title = '🔔 Kích hoạt thành công!';
            setTimeout(() => {
              document.title = originalTitle;
            }, 5000);
          }
        };
        return () => channel.close();
      } catch (e) {
        console.error('BroadcastChannel error:', e);
      }
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
        defaultEmail={loginEmail}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={closeRegister}
        onSwitchToLogin={switchToLogin}
      />

      {isVerifiedSuccess && (
        <Modal
          isOpen={true}
          onClose={() => setIsVerifiedSuccess(false)}
          title="Xác thực thành công"
          size="md"
        >
          <div className="flex flex-col items-center text-center py-6 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center animate-bounce">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-neutral-900">Kích hoạt tài khoản thành công!</h3>
              <p className="text-sm text-neutral-600 max-w-sm">
                Chúc mừng! Tài khoản của bạn đã được xác thực thành công. Vui lòng đăng nhập để tiếp tục sử dụng dịch vụ.
              </p>
            </div>

            <div className="w-full pt-2">
              <Button
                variant="primary"
                onClick={() => {
                  setIsVerifiedSuccess(false);
                  setIsLoginOpen(true);
                }}
                className="w-full"
              >
                Đăng nhập ngay
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AuthContext.Provider>
  );
};
