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
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* Simple Notification Placeholder */}
        <button className="p-2 text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        {/* User Info Capsule */}
        <div className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-800 rounded-full py-1.5 pl-2.5 pr-4 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="w-6 h-6 rounded-full bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {user?.fullName || 'Administrator'}
          </span>
        </div>
      </div>
    </header>
  );
};
