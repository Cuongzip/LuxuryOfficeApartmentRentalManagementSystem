import React from 'react';
import Link from 'next/link';
import { UserDropdown } from './UserDropdown';

export const PublicHeader = ({
  user,
  onLoginClick,
  onRegisterClick,
}) => {
  return (
    <header className="min-h-16 py-3 md:py-0 md:h-20 border-b border-white/10 bg-brand flex flex-col md:flex-row items-center justify-between px-4 md:px-16 sticky top-0 z-50 text-white gap-4 shadow-md">
      {/* Logo and Mobile Auth Row */}
      <div className="w-full flex items-center justify-between md:w-auto">
        <Link href="/">
          <img src="/images/logo.png" alt="Logo" className="w-36 md:w-45 object-contain" />
        </Link>
        <div className="md:hidden flex items-center gap-3">
          {user ? (
            <UserDropdown variant="dark" />
          ) : (
            <button
              onClick={onLoginClick}
              className="text-xs bg-white text-brand hover:bg-white/90 px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer shadow-sm"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>

      {/* Desktop Auth / Nav */}
      <nav className="hidden md:flex items-center gap-6">
        <a href="#features" className="text-sm text-white/80 hover:text-white transition-all font-medium">Dịch vụ</a>
        <span className="h-4 w-px bg-white/20"></span>
        {user ? (
          <UserDropdown variant="dark" />
        ) : (
          <>
            <button
              onClick={onLoginClick}
              className="text-sm text-white/80 hover:text-white font-semibold cursor-pointer transition-all"
            >
              Đăng nhập
            </button>
            <button
              onClick={onRegisterClick}
              className="text-sm bg-white text-brand hover:bg-white/90 px-5 py-2.5 rounded-lg font-semibold transition-all cursor-pointer shadow-sm"
            >
              Đăng ký
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

