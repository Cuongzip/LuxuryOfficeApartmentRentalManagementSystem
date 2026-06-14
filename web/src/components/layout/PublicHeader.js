import React from 'react';
import Link from 'next/link';
import { UserDropdown } from './UserDropdown';

export const PublicHeader = ({ user, onLoginClick, onRegisterClick }) => {
  return (
    <header className="h-16 border-b border-white/10 bg-brand flex items-center justify-between px-8 md:px-16 sticky top-0 z-50 text-white">
      <Link href="/">
        <img src="/images/logo.png" alt="Logo" className="w-45 object-contain" />
      </Link>
      <nav className="flex items-center gap-6">
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
