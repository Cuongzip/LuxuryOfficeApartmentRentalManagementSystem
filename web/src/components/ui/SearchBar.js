import React, { useState } from 'react';

export const SearchBar = ({
  variant = 'banner',
  searchKeyword,
  setSearchKeyword,
  draftCity,
  setDraftCity,
  draftDistrict,
  setDraftDistrict,
  draftWard,
  setDraftWard,
  tempCity,
  setTempCity,
  tempDistrict,
  setTempDistrict,
  tempWard,
  setTempWard,
  cities,
  districts,
  wards,
  handleSearch,
}) => {
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const onApply = () => {
    setDraftCity(tempCity);
    setDraftDistrict(tempDistrict);
    setDraftWard(tempWard);
    setIsLocationOpen(false);
  };

  const onSearchClick = () => {
    setIsLocationOpen(false);
    handleSearch();
  };

  if (variant === 'header') {
    return (
      <div className="w-full md:max-w-2xl bg-white p-1.5 md:p-2 rounded-full border border-neutral-200 shadow-sm flex flex-col md:flex-row items-center gap-2 relative z-30 text-neutral-900">
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

        <div className="relative w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              setIsLocationOpen(!isLocationOpen);
            }}
            className="w-full md:w-auto flex items-center justify-between md:justify-start gap-1.5 px-3 py-1.5 hover:bg-neutral-50 rounded-full cursor-pointer transition-colors text-xs text-neutral-700 font-semibold"
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

          {isLocationOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsLocationOpen(false)}></div>
              <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 md:-translate-x-0 md:left-0 w-72 bg-white border border-neutral-200 rounded-xl shadow-xl z-20 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                <h4 className="font-bold text-center text-neutral-800 text-xs border-b border-neutral-100 pb-1.5">Khu vực</h4>
                
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

                <button
                  onClick={onApply}
                  className="w-full py-2 bg-brand hover:bg-brand-hover text-white font-bold rounded-lg transition-colors cursor-pointer text-xs shadow-sm"
                >
                  Áp dụng
                </button>
              </div>
            </>
          )}
        </div>

        <button
          onClick={onSearchClick}
          className="w-full md:w-auto px-5 py-2 bg-brand hover:bg-brand-hover text-white font-bold rounded-full transition-colors cursor-pointer text-xs shadow-sm select-none"
        >
          Tìm nhà
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:flex w-full bg-white p-1.5 rounded-full border border-neutral-200/80 shadow-sm items-center gap-1 relative z-30 text-neutral-900">
        <div className="flex-1 flex items-center gap-2 pl-3 border-r border-neutral-100">
          <svg className="w-4 h-4 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm bất động sản..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full bg-transparent text-sm lg:text-base text-neutral-900 placeholder-neutral-400 focus:outline-none py-1.5"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsLocationOpen(!isLocationOpen);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-neutral-50 rounded-full cursor-pointer transition-colors text-sm lg:text-base text-neutral-700 font-semibold select-none"
          >
            <svg className="w-3.5 h-3.5 text-brand shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="max-w-[110px] truncate">
              {draftDistrict || draftCity || "Toàn quốc"}
            </span>
            <svg className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isLocationOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsLocationOpen(false)}></div>
              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-72 bg-white border border-neutral-200 rounded-xl shadow-xl z-20 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-150 text-left">
                <h4 className="font-bold text-center text-neutral-800 text-xs border-b border-neutral-100 pb-1.5">Khu vực</h4>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-neutral-500">Tỉnh thành</label>
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

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-neutral-500">Quận huyện</label>
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

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-neutral-500">Phường xã</label>
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

                <button
                  onClick={onApply}
                  className="w-full py-2 bg-brand hover:bg-brand-hover text-white font-bold rounded-lg transition-colors cursor-pointer text-sm"
                >
                  Áp dụng
                </button>
              </div>
            </>
          )}
        </div>

        <button
          onClick={onSearchClick}
          className="px-7 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold rounded-full transition-colors cursor-pointer text-sm lg:text-base ml-1 select-none shadow-sm"
        >
          Tìm kiếm
        </button>
      </div>

      <div className="block md:hidden bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-sm space-y-3 text-neutral-900">
        <div className="flex items-center gap-2 px-2 py-1.5 border-b border-neutral-100">
          <svg className="w-4 h-4 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm bất động sản..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full bg-transparent text-base text-neutral-900 placeholder-neutral-400 focus:outline-none"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsLocationOpen(!isLocationOpen);
            }}
            className="w-full flex items-center justify-between gap-1.5 px-2 py-2 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors text-base text-neutral-700 font-semibold"
          >
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-brand shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>{draftDistrict || draftCity || "Khu vực"}</span>
            </div>
            <svg className="w-3.5 h-3.5 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isLocationOpen && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-neutral-200 rounded-xl shadow-xl z-20 p-4 space-y-3 text-left">
              <h4 className="font-bold text-center text-neutral-800 text-base border-b border-neutral-100 pb-1.5">Khu vực</h4>
              <div className="flex flex-col gap-1">
                <select
                  value={tempCity}
                  onChange={(e) => {
                    setTempCity(e.target.value);
                    setTempDistrict('');
                    setTempWard('');
                  }}
                  className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-lg text-base bg-white text-neutral-800 focus:outline-none"
                >
                  <option value="">Tất cả tỉnh thành</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <select
                  value={tempDistrict}
                  onChange={(e) => {
                    setTempDistrict(e.target.value);
                    setTempWard('');
                  }}
                  disabled={!tempCity}
                  className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-lg text-base bg-white text-neutral-800 focus:outline-none disabled:bg-neutral-50 disabled:text-neutral-400"
                >
                  <option value="">Chọn quận huyện</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <select
                  value={tempWard}
                  onChange={(e) => setTempWard(e.target.value)}
                  disabled={!tempDistrict}
                  className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-lg text-base bg-white text-neutral-800 focus:outline-none disabled:bg-neutral-50 disabled:text-neutral-400"
                >
                  <option value="">Chọn phường xã</option>
                  {wards.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <button
                onClick={onApply}
                className="w-full py-2.5 bg-brand text-white font-bold rounded-lg text-base"
              >
                Áp dụng
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onSearchClick}
          className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl text-base transition-colors"
        >
          Tìm kiếm
        </button>
      </div>
    </>
  );
};
