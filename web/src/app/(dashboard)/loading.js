import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-2xl border border-neutral-100 p-8">
      <div className="flex flex-col items-center gap-4">
        <svg 
          className="animate-spin h-10 w-10 text-[#0B203E]" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
          />
        </svg>
        <span className="text-xs font-semibold text-neutral-500 tracking-wider uppercase animate-pulse">
          Đang tải dữ liệu trang quản trị...
        </span>
      </div>
    </div>
  );
}
