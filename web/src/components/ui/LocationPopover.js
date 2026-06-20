import React from 'react';

export const LocationPopover = ({
  onClose,
  positionClass,
  tempCity,
  setTempCity,
  tempWard,
  setTempWard,
  cities,
  wards,
  onClear,
  onApply,
}) => {
  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose}></div>
      <div className={`absolute ${positionClass} w-72 bg-white border border-neutral-200 rounded-xl shadow-xl z-20 p-4 space-y-3 animate-in fade-in duration-150 text-left text-neutral-900`}>
        <h4 className="font-bold text-center text-neutral-800 text-xs border-b border-neutral-100 pb-1.5">Khu vực</h4>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-neutral-500">Tỉnh thành</label>
          <select
            value={tempCity}
            onChange={(e) => {
              setTempCity(e.target.value);
              setTempWard('');
            }}
            className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs bg-white text-neutral-800 focus:outline-none"
          >
            <option value="">Tất cả tỉnh thành</option>
            {cities && cities.map(c => <option key={c.id || c} value={c.id || c}>{c.name || c}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-neutral-500">Phường xã</label>
          <select
            value={tempWard}
            onChange={(e) => setTempWard(e.target.value)}
            disabled={!tempCity}
            className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs bg-white text-neutral-800 focus:outline-none disabled:bg-neutral-50 disabled:text-neutral-400"
          >
            <option value="">Chọn phường xã</option>
            {wards && wards.map(w => <option key={w.id || w} value={w.id || w}>{w.name || w}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-lg transition-colors cursor-pointer text-xs"
          >
            Xóa lọc
          </button>
          <button
            type="button"
            onClick={onApply}
            className="flex-1 py-2 bg-brand hover:bg-brand-hover text-white font-bold rounded-lg transition-colors cursor-pointer text-xs shadow-sm"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </>
  );
};
