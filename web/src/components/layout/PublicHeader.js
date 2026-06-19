import React from 'react';
import Link from 'next/link';
import { UserDropdown } from './UserDropdown';

export const PublicHeader = ({
  user,
  onLoginClick,
  onRegisterClick,
  // Search props
  searchKeyword,
  setSearchKeyword,
  draftCity,
  setDraftCity,
  draftDistrict,
  setDraftDistrict,
  draftWard,
  setDraftWard,
  draftRoomType,
  setDraftRoomType,
  tempCity,
  setTempCity,
  tempDistrict,
  setTempDistrict,
  tempWard,
  setTempWard,
  isLocationOpen,
  setIsLocationOpen,
  isRoomTypeOpen,
  setIsRoomTypeOpen,
  handleSearch,
  cities,
  districts,
  wards,
  uniqueRoomTypes,
  appliedKeyword,
  appliedCity,
  appliedDistrict,
  appliedWard,
  appliedRoomType,
  handleClearFilters
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

      {/* Header Search Bar (Visible on both Mobile and Desktop) */}
      <div className="w-full md:max-w-2xl bg-white p-1.5 md:p-2 rounded-full border border-neutral-200 shadow-sm flex flex-col md:flex-row items-center gap-2 relative z-30 text-neutral-900">
        {/* Search Input */}
        <div className="flex-1 w-full flex items-center gap-2 pl-3 md:border-r border-neutral-100">
          <svg className="w-4 h-4 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm bất động sản..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full bg-transparent text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none py-1.5"
          />
        </div>

        {/* Location selector */}
        <div className="relative w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              setIsLocationOpen(!isLocationOpen);
              setIsRoomTypeOpen(false);
            }}
            className="w-full md:w-auto flex items-center justify-between md:justify-start gap-1.5 px-3 py-1.5 hover:bg-neutral-50 rounded-full cursor-pointer transition-colors text-xs text-neutral-700 font-semibold md:border-r border-neutral-100"
          >
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-brand shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="max-w-[120px] truncate">
                {draftDistrict || draftCity || "Toàn quốc"}
              </span>
            </div>
            <svg className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Location Popover */}
          {isLocationOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsLocationOpen(false)}></div>
              <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 md:-translate-x-0 md:left-0 w-72 bg-white border border-neutral-200 rounded-xl shadow-xl z-20 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                <h4 className="font-bold text-center text-neutral-800 text-xs border-b border-neutral-100 pb-1.5">Khu vực</h4>
                
                {/* City */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-semibold text-neutral-500">Chọn tỉnh thành *</label>
                  <select
                    value={tempCity}
                    onChange={(e) => {
                      setTempCity(e.target.value);
                      setTempDistrict('');
                      setTempWard('');
                    }}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs bg-white text-neutral-800 focus:outline-none"
                  >
                    <option value="">Tất cả tỉnh thành</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* District */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-semibold text-neutral-500">Chọn quận huyện *</label>
                  <select
                    value={tempDistrict}
                    onChange={(e) => {
                      setTempDistrict(e.target.value);
                      setTempWard('');
                    }}
                    disabled={!tempCity}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs bg-white text-neutral-800 focus:outline-none disabled:bg-neutral-50 disabled:text-neutral-400"
                  >
                    <option value="">Chọn quận huyện</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Ward */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-semibold text-neutral-500">Chọn phường xã *</label>
                  <select
                    value={tempWard}
                    onChange={(e) => setTempWard(e.target.value)}
                    disabled={!tempDistrict}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs bg-white text-neutral-800 focus:outline-none disabled:bg-neutral-50 disabled:text-neutral-400"
                  >
                    <option value="">Chọn phường xã</option>
                    {wards.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => {
                    setDraftCity(tempCity);
                    setDraftDistrict(tempDistrict);
                    setDraftWard(tempWard);
                    setIsLocationOpen(false);
                  }}
                  className="w-full py-2 bg-brand hover:bg-brand-hover text-white font-bold rounded-lg transition-colors cursor-pointer text-xs shadow-sm"
                >
                  Áp dụng
                </button>
              </div>
            </>
          )}
        </div>

        {/* Room Type Selector */}
        <div className="relative w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              setIsRoomTypeOpen(!isRoomTypeOpen);
              setIsLocationOpen(false);
            }}
            className="w-full md:w-auto flex items-center justify-between md:justify-start gap-1.5 px-3 py-1.5 hover:bg-neutral-50 rounded-full cursor-pointer transition-colors text-xs text-neutral-700 font-semibold"
          >
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="max-w-[100px] truncate">
                {draftRoomType || "Loại hình BĐS"}
              </span>
            </div>
            <svg className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Room Type Popover */}
          {isRoomTypeOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsRoomTypeOpen(false)}></div>
              <div className="absolute top-full mt-3 right-0 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-20 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => {
                    setDraftRoomType('');
                    setIsRoomTypeOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs hover:bg-neutral-50 text-neutral-700 cursor-pointer font-medium"
                >
                  Tất cả loại hình
                </button>
                {uniqueRoomTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setDraftRoomType(type);
                      setIsRoomTypeOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs hover:bg-neutral-50 text-neutral-700 cursor-pointer font-medium"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Find Home Button */}
        <button
          onClick={handleSearch}
          className="w-full md:w-auto px-5 py-2 bg-brand hover:bg-brand-hover text-white font-bold rounded-full transition-colors cursor-pointer text-xs shadow-sm select-none"
        >
          Tìm nhà
        </button>
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

