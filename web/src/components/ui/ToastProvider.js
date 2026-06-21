'use client';

import React from 'react';
import { Toaster, ToastBar, toast } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#171717',
          borderRadius: '12px',
          border: '1px solid rgba(229, 229, 229, 0.8)',
          padding: '0px',
          fontSize: '13px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgb(0 0 0 / 0.05), 0 2px 4px rgb(0 0 0 / 0.02)',
          maxWidth: '380px',
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t} style={{ ...t.style, padding: 0 }}>
          {({ icon, message }) => (
            <div className="flex items-center w-full px-3.5 py-2.5 text-left">
              <span className="shrink-0 flex items-center">{icon}</span>
              <div className="ml-2.5 flex-1 pr-2 text-neutral-800 font-semibold leading-relaxed text-xs text-left">
                {message}
              </div>
              {t.type !== 'loading' && (
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="p-1 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors shrink-0 cursor-pointer flex items-center justify-center"
                  title="Đóng"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}
