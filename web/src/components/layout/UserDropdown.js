'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/constants';

export const UserDropdown = ({ variant = 'light' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
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

  if (!user) return null;

  const dashboardHref = user.role === ROLES.ADMIN || user.role === ROLES.EMPLOYEE ? '/admin' : '/customer/dashboard';
  const isDark = variant === 'dark';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 p-1.5 pr-3 transition-all cursor-pointer border rounded-full ${
          isDark
            ? 'hover:bg-white/10 border-white/10 bg-white/5 text-white'
            : 'hover:bg-neutral-50 border-neutral-200 bg-white text-neutral-800'
        }`}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm select-none ${
          isDark
            ? 'bg-white text-brand'
            : 'bg-brand text-white'
        }`}>
          {user.fullName?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className={`hidden md:inline text-sm font-semibold leading-tight ${
          isDark ? 'text-white/95' : 'text-neutral-800'
        }`}>
          {user.fullName}
        </span>
        <svg className={`w-4 h-4 transition-transform ${
          isDark ? 'text-white/70' : 'text-neutral-500'
        } ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
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
              href={dashboardHref}
              onClick={() => setIsOpen(false)}
              className="w-full text-left block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
            >
              Vào Dashboard
            </Link>
            <Link
              href={dashboardHref}
              onClick={() => setIsOpen(false)}
              className="w-full text-left block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
            >
              Trang cá nhân
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
  );
};
