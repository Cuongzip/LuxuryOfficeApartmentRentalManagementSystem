'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/constants';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { PublicHeader } from '@/components/layout/PublicHeader';
import toast from 'react-hot-toast';

export default function PublicHome() {
  const { user, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isVerified = params.get('verified') === 'true';
      const showLogin = params.get('showLogin') === 'true';
      const showRegister = params.get('showRegister') === 'true';

      Promise.resolve().then(() => {
        if (isVerified) {
          toast.success('Xác thực tài khoản thành công! Vui lòng đăng nhập.');
          setIsLoginOpen(true);
          window.history.replaceState(null, '', `${window.location.pathname}?showLogin=true`);
        } else if (showLogin) {
          setIsLoginOpen(true);
        } else if (showRegister) {
          setIsRegisterOpen(true);
        }
      });
    }
  }, []);

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleCloseRegister = () => {
    setIsRegisterOpen(false);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleSwitchToRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${window.location.pathname}?showRegister=true`);
    }
  };

  const handleSwitchToLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${window.location.pathname}?showLogin=true`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-neutral-900 font-sans selection:bg-brand selection:text-white">
      <PublicHeader
        user={user}
        logout={logout}
        onLoginClick={() => {
          setIsLoginOpen(true);
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', `${window.location.pathname}?showLogin=true`);
          }
        }}
        onRegisterClick={() => {
          setIsRegisterOpen(true);
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', `${window.location.pathname}?showRegister=true`);
          }
        }}
      />

      <main className="flex-1 flex flex-col">
        <section className="relative py-28 md:py-36 flex flex-col items-center justify-center text-center px-6 overflow-hidden border-b border-neutral-100 bg-neutral-50/30">
          <div className="absolute top-[10%] left-[-15%] w-[45vw] h-[45vw] rounded-full bg-neutral-100/40 blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-[10%] right-[-15%] w-[45vw] h-[45vw] rounded-full bg-neutral-100/40 blur-[120px] pointer-events-none"></div>

          <span className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase mb-4">Luxury Office & Apartment Management</span>
          <h1 className="max-w-4xl text-5xl md:text-7xl font-extrabold tracking-tight text-neutral-900 leading-[1.1] mb-6">
            Kiến tạo không gian <br />
            <span className="text-brand">Làm việc & Đáng sống</span>
          </h1>
          <p className="max-w-2xl text-base md:text-lg text-neutral-600 leading-relaxed mb-10">
            Hệ thống quản lý dịch vụ cho thuê văn phòng và căn hộ chung cư cao cấp. Trải nghiệm quy trình quản lý thông minh, tinh giản, dịch vụ hỗ trợ 24/7.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {user ? (
              <Link
                href={user.role === ROLES.ADMIN || user.role === ROLES.EMPLOYEE ? '/admin' : '/customer/dashboard'}
                className="w-full sm:w-auto px-8 py-4 bg-brand text-white font-semibold rounded-lg hover:bg-brand-hover transition-all text-center shadow-sm"
              >
                Quản lý hệ thống của bạn
              </Link>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsLoginOpen(true);
                    if (typeof window !== 'undefined') {
                      window.history.replaceState(null, '', `${window.location.pathname}?showLogin=true`);
                    }
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-brand text-white font-semibold rounded-lg hover:bg-brand-hover transition-all text-center cursor-pointer shadow-sm"
                >
                  Trải nghiệm hệ thống ngay
                </button>
                <a
                  href="#features"
                  className="w-full sm:w-auto px-8 py-4 border border-neutral-200 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition-all text-center"
                >
                  Tìm hiểu thêm
                </a>
              </>
            )}
          </div>
        </section>

        <section id="features" className="py-24 px-8 md:px-16 max-w-6xl mx-auto space-y-16">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">Dịch vụ quản lý tinh giản</h2>
            <p className="text-neutral-500 text-sm">Cung cấp các công cụ cần thiết cho cả người thuê và ban quản lý vận hành tòa nhà.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl border border-neutral-200 bg-white relative group hover:border-brand transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-lg mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-3">Tòa nhà & Căn hộ</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Quản lý chi tiết danh sách tòa nhà, số tầng, phân loại phòng dịch vụ, diện tích sử dụng và cập nhật trạng thái phòng tức thì.
              </p>
            </div>

            <div className="p-8 rounded-xl border border-neutral-200 bg-white relative group hover:border-brand transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold text-lg mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-3">Hợp đồng & Hóa đơn</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Tự động hóa lập hợp đồng thuê văn phòng/căn hộ, theo dõi tiến độ thanh toán và phát hành hóa đơn dịch vụ hàng tháng.
              </p>
            </div>

            <div className="p-8 rounded-xl border border-neutral-200 bg-white relative group hover:border-brand transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-3">Yêu cầu & Cư dân</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Tiếp nhận và xử lý nhanh chóng các yêu cầu bảo trì kỹ thuật, kiểm soát thông tin cư dân và thẻ ra vào tòa nhà an toàn.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 py-12 px-8 md:px-16 bg-neutral-50 text-center text-sm text-neutral-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Luxury Rental Management. Bảo lưu mọi quyền.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-neutral-900 transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Liên hệ hỗ trợ</a>
          </div>
        </div>
      </footer>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={handleCloseLogin}
        onSwitchToRegister={handleSwitchToRegister}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={handleCloseRegister}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
}
