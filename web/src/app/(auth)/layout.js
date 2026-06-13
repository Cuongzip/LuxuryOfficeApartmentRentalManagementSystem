import React from 'react';

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 relative overflow-hidden">
      {/* Visual decorative background element */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-zinc-800/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-zinc-800/10 blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md z-10">
        {children}
      </div>
    </div>
  );
}
