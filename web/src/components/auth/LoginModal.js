'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

export const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
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
      onClose(); // Close the modal
      
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
    <Modal isOpen={isOpen} onClose={onClose} title="Đăng nhập hệ thống" size="md">
      <div className="flex flex-col items-center mb-6">
        <div className="w-10 h-10 rounded-lg bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 flex items-center justify-center font-bold text-lg mb-2">
          L
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
          Quản lý căn hộ & văn phòng dịch vụ cao cấp
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Địa chỉ Email"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@luxuryrental.vn"
          required
        />

        <Input
          label="Mật khẩu"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <div className="flex justify-between items-center text-xs pt-1">
          <label className="flex items-center gap-1.5 text-zinc-500 cursor-pointer select-none">
            <input type="checkbox" className="rounded border-zinc-200 text-zinc-600 focus:ring-0 focus:ring-offset-0" />
            Ghi nhớ đăng nhập
          </label>
          <a href="#" className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 font-medium">
            Quên mật khẩu?
          </a>
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full mt-2"
        >
          Đăng nhập
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-zinc-500 border-t border-zinc-100 dark:border-zinc-900 pt-4">
        Chưa có tài khoản khách thuê?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-zinc-900 dark:text-zinc-100 hover:underline font-semibold cursor-pointer"
        >
          Đăng ký ngay
        </button>
      </div>
    </Modal>
  );
};
