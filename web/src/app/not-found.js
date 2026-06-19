import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F7] px-6 py-12 text-center animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-100 shadow-xl overflow-hidden p-8 md:p-12 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0B203E]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#0B203E]/5 rounded-full blur-3xl"></div>

        <h1 className="text-8xl font-black tracking-widest text-[#0B203E]/10 bg-clip-text select-none animate-pulse">
          404
        </h1>

        <h2 className="text-xl font-bold text-neutral-900 mt-6 tracking-tight">
          Không tìm thấy trang yêu cầu
        </h2>
        <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
          Đường dẫn này không tồn tại hoặc đã được thay đổi. Vui lòng quay về trang chủ để tiếp tục trải nghiệm.
        </p>

        <div className="my-8 py-4 border-y border-neutral-100 flex items-center justify-center gap-4 text-sm font-semibold text-[#0B203E]">
          <Link href="/" className="hover:text-[#1D4275] transition-colors">
            Trang chủ
          </Link>
          <span className="text-neutral-300">|</span>
          <Link href="/search" className="hover:text-[#1D4275] transition-colors">
            Tìm kiếm phòng
          </Link>
        </div>

        <Link 
          href="/" 
          className="inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer bg-[#0B203E] text-white hover:bg-[#1D4275] focus:ring-[#0B203E] h-11 px-6 text-base w-full shadow-md hover:shadow-lg"
        >
          Quay lại Trang chủ
        </Link>
      </div>
    </div>
  );
}
