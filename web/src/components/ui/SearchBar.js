import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { LocationPopover } from './LocationPopover';

export const SearchBar = ({
  variant = 'banner',
  searchKeyword,
  setSearchKeyword,
  draftCity,
  setDraftCity,
  draftWard,
  setDraftWard,
  tempCity,
  setTempCity,
  tempWard,
  setTempWard,
  cities,
  wards,
  handleSearch,
}) => {
  const pathname = usePathname();
  const isSearchPage = pathname === '/search';
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const getSelectedLocationName = () => {
    if (draftWard && wards?.length > 0) {
      const foundWard = wards.find(w => (w.id || w) === draftWard);
      if (foundWard) return foundWard.name || foundWard;
    }
    if (draftCity && cities?.length > 0) {
      const foundCity = cities.find(c => (c.id || c) === draftCity);
      if (foundCity) return foundCity.name || foundCity;
    }
    return "Toàn quốc";
  };

  const onApply = () => {
    setDraftCity(tempCity);
    setDraftWard(tempWard);
    setIsLocationOpen(false);
    if (isHeader && handleSearch && isSearchPage) {
      handleSearch(tempCity, tempWard);
    }
  };

  const onClear = () => {
    setTempCity('');
    setTempWard('');
    setDraftCity('');
    setDraftWard('');
    setIsLocationOpen(false);
    if (isHeader && handleSearch && isSearchPage) {
      handleSearch('', '');
    }
  };

  const onSearchClick = () => {
    setIsLocationOpen(false);
    handleSearch();
  };

  const isHeader = variant === 'header';

  return (
    <div className={`flex w-full bg-white relative z-30 text-neutral-900 items-center gap-2 border border-neutral-200 shadow-sm rounded-full ${
      isHeader ? 'p-1' : 'p-1.5'
    }`}>
      <div className="flex-1 flex items-center gap-2 pl-3 border-r border-neutral-100">
        <svg className="w-4 h-4 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Tìm tòa nhà..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className={`w-full bg-transparent text-neutral-900 placeholder-neutral-400 focus:outline-none py-1.5 ${
            isHeader ? 'text-xs' : 'text-sm lg:text-base'
          }`}
        />
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsLocationOpen(!isLocationOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 hover:bg-neutral-50 rounded-full cursor-pointer transition-colors text-neutral-700 font-semibold select-none ${
            isHeader ? 'text-xs' : 'text-sm lg:text-base'
          }`}
        >
          <svg className="w-3.5 h-3.5 text-brand shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="max-w-[120px] truncate">
            {getSelectedLocationName()}
          </span>
          <svg className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isLocationOpen && (
          <LocationPopover
            onClose={() => setIsLocationOpen(false)}
            positionClass="top-full mt-3 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-0"
            tempCity={tempCity}
            setTempCity={setTempCity}
            tempWard={tempWard}
            setTempWard={setTempWard}
            cities={cities}
            wards={wards}
            onClear={onClear}
            onApply={onApply}
          />
        )}
      </div>

      <button
        onClick={onSearchClick}
        className={`bg-brand hover:bg-brand-hover text-white font-bold rounded-full transition-colors cursor-pointer shadow-sm select-none shrink-0 ${
          isHeader ? 'px-5 py-2 text-xs' : 'px-7 py-2.5 text-sm lg:text-base ml-1'
        }`}
      >
        Tìm kiếm
      </button>
    </div>
  );
};
