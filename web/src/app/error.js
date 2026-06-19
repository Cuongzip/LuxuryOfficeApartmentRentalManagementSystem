'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function RootError({ error, reset }) {
  useEffect(() => {
    console.error('Lỗi ứng dụng hệ thống:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] px-6 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-red-100 shadow-xl overflow-hidden p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100 shadow-sm animate-bounce">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
          Đã xảy ra sự cố hệ thống
        </h2>
        <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
          Đã xảy ra lỗi không mong muốn trong quá trình xử lý dữ liệu. Vui lòng tải lại trang hoặc quay lại trang chủ.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-50/50 rounded-lg text-left border border-red-100/50">
            <p className="text-[10px] font-bold text-red-800 uppercase tracking-wider">Thông tin chi tiết:</p>
            <p className="text-xs text-red-700 font-mono mt-1 break-all bg-white/80 p-2.5 rounded border border-red-100 max-h-32 overflow-y-auto">
              {error.message || 'Lỗi không xác định'}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            className="w-full sm:w-auto text-sm"
            onClick={() => window.location.href = '/'}
          >
            Về trang chủ
          </Button>
          <Button
            variant="primary"
            className="w-full sm:w-auto text-sm"
            onClick={() => reset()}
          >
            Thử lại
          </Button>
        </div>
      </div>
    </div>
  );
}
