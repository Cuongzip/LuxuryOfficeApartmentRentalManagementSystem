'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    console.error('Lỗi phân hệ quản lý:', error);
  }, [error]);

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 text-center animate-in fade-in duration-200">
      <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-5 border border-amber-100 shadow-sm animate-pulse">
        <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
        Không thể tải phân hệ quản trị
      </h3>
      <p className="text-sm text-neutral-500 mt-2 max-w-md leading-relaxed">
        Có lỗi xảy ra khi kết nối máy chủ dữ liệu hoặc xử lý chức năng. Vui lòng thử tải lại hoặc liên hệ quản trị viên.
      </p>

      {error && (
        <div className="mt-5 max-w-md w-full p-3 bg-neutral-50 rounded-lg text-left border border-neutral-100">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Mã lỗi & chi tiết:</p>
          <p className="text-xs text-neutral-600 font-mono mt-1 break-all bg-white p-2.5 rounded border border-neutral-100 max-h-32 overflow-y-auto">
            {error.message || 'Lỗi không xác định'}
          </p>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
        >
          Tải lại trang
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => reset()}
        >
          Thử lại
        </Button>
      </div>
    </div>
  );
}
