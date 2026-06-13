import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ROLES } from '@/constants';

export const PublicHeader = ({ user, logout, onLoginClick, onRegisterClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-20 border-b border-neutral-200 bg-white flex items-center justify-between px-8 md:px-16 sticky top-0 z-50">
      <Link href="/">
        <img src="/images/logo.png" alt="Logo" className="w-30 h-20 object-contain" />
      </Link>
      <nav className="flex items-center gap-6">
        <a href="#features" className="text-sm text-neutral-600 hover:text-neutral-900 transition-all font-medium">Dịch vụ</a>
        <span className="h-4 w-px bg-neutral-200"></span>
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-3 hover:bg-neutral-50 rounded-full transition-all cursor-pointer border border-neutral-200"
            >
              <div className="w-8.5 h-8.5 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-sm font-semibold text-neutral-800 leading-tight">{user.fullName}</span>
                <span className="text-[10px] text-neutral-400 capitalize leading-none mt-0.5">{user.role}</span>
              </div>
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-neutral-200 shadow-lg py-1.5 z-50">
                <div className="px-4 py-2.5 border-b border-neutral-100">
                  <p className="text-xs text-neutral-400">Tài khoản</p>
                  <p className="text-sm font-bold text-neutral-800 truncate mt-0.5">{user.fullName}</p>
                  <p className="text-xs text-neutral-500 truncate capitalize mt-0.5">{user.role}</p>
                </div>
                <div className="py-1">
                  <Link
                    href={user.role === ROLES.ADMIN || user.role === ROLES.EMPLOYEE ? '/admin' : '/customer/dashboard'}
                    onClick={() => setIsOpen(false)}
                    className="w-full text-left block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                  >
                    Vào Dashboard
                  </Link>
                  <Link
                    href={user.role === ROLES.ADMIN || user.role === ROLES.EMPLOYEE ? '/admin' : '/customer/dashboard'}
                    onClick={() => setIsOpen(false)}
                    className="w-full text-left block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                  >
                    Trang cá nhân (Profile)
                  </Link>
                </div>
                <div className="border-t border-neutral-100 pt-1 mt-1">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={onLoginClick}
              className="text-sm text-neutral-600 hover:text-neutral-900 font-semibold cursor-pointer transition-all"
            >
              Đăng nhập
            </button>
            <button
              onClick={onRegisterClick}
              className="text-sm bg-brand text-white hover:bg-brand-hover px-5 py-2.5 rounded-lg font-semibold transition-all cursor-pointer"
            >
              Đăng ký
            </button>
          </>
        )}
      </nav>
    </header>
  );
};
