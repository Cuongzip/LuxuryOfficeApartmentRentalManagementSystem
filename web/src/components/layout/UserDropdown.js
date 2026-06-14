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
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-neutral-100 shadow-xl py-2 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-neutral-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-base shadow-inner shrink-0 select-none">
              {user.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-neutral-800 truncate leading-snug">{user.fullName}</h4>
              <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1.5 capitalize ${
                user.role === ROLES.ADMIN 
                  ? 'bg-red-50 text-red-600 border border-red-100/50' 
                  : user.role === ROLES.CUSTOMER 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' 
                  : 'bg-blue-50 text-blue-600 border border-blue-100/50'
              }`}>
                {user.role}
              </span>
            </div>
          </div>

          {/* Body Links */}
          <div className="p-1.5 space-y-0.5">
            <Link
              href={dashboardHref}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-all font-medium"
            >
              <svg className="w-4.5 h-4.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              Vào Dashboard
            </Link>
            
            <Link
              href={dashboardHref}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-all font-medium"
            >
              <svg className="w-4.5 h-4.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Trang cá nhân
            </Link>
          </div>

          {/* Footer logout */}
          <div className="border-t border-neutral-50 p-1.5 mt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all font-semibold cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
