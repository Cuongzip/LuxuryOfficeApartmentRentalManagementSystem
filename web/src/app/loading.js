'use client';

import React from 'react';

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F5F5F7] transition-all duration-300">
      <div className="relative flex flex-col items-center gap-5">
        <div className="absolute -inset-4 rounded-full bg-[#0B203E]/5 blur-2xl animate-pulse"></div>
        
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-neutral-200/80"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#0B203E] border-t-transparent animate-spin"></div>
        </div>
        
        <div className="mt-3 text-center z-10">
          <span className="text-xl font-extrabold tracking-wider text-[#0B203E] font-sans">
            Prime<span className="text-neutral-500 font-medium">Space</span>
          </span>
          <p className="text-xs text-neutral-400 font-medium mt-1.5 tracking-wide animate-pulse">
            Đang tải dữ liệu hệ thống...
          </p>
        </div>
      </div>
    </div>
  );
}
