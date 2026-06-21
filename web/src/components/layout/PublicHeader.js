import React from 'react';
import Link from 'next/link';
import { UserDropdown } from './UserDropdown';
import { SearchBar } from '../ui/SearchBar';

export const PublicHeader = ({
  user,
  onLoginClick,
  onRegisterClick,
  showSearch = false,
  searchProps = {},
}) => {
  return (
    <header className={
      showSearch
        ? "min-h-16 py-3 md:py-0 md:h-20 border-b border-white/10 bg-brand flex flex-col md:grid md:grid-cols-[1fr_2fr_1fr] items-center px-4 md:px-16 sticky top-0 z-50 text-white gap-4 shadow-md"
        : "min-h-16 py-3 md:py-0 md:h-20 border-b border-white/10 bg-brand flex flex-col md:flex-row items-center justify-between px-4 md:px-16 sticky top-0 z-50 text-white gap-4 shadow-md"
    }>
      <div className="w-full flex items-center justify-between md:justify-start md:w-auto shrink-0">
        <Link href="/">
          <img src="/images/logo.png" alt="Logo" className="w-36 md:w-45 object-contain brightness-0 invert" />
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

      {showSearch ? (
        <div className="w-full flex justify-center">
          <div className="w-full md:max-w-2xl px-2 md:px-0">
            <SearchBar variant="header" {...searchProps} />
          </div>
        </div>
      ) : (
        <div className="hidden md:block"></div>
      )}

      <nav className={
        showSearch
          ? "hidden md:flex items-center justify-end gap-6 shrink-0"
          : "hidden md:flex items-center gap-6 shrink-0"
      }>

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

