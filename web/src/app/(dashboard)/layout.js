"use client"
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Loading } from '@/components/ui/Loading';
import { ROLES } from '@/constants';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || (user.role !== ROLES.ADMIN && user.role !== ROLES.RENTAL_MANAGER && user.role !== ROLES.SECURITY))) {
      router.push('/?showLogin=true');
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!user || (user.role !== ROLES.ADMIN && user.role !== ROLES.RENTAL_MANAGER && user.role !== ROLES.SECURITY)) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F7]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <div className=" mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
