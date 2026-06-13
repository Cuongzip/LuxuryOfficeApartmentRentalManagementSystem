'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await login(email, password);
      // If user is Admin or Employee, redirect to admin dashboard
      if (data.account.role === 'Admin' || data.account.role === 'Employee') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="!border-zinc-800 bg-zinc-900 text-zinc-100 p-8 shadow-2xl">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold text-xl mb-4">
          L
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Chào mừng trở lại</h2>
        <p className="text-sm text-zinc-400 mt-2 text-center">
          Hệ thống quản lý căn hộ & văn phòng dịch vụ cao cấp
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-red-950/50 border border-red-800/50 rounded-lg text-sm text-red-400 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Địa chỉ Email"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@luxuryrental.vn"
          required
          className="text-white"
          inputClassName="bg-zinc-950/50 border-zinc-800 focus:ring-zinc-700 focus:border-transparent text-white"
        />

        <Input
          label="Mật khẩu"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="text-white"
          inputClassName="bg-zinc-950/50 border-zinc-800 focus:ring-zinc-700 focus:border-transparent text-white"
        />

        <div className="flex justify-between items-center text-sm pt-1">
          <label className="flex items-center gap-2 text-zinc-400 cursor-pointer select-none">
            <input type="checkbox" className="rounded border-zinc-800 bg-zinc-950 text-zinc-500 focus:ring-0 focus:ring-offset-0" />
            Ghi nhớ đăng nhập
          </label>
          <a href="#" className="text-zinc-300 hover:text-white font-medium">Quên mật khẩu?</a>
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full mt-4 !bg-white !text-zinc-950 hover:!bg-zinc-200"
        >
          Đăng nhập
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-zinc-400 border-t border-zinc-800 pt-6">
        Chưa có tài khoản khách thuê?{' '}
        <Link href="/register" className="text-white hover:underline font-semibold">
          Đăng ký ngay
        </Link>
      </div>
    </Card>
  );
}
