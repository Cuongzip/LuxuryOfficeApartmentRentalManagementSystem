'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export const Header = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  // Simple path parser for display name
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Tổng quan';
    if (pathname.includes('/admin/buildings')) return 'Quản lý tòa nhà';
    if (pathname.includes('/admin/rooms')) return 'Quản lý phòng';
    return 'Dashboard';
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-semibold text-blue-950">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* Simple Notification Placeholder */}
        <button className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        {/* User Info Capsule */}
        <div className="flex items-center gap-2 border border-slate-200 rounded-full py-1.5 pl-2.5 pr-4 bg-slate-50">
          <div className="w-6 h-6 rounded-full bg-blue-950 text-white flex items-center justify-center font-bold text-xs">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <span className="text-sm font-medium text-slate-700">
            {user?.fullName || 'Administrator'}
          </span>
        </div>
      </div>
    </header>
  );
};
